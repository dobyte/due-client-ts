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
    private options;
    private buffer;
    private unpacker;
    constructor(options?: PackerOptions);
    pack(message: Message): ArrayBuffer;
    unpack(data: any): Message | undefined;
    append(data: any): Packer;
    read(): Message;
}
