import { sha224, sha256 } from './sha256';

/**
 * 签名哈希算法
 *
 * 与 due 服务端 `[crypto.ecc.signer] hash` / `[crypto.rsa.signer] hash` 配置对应：
 * sha1 | sha224 | sha256 | sha384 | sha512
 */
export type HashAlgorithm = 'sha1' | 'sha224' | 'sha256' | 'sha384' | 'sha512';

const HASH_SIZES: Record<HashAlgorithm, number> = {
    sha1: 20,
    sha224: 28,
    sha256: 32,
    sha384: 48,
    sha512: 64,
};

/**
 * 获取哈希摘要长度
 * @param hash 哈希算法
 * @returns number 字节数
 */
export function hashSize(hash: HashAlgorithm): number {
    return HASH_SIZES[hash];
}

/**
 * 计算哈希摘要
 * @param hash 哈希算法
 * @param data 输入数据
 * @returns Uint8Array 摘要
 */
export function digest(hash: HashAlgorithm, data: Uint8Array): Uint8Array {
    switch (hash) {
        case 'sha1':
            return sha1(data);
        case 'sha224':
            return sha224(data);
        case 'sha256':
            return sha256(data);
        case 'sha384':
            return sha512Core(H384, 48, data);
        case 'sha512':
            return sha512Core(H512, 64, data);
        default:
            throw new Error('security: unsupported hash algorithm');
    }
}

// ---------------------------------------------------------------------------
// SHA-1
// ---------------------------------------------------------------------------

function rotl(value: number, bits: number): number {
    return ((value << bits) | (value >>> (32 - bits))) >>> 0;
}

function sha1(data: Uint8Array): Uint8Array {
    const length = data.length;
    const paddedLength = ((length + 9 + 63) >> 6) << 6;
    const padded = new Uint8Array(paddedLength);
    padded.set(data);
    padded[length] = 0x80;

    const view = new DataView(padded.buffer);
    const bitLength = length * 8;
    view.setUint32(paddedLength - 8, Math.floor(bitLength / 0x100000000));
    view.setUint32(paddedLength - 4, bitLength >>> 0);

    let h0 = 0x67452301;
    let h1 = 0xefcdab89;
    let h2 = 0x98badcfe;
    let h3 = 0x10325476;
    let h4 = 0xc3d2e1f0;

    const w = new Uint32Array(80);

    for (let offset = 0; offset < paddedLength; offset += 64) {
        for (let i = 0; i < 16; i++) {
            w[i] = view.getUint32(offset + i * 4);
        }

        for (let i = 16; i < 80; i++) {
            w[i] = rotl(w[i - 3] ^ w[i - 8] ^ w[i - 14] ^ w[i - 16], 1);
        }

        let a = h0;
        let b = h1;
        let c = h2;
        let d = h3;
        let e = h4;

        for (let i = 0; i < 80; i++) {
            let f: number;
            let k: number;

            if (i < 20) {
                f = (b & c) | (~b & d);
                k = 0x5a827999;
            } else if (i < 40) {
                f = b ^ c ^ d;
                k = 0x6ed9eba1;
            } else if (i < 60) {
                f = (b & c) | (b & d) | (c & d);
                k = 0x8f1bbcdc;
            } else {
                f = b ^ c ^ d;
                k = 0xca62c1d6;
            }

            const temp = (rotl(a, 5) + f + e + k + w[i]) >>> 0;
            e = d;
            d = c;
            c = rotl(b, 30);
            b = a;
            a = temp;
        }

        h0 = (h0 + a) >>> 0;
        h1 = (h1 + b) >>> 0;
        h2 = (h2 + c) >>> 0;
        h3 = (h3 + d) >>> 0;
        h4 = (h4 + e) >>> 0;
    }

    const out = new Uint8Array(20);
    const outView = new DataView(out.buffer);
    outView.setUint32(0, h0);
    outView.setUint32(4, h1);
    outView.setUint32(8, h2);
    outView.setUint32(12, h3);
    outView.setUint32(16, h4);

    return out;
}

// ---------------------------------------------------------------------------
// SHA-384 / SHA-512
// ---------------------------------------------------------------------------

const MASK64 = 0xffffffffffffffffn;

