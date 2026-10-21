import { HashAlgorithm } from './digest';
import { EcPublicKey, RsaPublicKey } from './pem';
export type HandshakeVerifier = (data: Uint8Array, signature: Uint8Array) => boolean;
export declare const Verifier: {
    ecdsa(publicKey: string | Uint8Array | EcPublicKey, hash?: HashAlgorithm, delimiter?: string): HandshakeVerifier;
    rsa(publicKey: string | Uint8Array | RsaPublicKey, hash?: HashAlgorithm, pss?: boolean): HandshakeVerifier;
};
