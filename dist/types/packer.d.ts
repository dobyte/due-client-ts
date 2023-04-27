export interface PackerOptions {
    byteOrder?: string;
    seqBytesLen?: number;
    routeBytesLen?: number;
}
export interface Message {
    seq?: number;
    route: number;
    buffer: any;
}
export declare class Packer {
    private opts;
    private buffer;
    constructor(opts?: PackerOptions);
    empty(): ArrayBuffer;
    pack(message: Message): ArrayBuffer;
    unpack(data: any): Message | undefined;
}
