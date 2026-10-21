import {
    concatBytes,
    equalBytes,
    randomBytes,
    RandomSource,
    readUint64BE,
    utf8Bytes,
    writeUint64BE,
} from './bytes';
import { AeadCipher, createAeadCipher, DEFAULT_SUITES, isSuiteSupported } from './aead';
import { hkdfSha256, hmacSha256, sha256 } from './sha256';
import { HandshakeVerifier } from './verifier';
import { generateX25519KeyPair, x25519 } from './x25519';

/**
 * 客户端安全握手与会话加解密
 *
 * 协议与 due core/security/handshake 保持一致：
 * 1. 客户端发送 ClientHello：random(32) | x25519 公钥(32) | 套件数量(1) | 套件列表
 * 2. 服务端回复 ServerHello：套件(1) | random(32) | x25519 公钥(32) | 签名长度(2) | 签名 | MAC(32)
 * 3. 客户端校验签名与 MAC 后发送 Finished：MAC(32)
 *
 * 会话数据使用 AEAD 加密，封包格式：epoch(1) | counter(8) | ciphertext | tag，
 * AAD 绑定 version、direction、epoch、route 与 seq。
 */

const VERSION = 1;

const FRAME_CLIENT_HELLO = 1;
const FRAME_SERVER_HELLO = 2;
const FRAME_FINISHED = 3;

/**
 * 握手帧类型
 */
export const HandshakeFrame = {
    ClientHello: FRAME_CLIENT_HELLO,
    ServerHello: FRAME_SERVER_HELLO,
    Finished: FRAME_FINISHED,
} as const;

const FRAME_HEADER_SIZE = 4;
const RANDOM_SIZE = 32;
const PUBLIC_KEY_SIZE = 32;
const MAC_SIZE = 32;

const CLIENT_HELLO_FIXED_SIZE = RANDOM_SIZE + PUBLIC_KEY_SIZE + 1;
const SERVER_HELLO_PREFIX_SIZE = 1 + RANDOM_SIZE + PUBLIC_KEY_SIZE;

const TRANSCRIPT_LABEL = 'due-handshake-v1';
const KEY_MATERIAL_SIZE = 32 * 4 + 4;

const ENVELOPE_HEADER_SIZE = 9;
const AAD_SIZE = 11;
const NONCE_SIZE = 12;
const SALT_SIZE = 4;

const MAX_COUNTER = (1n << 64n) - 1n;
const WINDOW_MASK = (1n << 64n) - 1n;

/**
 * 消息方向
 */
export const Direction = {
    // 客户端到服务端
    ClientToServer: 0,
    // 服务端到客户端
    ServerToClient: 1,
} as const;

export type Direction = typeof Direction[keyof typeof Direction];

export function encodeHandshakeFrame(type: number, body: Uint8Array): Uint8Array {
    const frame = new Uint8Array(FRAME_HEADER_SIZE + body.length);
    frame[0] = VERSION;
    frame[1] = type;
    frame[2] = (body.length >>> 8) & 0xff;
    frame[3] = body.length & 0xff;
    frame.set(body, FRAME_HEADER_SIZE);

    return frame;
}

export function decodeHandshakeFrame(frame: Uint8Array): { type: number; body: Uint8Array } {
    if (frame.length < FRAME_HEADER_SIZE) {
        throw new Error('security: invalid handshake frame');
    }

    if (frame[0] !== VERSION) {
        throw new Error('security: unsupported handshake version');
    }

    const length = (frame[2] << 8) | frame[3];

    if (length !== frame.length - FRAME_HEADER_SIZE) {
        throw new Error('security: invalid handshake frame');
    }

    return { type: frame[1], body: frame.subarray(FRAME_HEADER_SIZE) };
}

function transcriptHash(...parts: Uint8Array[]): Uint8Array {
    return sha256(concatBytes(...parts));
}

function finishMac(key: Uint8Array, transcript: Uint8Array): Uint8Array {
    return hmacSha256(key, transcript);
}

export interface KeyMaterial {
    c2sKey: Uint8Array;
    s2cKey: Uint8Array;
    c2sFinish: Uint8Array;
    s2cFinish: Uint8Array;
    salt: Uint8Array;
}

export function deriveKeyMaterial(shared: Uint8Array, salt: Uint8Array, transcript: Uint8Array): KeyMaterial {
    const info = concatBytes(utf8Bytes(TRANSCRIPT_LABEL), transcript);
    const output = hkdfSha256(shared, salt, info, KEY_MATERIAL_SIZE);

    return {
        c2sKey: output.subarray(0, 32),
        s2cKey: output.subarray(32, 64),
        c2sFinish: output.subarray(64, 96),
        s2cFinish: output.subarray(96, 128),
        salt: output.subarray(128, KEY_MATERIAL_SIZE),
    };
}

