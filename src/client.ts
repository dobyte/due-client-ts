import { Packer, Message, Packet } from "./packer";
import { HandshakeClient, HandshakeVerifier, RandomSource, SecureSession } from "./security";

// 默认握手超时时间（毫秒）
const DEFAULT_HANDSHAKE_TIMEOUT = 5000;

// 消息方向（与 security 模块保持一致）
const CLIENT_TO_SERVER = 0;
const SERVER_TO_CLIENT = 1;

/**
 * 会话安全配置
 *
 * 与 Unity 版 SecurityOptions 对齐：
 * verifier 为服务端签名校验器（Verifier.ecdsa / Verifier.rsa），
 * suites 为协商套件，handshakeTimeout 为握手超时。
 */
export interface SecurityOptions {
    // 服务端签名校验器；由 Verifier.ecdsa / Verifier.rsa 创建
    verifier: HandshakeVerifier;
    // 允许协商的 AEAD 套件，默认为 [AES-256-GCM, ChaCha20-Poly1305]
    suites?: number[];
    // 握手超时时间（毫秒），默认 5000，小于等于 0 表示不限制
    handshakeTimeout?: number;
    // 随机字节源；原生平台未提供 crypto.getRandomValues 时需要注入
    random?: RandomSource;
}

/**
 * 客户端配置
 */
export interface ClientOptions {
    // 连接地址
    url: string;
    // 打包器
    packer: Packer;
    // 心跳间隔，大于0则开启心跳
    heartbeat: number;
    // 会话安全配置；不配置则不启用
    security?: SecurityOptions;
}

/**
 * 连接打开回调
 */
export interface ConnectHandler {
    (client: Client): any
}

/**
 * 连接关闭回调
 */
export interface DisconnectHandler {
    (client: Client): any
}

/**
 * 接收消息回调
 */
export interface ReceiveHandler {
    (client: Client, message: Message): any
}

/**
 * 错误回调
 */
export interface ErrorHandler {
    (client: Client): any
}

/**
 * 心跳回调
 */
export interface HeartbeatHandler {
    (client: Client, millisecond?: number): any
}

/**
 * 客户端
 */
export class Client {
    // 连接打开hook函数
    private connectHandler?: ConnectHandler;
    // 连接关闭hook函数
    private disconnectHandler?: DisconnectHandler;
    // 接收消息hook函数
    private receiveHandler?: ReceiveHandler;
    // 错误处理hook函数
    private errorHandler?: ErrorHandler;
    // 心跳处理hook函数
    private heartbeatHandler?: HeartbeatHandler;
    // 客户端配置
    private opts: ClientOptions;
    // websocket
    private websocket?: WebSocket;
    // 定时器ID
    private intervalId: any;
    // 握手超时定时器ID
    private handshakeTimer: any;
    // 打包器
    private packer: Packer;
    // 会话安全配置
    private security?: SecurityOptions;
    // 握手客户端
    private handshake?: HandshakeClient;
    // 安全会话
    private session?: SecureSession;
    // 同步等待组
    private waitgroup: Map<number, {
        seq: number;
        callback: Map<number, (message: Message) => void>
    }>;

    public constructor(opts: ClientOptions) {
        this.opts = opts;
        this.websocket = undefined;
        this.packer = opts.packer || new Packer(opts.packer);
        this.security = opts.security;
        this.waitgroup = new Map();
    }

