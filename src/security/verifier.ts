import { concatBytes, equalBytes, bigIntToBytes, bytesToBigInt } from './bytes';
import { digest, HashAlgorithm, hashSize } from './digest';
import { EcCurve, EcPublicKey, parsePublicKey, RsaPublicKey } from './pem';

/**
 * 服务端签名校验
 *
 * due 服务端使用 crypto.Signer 对 ServerHello 签名：
 * - 哈希算法由服务端配置（默认 sha256），客户端需与服务端保持一致
 * - RSA 默认 PSS 填充，也支持 PKCS#1 v1.5
 * - ECDSA 支持 P-256/P-384/P-521，签名格式为 “r<分隔符>s” 的十进制文本
 */

/**
 * 服务端签名校验器
 *
 * 与 due-client-unity 的 HandshakeVerifier 委托保持一致：
 * 入参为待验证数据与签名，返回是否通过。
 */
export type HandshakeVerifier = (data: Uint8Array, signature: Uint8Array) => boolean;

// PKCS#1 v1.5 各哈希算法的 DigestInfo 前缀
const DIGEST_INFO: Record<HashAlgorithm, Uint8Array> = {
    sha1: new Uint8Array([
        0x30, 0x21, 0x30, 0x09, 0x06, 0x05, 0x2b, 0x0e,
        0x03, 0x02, 0x1a, 0x05, 0x00, 0x04, 0x14,
    ]),
    sha224: new Uint8Array([
        0x30, 0x2d, 0x30, 0x0d, 0x06, 0x09, 0x60, 0x86,
        0x48, 0x01, 0x65, 0x03, 0x04, 0x02, 0x04, 0x05,
        0x00, 0x04, 0x1c,
    ]),
    sha256: new Uint8Array([
        0x30, 0x31, 0x30, 0x0d, 0x06, 0x09, 0x60, 0x86,
        0x48, 0x01, 0x65, 0x03, 0x04, 0x02, 0x01, 0x05,
        0x00, 0x04, 0x20,
    ]),
    sha384: new Uint8Array([
        0x30, 0x41, 0x30, 0x0d, 0x06, 0x09, 0x60, 0x86,
        0x48, 0x01, 0x65, 0x03, 0x04, 0x02, 0x02, 0x05,
        0x00, 0x04, 0x30,
    ]),
    sha512: new Uint8Array([
        0x30, 0x51, 0x30, 0x0d, 0x06, 0x09, 0x60, 0x86,
        0x48, 0x01, 0x65, 0x03, 0x04, 0x02, 0x03, 0x05,
        0x00, 0x04, 0x40,
    ]),
};