/**
 * 构造 AEAD 附加认证数据
 * @param direction 消息方向
 * @param epoch 密钥纪元
 * @param route 路由
 * @param seq 序列号
 * @returns Uint8Array
 */
export function makeAAD(direction: Direction, epoch: number, route: number, seq: number): Uint8Array {
    const aad = new Uint8Array(AAD_SIZE);
    aad[0] = VERSION;
    aad[1] = direction;
    aad[2] = epoch;

    const view = new DataView(aad.buffer);
    view.setUint32(3, route >>> 0);
    view.setUint32(7, seq >>> 0);

    return aad;
}

/**
 * 安全会话
 */
export class SecureSession {
    // 密钥纪元
    public readonly epoch: number = 1;

    // nonce 盐值
    private salt: Uint8Array;
    // 发送加密器
    private send: AeadCipher;
    // 接收加密器
    private recv: AeadCipher;
    // 发送计数器
    private sendCounter = 0n;
    // 重放窗口最高位
    private replayHighest = 0n;
    // 重放窗口位图
    private replayBits = 0n;
    // 重放窗口是否已初始化
    private replayInited = false;

    public constructor(suiteID: number, material: KeyMaterial, role: 'client' | 'server' = 'client') {
        this.send = createAeadCipher(suiteID, role === 'client' ? material.c2sKey : material.s2cKey);
        this.recv = createAeadCipher(suiteID, role === 'client' ? material.s2cKey : material.c2sKey);
        this.salt = material.salt.slice();
    }

    /**
     * 加密后的额外开销
     */
    public get overhead(): number {
        return ENVELOPE_HEADER_SIZE + this.send.tagSize;
    }

    /**
     * 加密业务载荷
     * @param plaintext 明文
     * @param direction 消息方向
     * @param route 路由
     * @param seq 序列号
     * @returns Uint8Array 密文封包
     */
    public seal(plaintext: Uint8Array, direction: Direction, route: number, seq: number): Uint8Array {
        const counter = this.sendCounter;

        if (counter >= MAX_COUNTER) {
            throw new Error('security: session key exhausted');
        }

        this.sendCounter += 1n;

        const nonce = new Uint8Array(NONCE_SIZE);
        nonce.set(this.salt, 0);
        writeUint64BE(nonce, SALT_SIZE, counter);

        const sealed = this.send.seal(nonce, makeAAD(direction, this.epoch, route, seq), plaintext);
        const output = new Uint8Array(ENVELOPE_HEADER_SIZE + sealed.length);
        output[0] = this.epoch;
        writeUint64BE(output, 1, counter);
        output.set(sealed, ENVELOPE_HEADER_SIZE);

        return output;
    }

    /**
     * 解密业务载荷
     * @param sealed 密文封包
     * @param direction 消息方向
     * @param route 路由
     * @param seq 序列号
     * @returns Uint8Array 明文
     */
    public open(sealed: Uint8Array, direction: Direction, route: number, seq: number): Uint8Array {
        if (sealed.length < ENVELOPE_HEADER_SIZE + this.recv.tagSize) {
            throw new Error('security: invalid secure message');
        }

        if (sealed[0] !== this.epoch) {
            throw new Error('security: invalid secure message');
        }

        const counter = readUint64BE(sealed, 1);
        const nonce = new Uint8Array(NONCE_SIZE);
        nonce.set(this.salt, 0);
        writeUint64BE(nonce, SALT_SIZE, counter);

        const plaintext = this.recv.open(nonce, makeAAD(direction, this.epoch, route, seq), sealed.subarray(ENVELOPE_HEADER_SIZE));

        if (plaintext === null) {
            throw new Error('security: message authentication failed');
        }

        if (!this.advanceReplayWindow(counter)) {
            throw new Error('security: replayed message');
        }

        return plaintext;
    }

    /**
     * 推进重放窗口
     * @param counter 接收到的计数器
     * @returns boolean 是否为新鲜消息
     */
    private advanceReplayWindow(counter: bigint): boolean {
        if (!this.replayInited) {
            this.replayInited = true;
            this.replayHighest = counter;
            this.replayBits = 1n;

            return true;
        }

        if (counter > this.replayHighest) {
            const shift = counter - this.replayHighest;
            this.replayBits = shift >= 64n ? 0n : (this.replayBits << shift) & WINDOW_MASK;
            this.replayBits |= 1n;
            this.replayHighest = counter;

            return true;
        }

        const diff = this.replayHighest - counter;

        if (diff >= 64n || ((this.replayBits >> diff) & 1n) === 1n) {
            return false;
        }

        this.replayBits |= 1n << diff;

        return true;
    }
}

