import type { Message } from "./packer";
export interface Options {
    url: string;
    byteOrder?: string;
    seqBytesLen?: number;
    routeBytesLen?: number;
}
export interface ConnectHandler {
    (): any;
}
export interface DisconnectHandler {
    (): any;
}
export interface ReceiveHandler {
    (message: Message): any;
}
export declare class Client {
    private connectHandler?;
    private disconnectHandler?;
    private receiveHandler?;
    private opts;
    private websocket?;
    private packer;
    private waitgroup;
    constructor(opts: Options);
    connect(): boolean;
    disconnect(): void;
    onConnect(handler: ConnectHandler): void;
    onDisconnect(handler: DisconnectHandler): void;
    onReceive(handler: ReceiveHandler): void;
    isConnected(): boolean;
    isConnecting(): boolean;
    send(message: Message): boolean;
    request(route: number, buffer: any, timeout?: number): Promise<Message>;
    private invoke;
}