function mod(value: bigint, modulus: bigint): bigint {
    const result = value % modulus;

    return result >= 0n ? result : result + modulus;
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

function modInverse(value: bigint, modulus: bigint): bigint {
    let [oldR, r] = [mod(value, modulus), modulus];
    let [oldS, s] = [1n, 0n];

    while (r !== 0n) {
        const quotient = oldR / r;
        [oldR, r] = [r, oldR - quotient * r];
        [oldS, s] = [s, oldS - quotient * s];
    }

    if (oldR !== 1n) {
        throw new Error('security: value is not invertible');
    }

    return mod(oldS, modulus);
}

function mgf1(seed: Uint8Array, length: number, hash: HashAlgorithm): Uint8Array {
    const hLen = hashSize(hash);
    const output = new Uint8Array(length);
    const counter = new Uint8Array(4);
    let offset = 0;

    for (let index = 0; offset < length; index++) {
        new DataView(counter.buffer).setUint32(0, index);
        const block = digest(hash, concatBytes(seed, counter));
        output.set(block.subarray(0, Math.min(block.length, length - offset)), offset);
        offset += hLen;
    }

    return output;
}

function verifyPkcs1(em: Uint8Array, digestBytes: Uint8Array, hash: HashAlgorithm): boolean {
    const info = DIGEST_INFO[hash];

    if (em.length < info.length + digestBytes.length + 11) {
        return false;
    }

    if (em[0] !== 0x00 || em[1] !== 0x01) {
        return false;
    }

    let offset = 2;

    while (offset < em.length && em[offset] === 0xff) {
        offset++;
    }

    // PS 至少 8 字节
    if (offset < 10 || offset >= em.length || em[offset] !== 0x00) {
        return false;
    }

    offset++;

    if (em.length - offset !== info.length + digestBytes.length) {
        return false;
    }

    if (!equalBytes(em.subarray(offset, offset + info.length), info)) {
        return false;
    }

    return equalBytes(em.subarray(offset + info.length), digestBytes);
}

function verifyPss(em: Uint8Array, digestBytes: Uint8Array, emBits: number, hash: HashAlgorithm): boolean {
    const emLength = em.length;
    const hLen = hashSize(hash);
    // 与 Go rsa.VerifyPSS 的 PSSSaltLengthEqualsHash 一致：盐值长度等于哈希长度
    const saltLength = hLen;

    if (emLength < hLen + saltLength + 2) {
        return false;
    }

    if (em[emLength - 1] !== 0xbc) {
        return false;
    }

    const dbLength = emLength - hLen - 1;
    const maskedDb = em.subarray(0, dbLength);
    const h = em.subarray(dbLength, dbLength + hLen);
    const unusedBits = 8 * emLength - emBits;

    if (unusedBits < 0 || unusedBits > 8) {
        return false;
    }

    if (unusedBits > 0 && (maskedDb[0] & (0xff << (8 - unusedBits))) !== 0) {
        return false;
    }

    const db = new Uint8Array(dbLength);
    const mask = mgf1(h, dbLength, hash);

    for (let i = 0; i < dbLength; i++) {
        db[i] = maskedDb[i] ^ mask[i];
    }

    if (unusedBits > 0) {
        db[0] &= 0xff >>> unusedBits;
    }

    const paddingLength = dbLength - saltLength - 1;

    for (let i = 0; i < paddingLength; i++) {
        if (db[i] !== 0) {
            return false;
        }
    }

    if (db[paddingLength] !== 0x01) {
        return false;
    }

    const salt = db.subarray(paddingLength + 1);
    const expected = digest(hash, concatBytes(new Uint8Array(8), digestBytes, salt));

    return equalBytes(expected, h);
}

function createRsaVerifierFromKey(key: RsaPublicKey, hash: HashAlgorithm, pss: boolean): HandshakeVerifier {
    // 与 Go rsa.VerifyPSS 一致：按模数实际位长计算 PSS 的 emBits 与 EM 长度
    const emBits = key.modulus.toString(2).length - 1;
    const emLength = Math.ceil(emBits / 8);

    const verifyPssWith = (value: bigint, em: Uint8Array, digestBytes: Uint8Array): boolean => {
        if (value >> BigInt(emLength * 8) !== 0n) {
            return false;
        }

        return verifyPss(em.subarray(em.length - emLength), digestBytes, emBits, hash);
    };

    return (data: Uint8Array, signature: Uint8Array): boolean => {
        if (signature.length !== key.size) {
            return false;
        }

        const value = bytesToBigInt(signature);

        if (value <= 0n || value >= key.modulus) {
            return false;
        }

        const message = modPow(value, key.exponent, key.modulus);
        const em = bigIntToBytes(message, key.size);
        const digestBytes = digest(hash, data);

        if (!pss) {
            return verifyPkcs1(em, digestBytes, hash);
        }

        return verifyPssWith(message, em, digestBytes);
    };
}

interface EcPoint {
    x: bigint;
    y: bigint;
}

function pointDouble(point: EcPoint, curve: EcCurve): EcPoint | null {
    if (point.y === 0n) {
        return null;
    }

    const lambda = mod(
        (3n * point.x * point.x + curve.a) * modInverse(2n * point.y, curve.p),
        curve.p,
    );
    const x = mod(lambda * lambda - 2n * point.x, curve.p);

    return { x, y: mod(lambda * (point.x - x) - point.y, curve.p) };
}

function pointAdd(a: EcPoint | null, b: EcPoint | null, curve: EcCurve): EcPoint | null {
    if (a === null) {
        return b;
    }

    if (b === null) {
        return a;
    }

    if (a.x === b.x) {
        if (mod(a.y + b.y, curve.p) === 0n) {
            return null;
        }

        return pointDouble(a, curve);
    }

    const lambda = mod((b.y - a.y) * modInverse(b.x - a.x, curve.p), curve.p);
    const x = mod(lambda * lambda - a.x - b.x, curve.p);

    return { x, y: mod(lambda * (a.x - x) - a.y, curve.p) };
}

function pointMultiply(scalar: bigint, point: EcPoint, curve: EcCurve): EcPoint | null {
    let result: EcPoint | null = null;
    let addend: EcPoint | null = point;
    let value = scalar;

    while (value > 0n) {
        if (value & 1n) {
            result = pointAdd(result, addend, curve);
        }

        addend = addend && pointDouble(addend, curve);
        value >>= 1n;
    }

    return result;
}

function parseSignatureParts(signature: Uint8Array, delimiter: string): [bigint, bigint] | null {
    let text = '';

    for (let i = 0; i < signature.length; i++) {
        text += String.fromCharCode(signature[i]);
    }

    const parts = text.split(delimiter);

    if (parts.length !== 2) {
        return null;
    }

    if (!/^\d+$/.test(parts[0]) || !/^\d+$/.test(parts[1])) {
        return null;
    }

    return [BigInt(parts[0]), BigInt(parts[1])];
}

/**
 * 按 Go ecdsa.Verify 的规则将哈希转换为整数：截断到曲线阶的位长
 * @param bytes 哈希摘要
 * @param curve 曲线参数
 * @returns bigint
 */
function hashToInt(bytes: Uint8Array, curve: EcCurve): bigint {
    const orderBits = curve.n.toString(2).length;
    const orderBytes = (orderBits + 7) >> 3;
    const sliced = bytes.length > orderBytes ? bytes.subarray(0, orderBytes) : bytes;
    let value = bytesToBigInt(sliced);
    const excess = sliced.length * 8 - orderBits;

    if (excess > 0) {
        value >>= BigInt(excess);
    }

    return value;
}

function createEcdsaVerifierFromKey(key: EcPublicKey, hash: HashAlgorithm, delimiter: string): HandshakeVerifier {
    return (data: Uint8Array, signature: Uint8Array): boolean => {
        const parts = parseSignatureParts(signature, delimiter);

        if (parts === null) {
            return false;
        }

        const [r, s] = parts;
        const curve = key.curve;

        if (r <= 0n || r >= curve.n || s <= 0n || s >= curve.n) {
            return false;
        }

        const z = hashToInt(digest(hash, data), curve);
        const w = modInverse(s, curve.n);
        const u1 = (z * w) % curve.n;
        const u2 = (r * w) % curve.n;
        const point = pointAdd(
            pointMultiply(u1, { x: curve.gx, y: curve.gy }, curve),
            pointMultiply(u2, { x: key.x, y: key.y }, curve),
            curve,
        );

        if (point === null) {
            return false;
        }

        return mod(point.x, curve.n) === r;
    };
}

/**
 * 内置签名校验器
 *
 * 与 due-client-unity 的 Verifier 静态类保持一致：
 * - `Verifier.ecdsa(publicKey, hash?, delimiter?)`
 * - `Verifier.rsa(publicKey, hash?, pss?)`
 *
 * 返回值为 HandshakeVerifier 委托，可直接传给 `security.verifier`。
 */
export const Verifier = {
    /**
     * 创建 ECDSA 校验器
     * @param publicKey 公钥 PEM/base64/DER 或已解析的公钥
     * @param hash 哈希算法，默认 sha256
     * @param delimiter 签名分隔符，默认空格
     * @returns HandshakeVerifier
     */
    ecdsa(publicKey: string | Uint8Array | EcPublicKey, hash: HashAlgorithm = 'sha256', delimiter = ' '): HandshakeVerifier {
        const parsed = typeof publicKey === 'string' || publicKey instanceof Uint8Array ? parsePublicKey(publicKey) : publicKey;

        if (parsed.kind !== 'ec') {
            throw new Error('security: not an ecdsa public key');
        }

        return createEcdsaVerifierFromKey(parsed, hash, delimiter);
    },

    /**
     * 创建 RSA 校验器
     * @param publicKey 公钥 PEM/base64/DER 或已解析的公钥
     * @param hash 哈希算法，默认 sha256
     * @param pss 是否使用 PSS 填充，默认 true；false 时使用 PKCS#1 v1.5
     * @returns HandshakeVerifier
     */
    rsa(publicKey: string | Uint8Array | RsaPublicKey, hash: HashAlgorithm = 'sha256', pss = true): HandshakeVerifier {
        const parsed = typeof publicKey === 'string' || publicKey instanceof Uint8Array ? parsePublicKey(publicKey) : publicKey;

        if (parsed.kind !== 'rsa') {
            throw new Error('security: not an rsa public key');
        }

        return createRsaVerifierFromKey(parsed, hash, pss);
    },
};
