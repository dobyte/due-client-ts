import { base64Decode, bytesToBigInt } from './bytes';

/**
 * PEM/DER 公钥解析
 *
 * 支持 due 服务端 rsa/ecc 包生成的公钥格式：
 * - RSA：PKCS#1（RSA PUBLIC KEY）与 PKIX/SPKI（PUBLIC KEY）
 * - ECDSA：PKIX/SPKI（ECDSA PUBLIC KEY）
 */

/**
 * 椭圆曲线参数
 */
export interface EcCurve {
    name: string;
    p: bigint;
    a: bigint;
    b: bigint;
    gx: bigint;
    gy: bigint;
    n: bigint;
    // 坐标字节长度
    size: number;
}

export const P256: EcCurve = {
    name: 'P-256',
    p: 0xffffffff00000001000000000000000000000000ffffffffffffffffffffffffn,
    a: 0xffffffff00000001000000000000000000000000fffffffffffffffffffffffcn,
    b: 0x5ac635d8aa3a93e7b3ebbd55769886bc651d06b0cc53b0f63bce3c3e27d2604bn,
    gx: 0x6b17d1f2e12c4247f8bce6e563a440f277037d812deb33a0f4a13945d898c296n,
    gy: 0x4fe342e2fe1a7f9b8ee7eb4a7c0f9e162bce33576b315ececbb6406837bf51f5n,
    n: 0xffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551n,
    size: 32,
};

export const P384: EcCurve = {
    name: 'P-384',
    p: 0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffeffffffff0000000000000000ffffffffn,
    a: 0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffeffffffff0000000000000000fffffffcn,
    b: 0xb3312fa7e23ee7e4988e056be3f82d19181d9c6efe8141120314088f5013875ac656398d8a2ed19d2a85c8edd3ec2aefn,
    gx: 0xaa87ca22be8b05378eb1c71ef320ad746e1d3b628ba79b9859f741e082542a385502f25dbf55296c3a545e3872760ab7n,
    gy: 0x3617de4a96262c6f5d9e98bf9292dc29f8f41dbd289a147ce9da3113b5f0b8c00a60b1ce1d7e819d7a431d7c90ea0e5fn,
    n: 0xffffffffffffffffffffffffffffffffffffffffffffffffc7634d81f4372ddf581a0db248b0a77aecec196accc52973n,
    size: 48,
};

export const P521: EcCurve = {
    name: 'P-521',
    p: (1n << 521n) - 1n,
    a: (1n << 521n) - 4n,
    b: 0x0051953eb9618e1c9a1f929a21a0b68540eea2da725b99b315f3b8b489918ef109e156193951ec7e937b1652c0bd3bb1bf073573df883d2c34f1ef451fd46b503f00n,
    gx: 0x00c6858e06b70404e9cd9e3ecb662395b4429c648139053fb521f828af606b4d3dbaa14b5e77efe75928fe1dc127a2ffa8de3348b3c1856a429bf97e7e31c2e5bd66n,
    gy: 0x011839296a789a3bc0045c8a5fb42c7d1bd998f54449579b446817afbd17273e662c97ee72995ef42640c550b9013fad0761353c7086a272c24088be94769fd16650n,
    n: 0x01fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffa51868783bf2f966b7fcc0148f709a5d03bb5c9b8899c47aebb6fb71e91386409n,
    size: 66,
};

/**
 * RSA 公钥
 */
export interface RsaPublicKey {
    kind: 'rsa';
    modulus: bigint;
    exponent: bigint;
    // 模长（字节数）
    size: number;
}

/**
 * ECDSA 公钥
 */
export interface EcPublicKey {
    kind: 'ec';
    curve: EcCurve;
    x: bigint;
    y: bigint;
}

export type PublicKey = RsaPublicKey | EcPublicKey;

const OID_RSA_ENCRYPTION = [0x2a, 0x86, 0x48, 0x86, 0xf7, 0x0d, 0x01, 0x01, 0x01];
const OID_EC_PUBLIC_KEY = [0x2a, 0x86, 0x48, 0xce, 0x3d, 0x02, 0x01];
const OID_P256 = [0x2a, 0x86, 0x48, 0xce, 0x3d, 0x03, 0x01, 0x07];
const OID_P384 = [0x2b, 0x81, 0x04, 0x00, 0x22];
const OID_P521 = [0x2b, 0x81, 0x04, 0x00, 0x23];

