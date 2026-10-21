export declare const SUITE_AES_GCM = 1;
export declare const SUITE_CHACHA20_POLY1305 = 2;
export declare const DEFAULT_SUITES: number[];
export interface AeadCipher {
    readonly tagSize: number;
    seal(nonce: Uint8Array, aad: Uint8Array, plaintext: Uint8Array): Uint8Array;
    open(nonce: Uint8Array, aad: Uint8Array, sealed: Uint8Array): Uint8Array | null;
}
export declare function isSuiteSupported(id: number): boolean;
export declare function createAeadCipher(id: number, key: Uint8Array): AeadCipher;