/**
 * 握手客户端
 */
export class HandshakeClient {
    // 服务端签名校验器
    private readonly verifier: HandshakeVerifier;
    // 协商套件列表
    private readonly suites: number[];
    // 随机字节源
    private readonly randomSource?: RandomSource;
    // 握手状态
    private state = 0;
    // 临时私钥
    private privateKey?: Uint8Array;
    // 客户端随机数
    private random?: Uint8Array;
    // ClientHello 消息体
    private helloBody?: Uint8Array;

    public constructor(verifier: HandshakeVerifier, suites?: number[], random?: RandomSource) {
        if (!verifier || typeof verifier !== 'function') {
            throw new Error('security: a server verifier is required');
        }

        this.verifier = verifier;
        this.randomSource = random;
        this.suites = suites && suites.length ? suites.slice() : DEFAULT_SUITES.slice();

        if (this.suites.length > 255) {
            throw new Error('security: too many aead suites');
        }

        for (const suite of this.suites) {
            if (!isSuiteSupported(suite)) {
                throw new Error(`security: unsupported aead suite ${suite}`);
            }
        }
    }

    /**
     * 生成 ClientHello 握手帧
     * @returns Uint8Array
     */
    public hello(): Uint8Array {
        if (this.state !== 0) {
            throw new Error('security: unexpected handshake state');
        }

        const { privateKey, publicKey } = generateX25519KeyPair(this.randomSource);
        const random = randomBytes(RANDOM_SIZE, this.randomSource);
        const body = concatBytes(random, publicKey, new Uint8Array([this.suites.length]), new Uint8Array(this.suites));

        this.privateKey = privateKey;
        this.random = random;
        this.helloBody = body;
        this.state = 1;

        return encodeHandshakeFrame(FRAME_CLIENT_HELLO, body);
    }

    /**
     * 处理 ServerHello 握手帧
     * @param frame ServerHello 帧
     * @returns 安全会话与需要发送的 Finished 帧
     */
    public handle(frame: Uint8Array): { session: SecureSession; finished: Uint8Array } {
        if (this.state !== 1 || !this.privateKey || !this.random || !this.helloBody) {
            throw new Error('security: unexpected handshake state');
        }

        const { type, body } = decodeHandshakeFrame(frame);

        if (type !== FRAME_SERVER_HELLO) {
            throw new Error('security: invalid handshake frame');
        }

        if (body.length < SERVER_HELLO_PREFIX_SIZE + 2 + MAC_SIZE) {
            throw new Error('security: invalid server hello');
        }

        const suiteID = body[0];
        const random = body.subarray(1, 1 + RANDOM_SIZE);
        const publicKey = body.subarray(1 + RANDOM_SIZE, SERVER_HELLO_PREFIX_SIZE);
        const signatureLength = (body[SERVER_HELLO_PREFIX_SIZE] << 8) | body[SERVER_HELLO_PREFIX_SIZE + 1];
        const signatureStart = SERVER_HELLO_PREFIX_SIZE + 2;

        if (body.length !== signatureStart + signatureLength + MAC_SIZE) {
            throw new Error('security: invalid server hello');
        }

        if (this.suites.indexOf(suiteID) === -1) {
            throw new Error('security: unsupported aead suite');
        }

        const signature = body.subarray(signatureStart, signatureStart + signatureLength);
        const mac = body.subarray(signatureStart + signatureLength);
        const prefix = body.subarray(0, SERVER_HELLO_PREFIX_SIZE);
        const signed = transcriptHash(utf8Bytes(TRANSCRIPT_LABEL), this.helloBody, prefix);

        if (!this.verifier(signed, signature)) {
            throw new Error('security: invalid server signature');
        }

        const transcript = transcriptHash(this.helloBody, prefix, signature);
        const shared = x25519(this.privateKey, publicKey);
        const salt = concatBytes(this.random, random);
        const material = deriveKeyMaterial(shared, salt, transcript);

        if (!equalBytes(finishMac(material.s2cFinish, transcript), mac)) {
            throw new Error('security: invalid server mac');
        }

        this.state = 2;

        return {
            session: new SecureSession(suiteID, material, 'client'),
            finished: encodeHandshakeFrame(FRAME_FINISHED, finishMac(material.c2sFinish, transcript)),
        };
    }
}
