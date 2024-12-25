export interface PackerOptions {
    // 字节序；默认为big
    byteOrder?: 'big' | 'little';
    // 序列号字节长度（字节），长度为0时不开启序列号编码；默认为2字节，最大值为65535
    seqBytes?: 0 | 1 | 2 | 4;
    // 路由字节长度（字节）；默认为2字节，最大值为65535
    routeBytes?: 1 | 2 | 4;
    // 消息字节长度（字节）；默认为5000字节
    bufferBytes?: number;
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
    // 字节序；默认为big
    private byteOrder: 'big' | 'little';
    // 序列号字节长度（字节），长度为0时不开启序列号编码；默认为2字节，最大值为65535
    private seqBytes: 0 | 1 | 2 | 4;
    // 路由字节长度（字节）；默认为2字节，最大值为65535
    private routeBytes: 1 | 2 | 4;
    // 消息字节长度（字节）；默认为5000字节
    private bufferBytes: number;
    // 默认心跳数据包
    private heartbeat: ArrayBuffer;

    public constructor(opts?: PackerOptions) {
        this.byteOrder = opts ? (opts.byteOrder ? opts.byteOrder : DEFAULT_BYTE_ORDER) : DEFAULT_BYTE_ORDER;
        this.routeBytes = opts ? (opts.routeBytes ? opts.routeBytes : DEFAULT_ROUTE_BYTES) : DEFAULT_ROUTE_BYTES;
        this.seqBytes = opts ? (opts.seqBytes !== undefined ? opts.seqBytes : DEFAULT_SEQ_BYTES) : DEFAULT_SEQ_BYTES;
        this.bufferBytes = opts ? (opts.bufferBytes !== undefined ? opts.bufferBytes : DEFAULT_BUFFER_BYTES) : DEFAULT_BUFFER_BYTES;
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
        let route = message.route;
        let offset = 0;
        let size = DEFAULT_HEADER_BYTES + this.routeBytes + this.seqBytes + (message.buffer ? message.buffer.length : 0);
        let isLittleEndian = this.byteOrder == LITTLE_ENDIAN;

        if (route > Math.pow(2, 8 * this.routeBytes) / 2 - 1 || route < Math.pow(2, 8 * this.routeBytes) / -2) {
            throw 'route overflow';
        }

        if (this.seqBytes > 0 && (seq > Math.pow(2, 8 * this.seqBytes) / 2 - 1 || seq < Math.pow(2, 8 * this.seqBytes) / -2)) {
            throw 'seq overflow';
        }

        if (message.buffer && message.buffer.length > this.bufferBytes) {
            throw 'message too large';
        }

        let arrayBuffer = new ArrayBuffer(DEFAULT_SIZE_BYTES + size);
        let dataView = new DataView(arrayBuffer);

        dataView.setUint32(offset, size, isLittleEndian);
        offset += DEFAULT_SIZE_BYTES;

        dataView.setUint8(offset, 0);
        offset += DEFAULT_HEADER_BYTES;

        switch (this.routeBytes) {
            case 1:
                dataView.setInt8(offset, route);
                break;
            case 2:
                dataView.setInt16(offset, route, isLittleEndian);
                break;
            case 4:
                dataView.setInt32(offset, route, isLittleEndian);
                break;
        }
        offset += this.routeBytes;

        switch (this.seqBytes) {
            case 1:
                dataView.setInt8(offset, seq);
                break;
            case 2:
                dataView.setInt16(offset, seq, isLittleEndian);
                break;
            case 4:
                dataView.setInt32(offset, seq, isLittleEndian);
                break;
        }
        offset += this.seqBytes;

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
        let isLittleEndian = this.byteOrder == LITTLE_ENDIAN;

        let size = dataView.getUint32(offset, isLittleEndian);
        offset += DEFAULT_SIZE_BYTES;

        let header = dataView.getUint8(offset);
        offset += DEFAULT_HEADER_BYTES;

        let isHeartbeat = header >> 7 == 1;

        if (isHeartbeat) {
            if (size + DEFAULT_SIZE_BYTES > offset) {
                let millisecond = Number(dataView.getBigUint64(offset, isLittleEndian).toString());
                offset += DEFAULT_TIMESTAMP_BYTES;

                return { isHeartbeat, millisecond };
            } else {
                return { isHeartbeat };
            }
        } else {
            let message: Message = { seq: 0, route: 0 };

            if (this.routeBytes) {
                switch (this.routeBytes) {
                    case 1:
                        message.route = dataView.getInt8(offset);
                        break;
                    case 2:
                        message.route = dataView.getInt16(offset, isLittleEndian);
                        break;
                    case 4:
                        message.route = dataView.getInt32(offset, isLittleEndian);
                        break;
                }
            }
            offset += this.routeBytes;

            switch (this.seqBytes) {
                case 1:
                    message.seq = dataView.getInt8(offset);
                    break;
                case 2:
                    message.seq = dataView.getInt16(offset, isLittleEndian);
                    break;
                case 4:
                    message.seq = dataView.getInt32(offset, isLittleEndian);
                    break;
            }
            offset += this.seqBytes;

            if (size + DEFAULT_SIZE_BYTES > offset) {
                message.buffer = new Uint8Array(data, offset);
                offset += message.buffer.length;
            }

            return { isHeartbeat, message };
        }
    }
}