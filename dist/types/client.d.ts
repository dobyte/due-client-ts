import { Packer, Message } from "./packer";
export interface ClientOptions {
    url: string;
    packer: Packer;
    heartbeat: number;
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
export interface ErrorHandler {
    (): any;
}
export interface HeartbeatHandler {
    (millisecond?: number): any;
}
export declare class Client {
    private connectHandler?;
    private disconnectHandler?;
    private receiveHandler?;
    private errorHandler?;
    private heartbeatHandler?;
    private opts;
    private websocket?;
    private intervalId;
    private packer;
    private buffer;
    private waitgroup;
    constructor(opts: ClientOptions);
    connect(): boolean;
    disconnect(): void;
    private heartbeat;
    onConnect(handler: ConnectHandler): void;
    onDisconnect(handler: DisconnectHandler): void;
    onReceive(handler: ReceiveHandler): void;
    onError(handler: ErrorHandler): void;
    onHeartbeat(handler: HeartbeatHandler): void;
    isConnected(): boolean;
    isConnecting(): boolean;
    send(message: Message): boolean;
    request(route: number, data: any, timeout?: number): Promise<Message>;
    private invoke;
}
