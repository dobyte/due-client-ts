import { RandomSource } from './bytes';
import { HandshakeVerifier } from './verifier';
export declare const HandshakeFrame: {
    readonly ClientHello: 1;
    readonly ServerHello: 2;
    readonly Finished: 3;
};
export declare const Direction: {
    readonly ClientToServer: 0;
    readonly ServerToClient: 1;
};
export type Direction = typeof Direction[keyof typeof Direction];
export declare function encodeHandshakeFrame(type: number, body: Uint8Array): Uint8Array;
export declare function decodeHandshakeFrame(frame: Uint8Array): {
    type: number;
    body: Uint8Array;
};
export interface KeyMaterial {
    c2sKey: Uint8Array;
    s2cKey: Uint8Array;
    c2sFinish: Uint8Array;
    s2cFinish: Uint8Array;
    salt: Uint8Array;
}
export declare function deriveKeyMaterial(shared: Uint8Array, salt: Uint8Array, transcript: Uint8Array): KeyMaterial;
export declare function makeAAD(direction: Direction, epoch: number, route: number, seq: number): Uint8Array;
export declare class SecureSession {
    readonly epoch: number;
    private salt;
    private send;
    private recv;
    private sendCounter;
    private replayHighest;
    private replayBits;
    private replayInited;
    constructor(suiteID: number, material: KeyMaterial, role?: 'client' | 'server');
    get overhead(): number;
    seal(plaintext: Uint8Array, direction: Direction, route: number, seq: number): Uint8Array;
    open(sealed: Uint8Array, direction: Direction, route: number, seq: number): Uint8Array;
    private advanceReplayWindow;
}
export declare class HandshakeClient {
    private readonly verifier;
    private readonly suites;
    private readonly randomSource?;
    private state;
    private privateKey?;
    private random?;
    private helloBody?;
    constructor(verifier: HandshakeVerifier, suites?: number[], random?: RandomSource);
    hello(): Uint8Array;
    handle(frame: Uint8Array): {
        session: SecureSession;
        finished: Uint8Array;
    };
}
