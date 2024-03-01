import { Encoding } from "./encoding/encoding";
export interface PackerOptions {
    byteOrder?: string;
    seqBytes?: number;
    routeBytes?: number;
    encoding?: Encoding;
}
export interface Message {
    seq?: number;
    route: number;
    data?: any;
}
export interface Packet {
    isHeartbeat: boolean;
    millisecond?: number;
    message?: Message;
}
export declare class Packer {
    private opts;
    private buffer;
    constructor(opts?: PackerOptions);
    packHeartbeat(): ArrayBuffer;
    packMessage(message: Message): ArrayBuffer;
    unpack(data: any): Packet;
}
