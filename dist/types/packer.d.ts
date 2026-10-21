export interface PackerOptions {
    byteOrder?: 'big' | 'little';
    seqBytes?: 0 | 1 | 2 | 4;
    routeBytes?: 1 | 2 | 4;
    bufferBytes?: number;
}
export interface Message {
    seq?: number;
    route: number;
    buffer?: Uint8Array;
}
export interface Packet {
    isHeartbeat: boolean;
    isHandshake: boolean;
    millisecond?: number;
    handshake?: Uint8Array;
    message?: Message;
}
export declare class Packer {
    private byteOrder;
    private seqBytes;
    private routeBytes;
    private bufferBytes;
    private heartbeat;
    constructor(opts?: PackerOptions);
    packHeartbeat(): ArrayBuffer;
    private doPackHeartbeat;
    packHandshake(payload: Uint8Array): ArrayBuffer;
    packMessage(message: Message): ArrayBuffer;
    unpack(data: ArrayBuffer): Packet;
}
