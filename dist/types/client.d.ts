import { Packer, Message } from "./packer";
export interface ClientOptions {
    url: string;
    packer: Packer;
    heartbeat: number;
}
export interface ConnectHandler {
    (client: Client): any;
}
export interface DisconnectHandler {
    (client: Client): any;
}
export interface ReceiveHandler {
    (client: Client, message: Message): any;
}
export interface ErrorHandler {
    (client: Client): any;
}
export interface HeartbeatHandler {
    (client: Client, millisecond?: number): any;
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
    request(route: number, buffer?: Uint8Array, timeout?: number): Promise<Message>;
    private invoke;
}
