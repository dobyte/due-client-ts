export interface PackerOptions {
    // 字节序；默认为big
    byteOrder?: string;
    // 序列号字节长度（字节），长度为0时不开启序列号编码；默认为2字节，最大值为65535
    seqBytes?: number;
    // 路由字节长度（字节）；默认为2字节，最大值为65535
    routeBytes?: number;
}

export interface Message {
    // 消息序列号
    seq?: number;
    // 消息路由
    route: number;
    // 消息数据
    buffer?: Uint8Array;
}

export interface Packet {
    // 是否是心跳包
    isHeartbeat: boolean;
    // 心跳包携带的服务器时间（毫秒）
    millisecond?: number;
    // 消息数据
    message?: Message;
}

// 大端序
const BIG_ENDIAN = 'big';

// 小端序
const LITTLE_ENDIAN = 'little';

// 默认字节序
const DEFAULT_BYTE_ORDER = BIG_ENDIAN;

// 默认size位字节长度
const DEFAULT_SIZE_BYTES = 4;

// 默认header位字节长度
const DEFAULT_HEADER_BYTES = 1;

// 默认route位字节长度
const DEFAULT_ROUTE_BYTES = 2;

// 默认seq位字节长度
const DEFAULT_SEQ_BYTES = 2;

// 默认服务器时间戳字节长度
const DEFAULT_TIMESTAMP_BYTES = 8;

// 默认buffer数据位字节长度
const DEFAULT_BUFFER_BYTES = 5000;

export class Packer {
    private opts: PackerOptions;
    private heartbeat: ArrayBuffer;

    public constructor(opts?: PackerOptions) {
        this.opts = opts || { byteOrder: DEFAULT_BYTE_ORDER, routeBytes: DEFAULT_ROUTE_BYTES, seqBytes: DEFAULT_SEQ_BYTES };
        this.opts.byteOrder = this.opts.byteOrder !== undefined ? this.opts.byteOrder : DEFAULT_BYTE_ORDER;
        this.opts.routeBytes = this.opts.routeBytes !== undefined ? this.opts.routeBytes : DEFAULT_ROUTE_BYTES;
        this.opts.seqBytes = this.opts.seqBytes !== undefined ? this.opts.seqBytes : DEFAULT_SEQ_BYTES;
        this.heartbeat = this.doPackHeartbeat();
    }

    /**
     * 打包心跳
     * @returns ArrayBuffer
     */
    public packHeartbeat(): ArrayBuffer {
        return this.heartbeat;
    }

    /**
     * 执行打包心跳操作
     * @returns ArrayBuffer
     */
    private doPackHeartbeat(): ArrayBuffer {
        let offset = 0;
        let arrayBuffer = new ArrayBuffer(DEFAULT_SIZE_BYTES + DEFAULT_HEADER_BYTES);
        let dataView = new DataView(arrayBuffer);

        dataView.setUint32(offset, DEFAULT_HEADER_BYTES);
        offset += DEFAULT_SIZE_BYTES;

        dataView.setUint8(offset, 1 << 7);
        offset += DEFAULT_HEADER_BYTES;

        return arrayBuffer;
    }

    /**
     * 打包消息
     * @param message 消息数据
     * @returns ArrayBuffer
     */
    public packMessage(message: Message): ArrayBuffer {
        let seq = message.seq || 0;
        let route = message.route || 0;
        let offset = 0;
        let size = DEFAULT_HEADER_BYTES + (this.opts.routeBytes || 0) + (this.opts.seqBytes || 0) + (message.buffer ? message.buffer.length : 0);
        let arrayBuffer = new ArrayBuffer(DEFAULT_SIZE_BYTES + size);
        let dataView = new DataView(arrayBuffer);

        dataView.setUint32(offset, size);
        offset += DEFAULT_SIZE_BYTES;

        dataView.setUint8(offset, 0);
        offset += DEFAULT_HEADER_BYTES;

        switch (this.opts.routeBytes) {
            case 1:
                dataView.setInt8(offset, route);
                break;
            case 2:
                dataView.setInt16(offset, route);
                break;
            case 4:
                dataView.setInt32(offset, route);
                break;
        }
        offset += this.opts.routeBytes || 0;

        switch (this.opts.seqBytes) {
            case 1:
                dataView.setInt8(offset, seq);
                break;
            case 2:
                dataView.setInt16(offset, seq);
                break;
            case 4:
                dataView.setInt32(offset, seq);
                break;
        }
        offset += this.opts.seqBytes || 0;

        if (message.buffer) {
            for (let i = 0; i < message.buffer.length; i++) {
                dataView.setUint8(offset, message.buffer[i]);
                offset += 1;
            }
        }

        return arrayBuffer;
    }

    /**
     * 解包消息
     * @param data 二进制数据
     * @returns Message
     */
    public unpack(data: any): Packet {
        let offset = 0;
        let dataView = new DataView(data);

        let size = dataView.getUint32(offset);
        offset += DEFAULT_SIZE_BYTES;

        let header = dataView.getUint8(offset);
        offset += DEFAULT_HEADER_BYTES;

        let isHeartbeat = header >> 7 == 1;

        if (isHeartbeat) {
            if (size + DEFAULT_SIZE_BYTES > offset) {
                let millisecond = Number(dataView.getBigUint64(offset).toString());
                offset += DEFAULT_TIMESTAMP_BYTES;

                return { isHeartbeat, millisecond };
            } else {
                return { isHeartbeat };
            }
        } else {
            let message: Message = { seq: 0, route: 0 };

            if (this.opts.routeBytes) {
                switch (this.opts.routeBytes) {
                    case 1:
                        message.route = dataView.getInt8(offset);
                        break;
                    case 2:
                        message.route = dataView.getInt16(offset);
                        break;
                    case 4:
                        message.route = dataView.getInt32(offset);
                        break;
                }
            }
            offset += this.opts.routeBytes || 0;

            switch (this.opts.seqBytes) {
                case 1:
                    message.seq = dataView.getInt8(offset);
                    break;
                case 2:
                    message.seq = dataView.getInt16(offset);
                    break;
                case 4:
                    message.seq = dataView.getInt32(offset);
                    break;
            }
            offset += this.opts.seqBytes || 0;

            if (size + DEFAULT_SIZE_BYTES > offset) {
                message.buffer = new Uint8Array(data, offset);
            }

            return { isHeartbeat, message };
        }
    }
}