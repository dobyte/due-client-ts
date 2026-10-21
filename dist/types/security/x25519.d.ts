import { RandomSource } from './bytes';
export declare function clampPrivateKey(privateKey: Uint8Array): Uint8Array;
export declare function x25519(privateKey: Uint8Array, peerPublicKey: Uint8Array): Uint8Array;
export declare function generateX25519KeyPair(random?: RandomSource): {
    privateKey: Uint8Array;
    publicKey: Uint8Array;
};
