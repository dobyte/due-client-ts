export interface PackerOptions {
    byteOrder?: string;
    seqBytes?: number;
    routeBytes?: number;
}
export interface Message {
    seq?: number;
    route: number;
    buffer?: Uint8Array;
}
export interface Packet {
    isHeartbeat: boolean;
    millisecond?: number;
    message?: Message;
}
export declare class Packer {
    private opts;
    private heartbeat;
    constructor(opts?: PackerOptions);
    packHeartbeat(): ArrayBuffer;
    private doPackHeartbeat;
    packMessage(message: Message): ArrayBuffer;
    unpack(data: any): Packet;
}