function equalOid(a: Uint8Array, b: number[]): boolean {
    if (a.length !== b.length) {
        return false;
    }

    for (let i = 0; i < b.length; i++) {
        if (a[i] !== b[i]) {
            return false;
        }
    }

    return true;
}

/**
 * 读取 DER 的 TLV 结构
 */
class DerReader {
    public offset = 0;

    public constructor(private readonly data: Uint8Array) {}

    public read(): { tag: number; content: Uint8Array } {
        if (this.offset + 2 > this.data.length) {
            throw new Error('security: truncated der');
        }

        const tag = this.data[this.offset++];
        let length = this.data[this.offset++];

        if (length & 0x80) {
            const bytes = length & 0x7f;

            if (bytes === 0 || bytes > 4) {
                throw new Error('security: invalid der length');
            }

            length = 0;

            for (let i = 0; i < bytes; i++) {
                length = (length << 8) | this.data[this.offset++];
            }
        }

        if (this.offset + length > this.data.length) {
            throw new Error('security: truncated der');
        }

        const content = this.data.subarray(this.offset, this.offset + length);
        this.offset += length;

        return { tag, content };
    }

    public readTag(tag: number): Uint8Array {
        const value = this.read();

        if (value.tag !== tag) {
            throw new Error('security: unexpected der tag');
        }

        return value.content;
    }
}

function rsaPublicKey(modulus: Uint8Array, exponent: Uint8Array): RsaPublicKey {
    const normalized = trimInteger(modulus);

    return {
        kind: 'rsa',
        modulus: bytesToBigInt(normalized),
        exponent: bytesToBigInt(trimInteger(exponent)),
        size: normalized.length,
    };
}

function trimInteger(value: Uint8Array): Uint8Array {
    let offset = 0;

    while (offset < value.length - 1 && value[offset] === 0) {
        offset++;
    }

    return value.subarray(offset);
}

function derToPublicKey(der: Uint8Array): PublicKey {
    const root = new DerReader(der).readTag(0x30);
    const reader = new DerReader(root);
    const first = reader.read();

    // PKCS#1：SEQUENCE { INTEGER modulus, INTEGER exponent }
    if (first.tag === 0x02) {
        const sequence = new DerReader(root);

        return rsaPublicKey(sequence.readTag(0x02), sequence.readTag(0x02));
    }

    if (first.tag !== 0x30) {
        throw new Error('security: unsupported public key format');
    }

    // PKIX/SPKI：SEQUENCE { AlgorithmIdentifier, BIT STRING }
    const algorithm = new DerReader(first.content);
    const oid = algorithm.readTag(0x06);
    const bitString = reader.read();

    if (bitString.tag !== 0x03 || bitString.content[0] !== 0) {
        throw new Error('security: invalid public key bit string');
    }

    const key = bitString.content.subarray(1);

    if (equalOid(oid, OID_RSA_ENCRYPTION)) {
        const sequence = new DerReader(new DerReader(key).readTag(0x30));

        return rsaPublicKey(sequence.readTag(0x02), sequence.readTag(0x02));
    }

    if (equalOid(oid, OID_EC_PUBLIC_KEY)) {
        const parameters = algorithm.readTag(0x06);
        let curve: EcCurve;

        if (equalOid(parameters, OID_P256)) {
            curve = P256;
        } else if (equalOid(parameters, OID_P384)) {
            curve = P384;
        } else if (equalOid(parameters, OID_P521)) {
            curve = P521;
        } else {
            throw new Error('security: unsupported elliptic curve');
        }

        if (key.length !== 1 + curve.size * 2 || key[0] !== 0x04) {
            throw new Error('security: unsupported public key point');
        }

        return {
            kind: 'ec',
            curve,
            x: bytesToBigInt(key.subarray(1, 1 + curve.size)),
            y: bytesToBigInt(key.subarray(1 + curve.size)),
        };
    }

    throw new Error('security: unsupported public key algorithm');
}

/**
 * 解析公钥
 * @param input PEM 字符串、base64 字符串或 DER 字节
 * @returns PublicKey
 */
export function parsePublicKey(input: string | Uint8Array): PublicKey {
    let der: Uint8Array;

    if (typeof input === 'string') {
        const match = /-----BEGIN [^-]+-----([\s\S]+?)-----END [^-]+-----/.exec(input);
        der = base64Decode(match ? match[1] : input);
    } else if (input.length > 0 && input[0] === 0x30) {
        der = input;
    } else {
        let text = '';

        for (let i = 0; i < input.length; i++) {
            text += String.fromCharCode(input[i]);
        }

        return parsePublicKey(text);
    }

    return derToPublicKey(der);
}
