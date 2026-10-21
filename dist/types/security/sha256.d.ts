export declare function sha256(data: Uint8Array): Uint8Array;
export declare function sha224(data: Uint8Array): Uint8Array;
export declare function hmacSha256(key: Uint8Array, data: Uint8Array): Uint8Array;
export declare function hkdfSha256(ikm: Uint8Array, salt: Uint8Array, info: Uint8Array, length: number): Uint8Array;