const K512: bigint[] = [
    0x428a2f98d728ae22n, 0x7137449123ef65cdn, 0xb5c0fbcfec4d3b2fn, 0xe9b5dba58189dbbcn,
    0x3956c25bf348b538n, 0x59f111f1b605d019n, 0x923f82a4af194f9bn, 0xab1c5ed5da6d8118n,
    0xd807aa98a3030242n, 0x12835b0145706fben, 0x243185be4ee4b28cn, 0x550c7dc3d5ffb4e2n,
    0x72be5d74f27b896fn, 0x80deb1fe3b1696b1n, 0x9bdc06a725c71235n, 0xc19bf174cf692694n,
    0xe49b69c19ef14ad2n, 0xefbe4786384f25e3n, 0x0fc19dc68b8cd5b5n, 0x240ca1cc77ac9c65n,
    0x2de92c6f592b0275n, 0x4a7484aa6ea6e483n, 0x5cb0a9dcbd41fbd4n, 0x76f988da831153b5n,
    0x983e5152ee66dfabn, 0xa831c66d2db43210n, 0xb00327c898fb213fn, 0xbf597fc7beef0ee4n,
    0xc6e00bf33da88fc2n, 0xd5a79147930aa725n, 0x06ca6351e003826fn, 0x142929670a0e6e70n,
    0x27b70a8546d22ffcn, 0x2e1b21385c26c926n, 0x4d2c6dfc5ac42aedn, 0x53380d139d95b3dfn,
    0x650a73548baf63den, 0x766a0abb3c77b2a8n, 0x81c2c92e47edaee6n, 0x92722c851482353bn,
    0xa2bfe8a14cf10364n, 0xa81a664bbc423001n, 0xc24b8b70d0f89791n, 0xc76c51a30654be30n,
    0xd192e819d6ef5218n, 0xd69906245565a910n, 0xf40e35855771202an, 0x106aa07032bbd1b8n,
    0x19a4c116b8d2d0c8n, 0x1e376c085141ab53n, 0x2748774cdf8eeb99n, 0x34b0bcb5e19b48a8n,
    0x391c0cb3c5c95a63n, 0x4ed8aa4ae3418acbn, 0x5b9cca4f7763e373n, 0x682e6ff3d6b2b8a3n,
    0x748f82ee5defb2fcn, 0x78a5636f43172f60n, 0x84c87814a1f0ab72n, 0x8cc702081a6439ecn,
    0x90befffa23631e28n, 0xa4506cebde82bde9n, 0xbef9a3f7b2c67915n, 0xc67178f2e372532bn,
    0xca273eceea26619cn, 0xd186b8c721c0c207n, 0xeada7dd6cde0eb1en, 0xf57d4f7fee6ed178n,
    0x06f067aa72176fban, 0x0a637dc5a2c898a6n, 0x113f9804bef90daen, 0x1b710b35131c471bn,
    0x28db77f523047d84n, 0x32caab7b40c72493n, 0x3c9ebe0a15c9bebcn, 0x431d67c49c100d4cn,
    0x4cc5d4becb3e42b6n, 0x597f299cfc657e2an, 0x5fcb6fab3ad6faecn, 0x6c44198c4a475817n,
];

const H512: bigint[] = [
    0x6a09e667f3bcc908n, 0xbb67ae8584caa73bn, 0x3c6ef372fe94f82bn, 0xa54ff53a5f1d36f1n,
    0x510e527fade682d1n, 0x9b05688c2b3e6c1fn, 0x1f83d9abfb41bd6bn, 0x5be0cd19137e2179n,
];

const H384: bigint[] = [
    0xcbbb9d5dc1059ed8n, 0x629a292a367cd507n, 0x9159015a3070dd17n, 0x152fecd8f70e5939n,
    0x67332667ffc00b31n, 0x8eb44a8768581511n, 0xdb0c2e0d64f98fa7n, 0x47b5481dbefa4fa4n,
];

function rotr64(value: bigint, bits: bigint): bigint {
    return ((value >> bits) | (value << (64n - bits))) & MASK64;
}

function readUint64BE(data: Uint8Array, offset: number): bigint {
    let value = 0n;

    for (let i = 0; i < 8; i++) {
        value = (value << 8n) | BigInt(data[offset + i]);
    }

    return value;
}

function sha512Core(initial: bigint[], outLength: number, data: Uint8Array): Uint8Array {
    const blockSize = 128;
    const paddedLength = Math.ceil((data.length + 17) / blockSize) * blockSize;
    const padded = new Uint8Array(paddedLength);
    padded.set(data);
    padded[data.length] = 0x80;

    // 128 位大端比特长度；JS 安全整数范围内只需写入低 64 位
    let bitLength = BigInt(data.length) * 8n;

    for (let i = 0; i < 16; i++) {
        padded[paddedLength - 1 - i] = Number(bitLength & 0xffn);
        bitLength >>= 8n;
    }

    const state = initial.slice();
    const w = new Array<bigint>(80);

    for (let offset = 0; offset < paddedLength; offset += blockSize) {
        for (let i = 0; i < 16; i++) {
            w[i] = readUint64BE(padded, offset + i * 8);
        }

        for (let i = 16; i < 80; i++) {
            const s0 = rotr64(w[i - 15], 1n) ^ rotr64(w[i - 15], 8n) ^ (w[i - 15] >> 7n);
            const s1 = rotr64(w[i - 2], 19n) ^ rotr64(w[i - 2], 61n) ^ (w[i - 2] >> 6n);
            w[i] = (w[i - 16] + s0 + w[i - 7] + s1) & MASK64;
        }

        let [a, b, c, d, e, f, g, h] = state;

        for (let i = 0; i < 80; i++) {
            const sigma1 = rotr64(e, 14n) ^ rotr64(e, 18n) ^ rotr64(e, 41n);
            const ch = (e & f) ^ ((e ^ MASK64) & g);
            const t1 = (h + sigma1 + ch + K512[i] + w[i]) & MASK64;
            const sigma0 = rotr64(a, 28n) ^ rotr64(a, 34n) ^ rotr64(a, 39n);
            const maj = (a & b) ^ (a & c) ^ (b & c);
            const t2 = (sigma0 + maj) & MASK64;

            h = g;
            g = f;
            f = e;
            e = (d + t1) & MASK64;
            d = c;
            c = b;
            b = a;
            a = (t1 + t2) & MASK64;
        }

        state[0] = (state[0] + a) & MASK64;
        state[1] = (state[1] + b) & MASK64;
        state[2] = (state[2] + c) & MASK64;
        state[3] = (state[3] + d) & MASK64;
        state[4] = (state[4] + e) & MASK64;
        state[5] = (state[5] + f) & MASK64;
        state[6] = (state[6] + g) & MASK64;
        state[7] = (state[7] + h) & MASK64;
    }

    const out = new Uint8Array(outLength);

    for (let i = 0; i < outLength / 8; i++) {
        let value = state[i];

        for (let j = 7; j >= 0; j--) {
            out[i * 8 + j] = Number(value & 0xffn);
            value >>= 8n;
        }
    }

    return out;
}
