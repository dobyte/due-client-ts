import ByteBuffer from 'bytebuffer';

export interface PackerOptions {
    // 字节序；默认为little
    byteOrder?: string;
    // 序列号字节长度（字节），长度为0时不开启序列号编码；默认为2字节，最大值为65535
    seqBytesLen?: number;
    // 路由字节长度（字节）；默认为2字节，最大值为65535
    routeBytesLen?: number;
}

export interface Message {
    seq?: number;
    route: number;
    buffer: any;
}

export class Packer {
    private opts: PackerOptions;
    private buffer: any;

    public constructor(opts?: PackerOptions) {
        this.opts = opts || { byteOrder: 'little', seqBytesLen: 2, routeBytesLen: 2 };

        this.buffer = new ByteBuffer(ByteBuffer.DEFAULT_CAPACITY, this.opts.byteOrder == 'little', ByteBuffer.DEFAULT_NOASSERT);
    }

    /**
     * 空包
     * @returns ArrayBuffer
     */
    public empty(): ArrayBuffer {
        return this.buffer.clone().flip().toArrayBuffer();
    }

    /**
     * 打包消息
     * @param message 消息数据
     * @returns ArrayBuffer
     */
    public pack(message: Message): ArrayBuffer {
        const buffer = this.buffer.clone();
        const seq = message.seq || 0;
        const route = message.route || 0;

        switch (this.opts.seqBytesLen) {
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

        switch (this.opts.routeBytesLen) {
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
     * @returns Message | undefined
     */
    public unpack(data: any): Message | undefined {
        const buffer = this.buffer.clone().append(data, 'binary').flip();
        const message = { seq: 0, route: 0, buffer: undefined };

        let len = buffer.remaining();

        if (this.opts.seqBytesLen) {
            if (this.opts.seqBytesLen > buffer.remaining()) {
                return;
            }

            switch (this.opts.seqBytesLen) {
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

            len -= this.opts.seqBytesLen;
        }

        if (this.opts.routeBytesLen) {
            if (this.opts.routeBytesLen > buffer.remaining()) {
                return;
            }

            switch (this.opts.routeBytesLen) {
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

            len -= this.opts.routeBytesLen;
        }

        if (len > 0) {
            message.buffer = buffer.readBytes(len);
        }

        return message;
    }
}