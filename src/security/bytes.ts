/**
 * 安全模块通用字节工具
 */

/**
 * 随机字节源
 */
export type RandomSource = (length: number) => Uint8Array;

/**
 * 生成随机字节
 *
 * 默认使用平台提供的密码学安全随机数；原生平台若未提供，请通过 security.random 注入。
 * @param length 字节长度
 * @param source 自定义随机字节源
 * @returns Uint8Array
 */
export function randomBytes(length: number, source?: RandomSource): Uint8Array {
    if (source) {
        const bytes = source(length);

        if (!bytes || bytes.length !== length) {
            throw new Error('security: invalid random source');
        }

        return bytes;
    }

    const crypto = (globalThis as any).crypto || (globalThis as any).msCrypto;

    if (crypto && typeof crypto.getRandomValues === 'function') {
        const bytes = new Uint8Array(length);

        // getRandomValues 单次最多填充 65536 字节
        for (let offset = 0; offset < length; offset += 65536) {
            crypto.getRandomValues(bytes.subarray(offset, Math.min(offset + 65536, length)));
        }

        return bytes;
    }

    throw new Error('security: a csprng is required, please provide security.random');
}

/**
 * 拼接字节数组
 * @param arrays 字节数组列表
 * @returns Uint8Array
 */
export function concatBytes(...arrays: Uint8Array[]): Uint8Array {
    let length = 0;

    for (const array of arrays) {
        length += array.length;
    }

    const result = new Uint8Array(length);
    let offset = 0;

    for (const array of arrays) {
        result.set(array, offset);
        offset += array.length;
    }

    return result;
}

/**
 * 恒定时间比较两个字节数组
 * @param a 字节数组
 * @param b 字节数组
 * @returns boolean
 */
export function equalBytes(a: Uint8Array, b: Uint8Array): boolean {
    if (a.length !== b.length) {
        return false;
    }

    let diff = 0;

    for (let i = 0; i < a.length; i++) {
        diff |= a[i] ^ b[i];
    }

    return diff === 0;
}

/**
 * 将字符串编码为 UTF-8 字节
 * @param text 字符串
 * @returns Uint8Array
 */
export function utf8Bytes(text: string): Uint8Array {
    if (typeof TextEncoder !== 'undefined') {
        return new TextEncoder().encode(text);
    }

    const result: number[] = [];

    for (let i = 0; i < text.length; i++) {
        const code = text.charCodeAt(i);

        if (code < 0x80) {
            result.push(code);
        } else if (code < 0x800) {
            result.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f));
        } else {
            result.push(0xe0 | (code >> 12), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f));
        }
    }

    return new Uint8Array(result);
}

/**
 * 读取大端 uint32
 * @param data 字节数组
 * @param offset 偏移
 * @returns number
 */
export function readUint32BE(data: Uint8Array, offset: number = 0): number {
    return ((data[offset] << 24) | (data[offset + 1] << 16) | (data[offset + 2] << 8) | data[offset + 3]) >>> 0;
}

/**
 * 写入大端 uint32
 * @param data 字节数组
 * @param offset 偏移
 * @param value 数值
 */
export function writeUint32BE(data: Uint8Array, offset: number, value: number): void {
    data[offset] = (value >>> 24) & 0xff;
    data[offset + 1] = (value >>> 16) & 0xff;
    data[offset + 2] = (value >>> 8) & 0xff;
    data[offset + 3] = value & 0xff;
}

/**
 * 写入大端 uint64
 * @param data 字节数组
 * @param offset 偏移
 * @param value 数值
 */
export function writeUint64BE(data: Uint8Array, offset: number, value: bigint): void {
    for (let i = 7; i >= 0; i--) {
        data[offset + i] = Number(value & 0xffn);
        value >>= 8n;
    }
}

/**
 * 读取大端 uint64
 * @param data 字节数组
 * @param offset 偏移
 * @returns bigint
 */
export function readUint64BE(data: Uint8Array, offset: number = 0): bigint {
    let value = 0n;

    for (let i = 0; i < 8; i++) {
        value = (value << 8n) | BigInt(data[offset + i]);
    }

    return value;
}

/**
 * 字节数组转大端 bigint
 * @param data 字节数组
 * @returns bigint
 */
export function bytesToBigInt(data: Uint8Array): bigint {
    let value = 0n;

    for (let i = 0; i < data.length; i++) {
        value = (value << 8n) | BigInt(data[i]);
    }

    return value;
}

/**
 * 大端 bigint 转指定长度的字节数组
 * @param value 数值
 * @param length 字节长度
 * @returns Uint8Array
 */
export function bigIntToBytes(value: bigint, length: number): Uint8Array {
    const bytes = new Uint8Array(length);

    for (let i = length - 1; i >= 0; i--) {
        bytes[i] = Number(value & 0xffn);
        value >>= 8n;
    }

    return bytes;
}

const BASE64_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

/**
 * 解码 base64 字符串
 * @param text base64 字符串
 * @returns Uint8Array
 */
export function base64Decode(text: string): Uint8Array {
    const clean = text.replace(/[^A-Za-z0-9+/]/g, '');
    const length = Math.floor((clean.length * 3) / 4);
    const result = new Uint8Array(length);
    let offset = 0;
    let buffer = 0;
    let bits = 0;

    for (let i = 0; i < clean.length; i++) {
        const value = BASE64_ALPHABET.indexOf(clean[i]);

        if (value < 0) {
            continue;
        }

        buffer = (buffer << 6) | value;
        bits += 6;

        if (bits >= 8) {
            bits -= 8;
            result[offset++] = (buffer >> bits) & 0xff;
        }
    }

    return offset === length ? result : result.subarray(0, offset);
}
