import ByteBuffer from 'bytebuffer';

export interface PackerOptions {
    // 字节序；默认为big
    byteOrder?: string;
    // 序列号字节长度（字节），长度为0时不开启序列号编码；默认为2字节，最大值为65535
    seqBytes?: number;
    // 路由字节长度（字节）；默认为2字节，最大值为65535
    routeBytes?: number;
}

export interface Message {
    seq?: number;
    route: number;
    buffer: any;
}

export interface Packet {
    // 是否是心跳包
    isHeartbeat: boolean;
    // 心跳包携带的服务器时间（毫秒）
    millisecond?: number;
    // 消息数据
    message?: Message;
}

export class Packer {
    private opts: PackerOptions;
    private buffer: any;

    public constructor(opts?: PackerOptions) {
        this.opts = opts || { byteOrder: 'big', seqBytes: 2, routeBytes: 2 };
        this.buffer = new ByteBuffer(ByteBuffer.DEFAULT_CAPACITY, this.opts.byteOrder != 'big', ByteBuffer.DEFAULT_NOASSERT);
    }

    /**
     * 打包心跳
     * @returns ArrayBuffer
     */
    public packHeartbeat(): ArrayBuffer {
        let buffer = this.buffer.clone();
        let opcode = 1 << 7;

        buffer.writeInt8(opcode);

        return buffer.flip().toArrayBuffer();
    }

    /**
     * 打包消息
     * @param message 消息数据
     * @returns ArrayBuffer
     */
    public packMessage(message: Message): ArrayBuffer {
        let buffer = this.buffer.clone();
        let opcode = 0;
        let seq = message.seq || 0;
        let route = message.route || 0;

        buffer.writeInt8(opcode);

        switch (this.opts.seqBytes) {
            case 1:
                buffer.writeInt8(seq);
                break;
            case 2:
                buffer.writeInt16(seq);
                break;
            case 4:
                buffer.writeInt32(seq);
                break;
        }

        switch (this.opts.routeBytes) {
            case 1:
                buffer.writeInt8(route);
                break;
            case 2:
                buffer.writeInt16(route);
                break;
            case 4:
                buffer.writeInt32(route);
                break;
        }

        message.buffer && buffer.append(message.buffer);

        return buffer.flip().toArrayBuffer();
    }

    /**
     * 解包消息
     * @param data 二进制数据
     * @returns Message
     */
    public unpack(data: any): Packet {
        const buffer = this.buffer.clone().append(data, 'binary').flip();
        const opcode = buffer.readUint8();
        const isHeartbeat = opcode >> 7 == 1;

        if (isHeartbeat) {
            let millisecond

            if (buffer.remaining() > 0) {
                millisecond = buffer.readUint64().toNumber();
            }

            return { isHeartbeat, millisecond };
        } else {
            const message = { seq: 0, route: 0, buffer: undefined }

            if (this.opts.seqBytes) {
                if (this.opts.seqBytes > buffer.remaining()) {
                    return { isHeartbeat };
                }

                switch (this.opts.seqBytes) {
                    case 1:
                        message.seq = buffer.readInt8();
                        break;
                    case 2:
                        message.seq = buffer.readInt16();
                        break;
                    case 4:
                        message.seq = buffer.readInt32();
                        break;
                }
            }

            if (this.opts.routeBytes) {
                if (this.opts.routeBytes > buffer.remaining()) {
                    return { isHeartbeat };
                }

                switch (this.opts.routeBytes) {
                    case 1:
                        message.route = buffer.readInt8();
                        break;
                    case 2:
                        message.route = buffer.readInt16();
                        break;
                    case 4:
                        message.route = buffer.readInt32();
                        break;
                }
            }

            if (buffer.remaining() > 0) {
                message.buffer = buffer.readBytes(buffer.remaining());
            }

            return { isHeartbeat, message };
        }
    }
}