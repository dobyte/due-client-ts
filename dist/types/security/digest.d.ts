export type HashAlgorithm = 'sha1' | 'sha224' | 'sha256' | 'sha384' | 'sha512';
export declare function hashSize(hash: HashAlgorithm): number;
export declare function digest(hash: HashAlgorithm, data: Uint8Array): Uint8Array;