    /**
     * 连接服务区
     * @returns boolean
     */
    public connect(): boolean {
        try {
            this.disconnect();

            // 新建WS客户端
            const websocket = new WebSocket(this.opts.url);
            websocket.binaryType = 'arraybuffer';
            this.websocket = websocket;

            // 监听WS连接打开
            websocket.onopen = () => {
                if (this.websocket !== websocket) {
                    return;
                }

                if (this.security) {
                    try {
                        this.startHandshake(websocket);
                    } catch (error) {
                        this.failHandshake(error);
                    }
                } else {
                    this.established();
                }
            }

            // 监听WS连接关闭
            websocket.onclose = () => {
                // 忽略已被新连接替换的旧socket的关闭事件
                if (this.websocket !== websocket) {
                    return;
                }

                this.stopHeartbeat();
                this.stopHandshakeTimer();
                this.handshake = undefined;
                this.session = undefined;

                this.disconnectHandler && this.disconnectHandler(this);
            }

            // 监听WS连接错误
            websocket.onerror = () => {
                this.errorHandler && this.errorHandler(this);
            }

            // 监听WS消息
            websocket.onmessage = (e: MessageEvent) => {
                if (this.websocket !== websocket) {
                    return;
                }

                if (e.data.byteLength == 0) {
                    return;
                }

                let packet: Packet;

                try {
                    packet = this.packer.unpack(e.data);
                } catch (error) {
                    this.errorHandler && this.errorHandler(this);
                    return;
                }

                if (packet.isHandshake) {
                    this.receiveHandshake(packet.handshake || new Uint8Array(0));
                    return;
                }

                if (packet.isHeartbeat) {
                    this.heartbeatHandler && this.heartbeatHandler(this, packet.millisecond);
                    return;
                }

                if (!packet.message) {
                    return;
                }

                if (this.security) {
                    if (!this.session) {
                        this.failHandshake(new Error('security: session is not established'));
                        return;
                    }

                    try {
                        packet.message.buffer = this.session.open(
                            packet.message.buffer || new Uint8Array(0),
                            SERVER_TO_CLIENT,
                            packet.message.route,
                            packet.message.seq || 0,
                        );
                    } catch (error) {
                        this.failHandshake(error);
                        return;
                    }
                }

                this.invoke(packet.message) || this.receiveHandler && this.receiveHandler(this, packet.message);
            }

            return true
        } catch (error) {
            console.log(error)
            return false
        }
    }

    /**
     * 启动安全握手
     * @param websocket 当前连接
     * @returns void
     */
    private startHandshake(websocket: WebSocket) {
        const options = this.security!;

        // 连接可能已关闭或被新连接替换
        if (this.websocket !== websocket || !this.isConnected()) {
            return;
        }

        const verifier = options.verifier;

        if (!verifier) {
            throw new Error('security: verifier is required');
        }

        const handshake = new HandshakeClient(verifier, options.suites, options.random);
        const hello = handshake.hello();
        const timeout = options.handshakeTimeout === undefined ? DEFAULT_HANDSHAKE_TIMEOUT : options.handshakeTimeout;

        this.handshake = handshake;

        if (timeout > 0) {
            this.handshakeTimer = setTimeout(() => {
                this.failHandshake(new Error('security: handshake timeout'));
            }, timeout);
        }

        this.sendRaw(this.packer.packHandshake(hello));
    }

    /**
     * 处理服务端握手帧
     * @param frame 握手载荷
     * @returns void
     */
    private receiveHandshake(frame: Uint8Array) {
        if (!this.security || !this.handshake) {
            return;
        }

        try {
            const { session, finished } = this.handshake.handle(frame);

            // 先发布会话：网关确认后可能立即推送加密消息
            this.session = session;
            this.handshake = undefined;
            this.stopHandshakeTimer();
            this.sendRaw(this.packer.packHandshake(finished));
            this.established();
        } catch (error) {
            this.failHandshake(error);
        }
    }

    /**
     * 处理握手失败
     * @param error 错误
     * @returns void
     */
    private failHandshake(error: any) {
        this.stopHandshakeTimer();
        this.handshake = undefined;
        this.session = undefined;

        console.warn('[due] security handshake failed:', error);

        this.websocket && this.websocket.close();
        this.errorHandler && this.errorHandler(this);
    }

    /**
     * 安全握手完成（或未启用安全）后建立连接
     * @returns void
     */
    private established() {
        this.heartbeat();

        this.connectHandler && this.connectHandler(this);
    }

    /**
     * 停止握手超时定时器
     * @returns void
     */
    private stopHandshakeTimer() {
        this.handshakeTimer && clearTimeout(this.handshakeTimer);
        this.handshakeTimer = null;
    }

    /**
     * 发送原始数据
     * @param data 二进制数据
     * @returns void
     */
    private sendRaw(data: ArrayBuffer) {
        this.isConnected() && this.websocket && this.websocket.send(data);
    }

    /**
     * 断开连接
     * @returns void
     */
    public disconnect() {
        this.stopHandshakeTimer();
        this.handshake = undefined;
        this.session = undefined;

        if (!this.websocket) {
            return
        }

        this.stopHeartbeat();
        this.websocket.close();
    }

    /**
     * 停止心跳
     * @returns void
     */
    private stopHeartbeat() {
        this.intervalId && clearInterval(this.intervalId);
        this.intervalId = null;
    }

