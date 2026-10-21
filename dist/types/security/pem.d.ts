export interface EcCurve {
    name: string;
    p: bigint;
    a: bigint;
    b: bigint;
    gx: bigint;
    gy: bigint;
    n: bigint;
    size: number;
}
export declare const P256: EcCurve;
export declare const P384: EcCurve;
export declare const P521: EcCurve;
export interface RsaPublicKey {
    kind: 'rsa';
    modulus: bigint;
    exponent: bigint;
    size: number;
}
export interface EcPublicKey {
    kind: 'ec';
    curve: EcCurve;
    x: bigint;
    y: bigint;
}
export type PublicKey = RsaPublicKey | EcPublicKey;
export declare function parsePublicKey(input: string | Uint8Array): PublicKey;
