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
export declare class Client {
    private connectHandler?;
    private disconnectHandler?;
    private receiveHandler?;
    private errorHandler?;
    private opts;
    private websocket?;
    private intervalId;
    private packer;
    private waitgroup;
    constructor(opts: ClientOptions);
    connect(): boolean;
    disconnect(): void;
    private heartbeat;
    onConnect(handler: ConnectHandler): void;
    onDisconnect(handler: DisconnectHandler): void;
    onReceive(handler: ReceiveHandler): void;
    onError(handler: ErrorHandler): void;
    isConnected(): boolean;
    isConnecting(): boolean;
    send(message: Message): boolean;
    request(route: number, buffer: any, timeout?: number): Promise<Message>;
    private invoke;
}