    /**
     * 启动心跳
     * @returns void
     */
    private heartbeat() {
        if (!this.opts.heartbeat || this.opts.heartbeat <= 0) {
            return;
        }

        const data = this.packer.packHeartbeat();

        this.intervalId = setInterval(() => {
            this.isConnected() && this.websocket && this.websocket.send(data);
        }, this.opts.heartbeat);
    }

    /**
     * 设置连接处理器
     * @param handler ConnectHandler
     */
    public onConnect(handler: ConnectHandler) {
        this.connectHandler = handler
    }

    /**
     * 设置断开连接处理器
     * @param handler DisconnectHandler
     */
    public onDisconnect(handler: DisconnectHandler) {
        this.disconnectHandler = handler
    }

    /**
     * 设置消息接收处理器
     * @param handler ReceiveHandler
     */
    public onReceive(handler: ReceiveHandler) {
        this.receiveHandler = handler
    }

    /**
     * 设置错误处理器
     * @param handler ErrorHandler
     */
    public onError(handler: ErrorHandler) {
        this.errorHandler = handler
    }

    /**
     * 设置心跳处理器
     * @param handler HeartbeatHandler
     */
    public onHeartbeat(handler: HeartbeatHandler) {
        this.heartbeatHandler = handler
    }

    /**
     * 检测客户端是否已连接
     * @returns boolean
     */
    public isConnected(): boolean {
        return this.websocket !== undefined && this.websocket.readyState == WebSocket.OPEN
    }

    /**
     * 检测客户端是否正在连接
     * @returns boolean
     */
    public isConnecting(): boolean {
        return this.websocket !== undefined && this.websocket.readyState === WebSocket.CONNECTING
    }

    /**
     * 发送消息
     * @param message Message 消息
     * @returns boolean
     */
    public send(message: Message): boolean {
        if (!this.isConnected()) {
            return false;
        }

        if (this.security && !this.session) {
            return false;
        }

        // 打包错误（route/seq 溢出、消息过大）继续抛出，保持既有语义
        const data = this.packer.packMessage(this.protect(message));

        try {
            this.websocket && this.websocket.send(data);

            return true;
        } catch (error) {
            console.warn('[due] send message failed:', error);

            return false;
        }
    }

    /**
     * 加密消息载荷
     * @param message 消息
     * @returns Message 加密后的消息
     */
    private protect(message: Message): Message {
        if (!this.security) {
            return message;
        }

        if (!this.session) {
            throw new Error('security: session is not established');
        }

        const buffer = this.session.seal(
            message.buffer || new Uint8Array(0),
            CLIENT_TO_SERVER,
            message.route,
            message.seq || 0,
        );

        return { seq: message.seq, route: message.route, buffer };
    }

    /**
     * 请求C/S模型，需要客户端和服务器同时开启seq配置支持
     * @param route 路由
     * @param buffer 数据
     * @param timeout 超时时间（毫秒），大于0时生效
     * @returns Promise<Message> 服务器响应消息
     */
    public request(route: number, buffer?: Uint8Array, timeout?: number): Promise<Message> {
        return new Promise((resolve, reject) => {
            if (!this.isConnected()) {
                reject(new Error('client not connected'));
                return;
            }

            let group = this.waitgroup.get(route);

            if (group === undefined) {
                group = { seq: 0, callback: new Map() };
                this.waitgroup.set(route, group);
            }

            let seq = ++group.seq;
            let timeoutId: any;
            let cleanup = () => {
                group!.callback.delete(seq);
            };

            if (timeout && timeout > 0) {
                timeoutId = setTimeout(() => {
                    cleanup();
                    reject(new Error('request timeout'));
                }, timeout);
            }

            group.callback.set(seq, (message: Message) => {
                timeoutId && clearTimeout(timeoutId);

                resolve(message);
            });

            try {
                if (!this.send({ seq, route, buffer })) {
                    timeoutId && clearTimeout(timeoutId);
                    cleanup();

                    reject(new Error('send message failed'));
                    return;
                }
            } catch (error) {
                timeoutId && clearTimeout(timeoutId);
                cleanup();

                reject(error);
            }
        })
    }

    /**
     * 调用回调
     * @param message 消息
     * @returns 回调结果
     */
    private invoke(message: Message): boolean {
        if (message.seq === undefined || message.seq === 0) {
            return false
        }

        const group = this.waitgroup.get(message.route);

        if (group === undefined) {
            return false
        }

        const callback = group.callback.get(message.seq || 0);

        group.callback.delete(message.seq || 0);

        callback && callback(message);

        return true;
    }
}
