import { RandomSource, randomBytes } from './bytes';

/**
 * X25519 密钥交换（RFC 7748）
 */

const P = (1n << 255n) - 19n;
const A24 = 121665n;
const BASE_POINT = new Uint8Array(32);

BASE_POINT[0] = 9;

function mod(value: bigint): bigint {
    const result = value % P;

    return result >= 0n ? result : result + P;
}

function modPow(base: bigint, exponent: bigint, modulus: bigint): bigint {
    let result = 1n;
    let value = base % modulus;

    while (exponent > 0n) {
        if (exponent & 1n) {
            result = (result * value) % modulus;
        }

        exponent >>= 1n;
        value = (value * value) % modulus;
    }

    return result;
}

function littleEndianToBigInt(bytes: Uint8Array): bigint {
    let value = 0n;

    for (let i = bytes.length - 1; i >= 0; i--) {
        value = (value << 8n) | BigInt(bytes[i]);
    }

    return value;
}

function bigIntToLittleEndian(value: bigint): Uint8Array {
    const bytes = new Uint8Array(32);

    for (let i = 0; i < 32; i++) {
        bytes[i] = Number(value & 0xffn);
        value >>= 8n;
    }

    return bytes;
}

/**
 * 对 X25519 私钥做钳位处理
 * @param privateKey 私钥
 * @returns Uint8Array 钳位后的副本
 */
export function clampPrivateKey(privateKey: Uint8Array): Uint8Array {
    if (privateKey.length !== 32) {
        throw new Error('x25519: invalid private key size');
    }

    const clamped = privateKey.slice();
    clamped[0] &= 248;
    clamped[31] &= 127;
    clamped[31] |= 64;

    return clamped;
}

/**
 * 计算 X25519 共享密钥
 * @param privateKey 本地 32 字节私钥
 * @param peerPublicKey 对端 32 字节公钥
 * @returns Uint8Array 32 字节共享密钥
 */
export function x25519(privateKey: Uint8Array, peerPublicKey: Uint8Array): Uint8Array {
    if (privateKey.length !== 32 || peerPublicKey.length !== 32) {
        throw new Error('x25519: invalid key size');
    }

    const scalar = littleEndianToBigInt(clampPrivateKey(privateKey));
    const encoded = peerPublicKey.slice();
    encoded[31] &= 127;

    const x1 = mod(littleEndianToBigInt(encoded));
    let x2 = 1n;
    let z2 = 0n;
    let x3 = x1;
    let z3 = 1n;
    let swap = 0;

    for (let t = 254; t >= 0; t--) {
        const bit = Number((scalar >> BigInt(t)) & 1n);
        swap ^= bit;

        if (swap) {
            [x2, x3] = [x3, x2];
            [z2, z3] = [z3, z2];
        }

        swap = bit;

        const a = mod(x2 + z2);
        const aa = mod(a * a);
        const b = mod(x2 - z2);
        const bb = mod(b * b);
        const e = mod(aa - bb);
        const c = mod(x3 + z3);
        const d = mod(x3 - z3);
        const da = mod(d * a);
        const cb = mod(c * b);
        const daPlusCb = mod(da + cb);
        const daMinusCb = mod(da - cb);

        x3 = mod(daPlusCb * daPlusCb);
        z3 = mod(x1 * daMinusCb * daMinusCb);
        x2 = mod(aa * bb);
        z2 = mod(e * mod(aa + A24 * e));
    }

    if (swap) {
        [x2, x3] = [x3, x2];
        [z2, z3] = [z3, z2];
    }

    const shared = mod(x2 * modPow(z2, P - 2n, P));

    // 低阶公钥会得到全零共享密钥，按 RFC 7748 拒绝
    if (shared === 0n) {
        throw new Error('x25519: low order point');
    }

    return bigIntToLittleEndian(shared);
}

/**
 * 生成 X25519 密钥对
 * @param random 随机字节源
 * @returns 密钥对
 */
export function generateX25519KeyPair(random?: RandomSource): { privateKey: Uint8Array; publicKey: Uint8Array } {
    const privateKey = clampPrivateKey(randomBytes(32, random));

    return { privateKey, publicKey: x25519(privateKey, BASE_POINT) };
}
