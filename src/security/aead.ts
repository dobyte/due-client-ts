import { concatBytes, equalBytes, readUint32BE, writeUint32BE } from './bytes';

/**
 * AEAD 套件与实现
 *
 * 套件 ID 与 due 服务端保持一致：
 * 1 -> AES-256-GCM
 * 2 -> ChaCha20-Poly1305
 */

export const SUITE_AES_GCM = 1;
export const SUITE_CHACHA20_POLY1305 = 2;

/**
 * 默认协商套件（按客户端偏好排序）
 */
export const DEFAULT_SUITES = [SUITE_AES_GCM, SUITE_CHACHA20_POLY1305];

/**
 * AEAD 加密器
 */
export interface AeadCipher {
    // 认证标签长度
    readonly tagSize: number;
    // 加密
    seal(nonce: Uint8Array, aad: Uint8Array, plaintext: Uint8Array): Uint8Array;
    // 解密；认证失败返回 null
    open(nonce: Uint8Array, aad: Uint8Array, sealed: Uint8Array): Uint8Array | null;
}

/**
 * 判断套件是否受支持
 * @param id 套件 ID
 * @returns boolean
 */
export function isSuiteSupported(id: number): boolean {
    return id === SUITE_AES_GCM || id === SUITE_CHACHA20_POLY1305;
}

/**
 * 创建 AEAD 加密器
 * @param id 套件 ID
 * @param key 32 字节密钥
 * @returns AeadCipher
 */
export function createAeadCipher(id: number, key: Uint8Array): AeadCipher {
    if (key.length !== 32) {
        throw new Error('security: invalid aead key size');
    }

    switch (id) {
        case SUITE_AES_GCM:
            return createAesGcm(key);
        case SUITE_CHACHA20_POLY1305:
            return createChaCha20Poly1305(key);
        default:
            throw new Error('security: unsupported aead suite');
    }
}

// ---------------------------------------------------------------------------
// 公共工具
// ---------------------------------------------------------------------------

const TAG_SIZE = 16;

function littleEndianToBigInt(bytes: Uint8Array): bigint {
    let value = 0n;

    for (let i = bytes.length - 1; i >= 0; i--) {
        value = (value << 8n) | BigInt(bytes[i]);
    }

    return value;
}

function bigIntToLittleEndian(value: bigint, length: number): Uint8Array {
    const bytes = new Uint8Array(length);

    for (let i = 0; i < length; i++) {
        bytes[i] = Number(value & 0xffn);
        value >>= 8n;
    }

    return bytes;
}

function pad16(length: number): Uint8Array {
    const padding = (16 - (length % 16)) % 16;

    return new Uint8Array(padding);
}

/**
 * 构造 ChaCha20-Poly1305 认证数据：aad | pad | ciphertext | pad | len(aad) | len(ciphertext)
 *
 * 长度字段为小端 64 位
 */
function buildPoly1305Data(aad: Uint8Array, ciphertext: Uint8Array): Uint8Array {
    const aadPadding = pad16(aad.length);
    const ciphertextPadding = pad16(ciphertext.length);
    const data = new Uint8Array(aad.length + aadPadding.length + ciphertext.length + ciphertextPadding.length + 16);
    let offset = 0;

    data.set(aad, offset);
    offset += aad.length;
    data.set(aadPadding, offset);
    offset += aadPadding.length;

    data.set(ciphertext, offset);
    offset += ciphertext.length;
    data.set(ciphertextPadding, offset);
    offset += ciphertextPadding.length;

    const view = new DataView(data.buffer);

    // 长度字段为字节数的小端 64 位编码
    view.setUint32(offset, aad.length >>> 0, true);
    view.setUint32(offset + 4, Math.floor(aad.length / 0x100000000), true);
    view.setUint32(offset + 8, ciphertext.length >>> 0, true);
    view.setUint32(offset + 12, Math.floor(ciphertext.length / 0x100000000), true);

    return data;
}

// ---------------------------------------------------------------------------
// ChaCha20-Poly1305
// ---------------------------------------------------------------------------

function rotl(value: number, bits: number): number {
    return ((value << bits) | (value >>> (32 - bits))) >>> 0;
}

function quarterRound(state: Uint32Array, a: number, b: number, c: number, d: number): void {
    state[a] = (state[a] + state[b]) >>> 0;
    state[d] = rotl(state[d] ^ state[a], 16);
    state[c] = (state[c] + state[d]) >>> 0;
    state[b] = rotl(state[b] ^ state[c], 12);
    state[a] = (state[a] + state[b]) >>> 0;
    state[d] = rotl(state[d] ^ state[a], 8);
    state[c] = (state[c] + state[d]) >>> 0;
    state[b] = rotl(state[b] ^ state[c], 7);
}

function chacha20Block(key: Uint32Array, counter: number, nonce: Uint32Array): Uint32Array {
    const state = new Uint32Array(16);
    state[0] = 0x61707865;
    state[1] = 0x3320646e;
    state[2] = 0x79622d32;
    state[3] = 0x6b206574;
    state.set(key, 4);
    state[12] = counter >>> 0;
    state[13] = nonce[0];
    state[14] = nonce[1];
    state[15] = nonce[2];

    const working = new Uint32Array(state);

    for (let i = 0; i < 10; i++) {
        quarterRound(working, 0, 4, 8, 12);
        quarterRound(working, 1, 5, 9, 13);
        quarterRound(working, 2, 6, 10, 14);
        quarterRound(working, 3, 7, 11, 15);
        quarterRound(working, 0, 5, 10, 15);
        quarterRound(working, 1, 6, 11, 12);
        quarterRound(working, 2, 7, 8, 13);
        quarterRound(working, 3, 4, 9, 14);
    }

    for (let i = 0; i < 16; i++) {
        working[i] = (working[i] + state[i]) >>> 0;
    }

    return working;
}

function blockToBytes(words: Uint32Array): Uint8Array {
    const bytes = new Uint8Array(64);
    const view = new DataView(bytes.buffer);

    for (let i = 0; i < 16; i++) {
        view.setUint32(i * 4, words[i], true);
    }

    return bytes;
}

function chacha20Xor(key: Uint32Array, nonce: Uint32Array, counter: number, data: Uint8Array): Uint8Array {
    const output = new Uint8Array(data.length);

    for (let offset = 0; offset < data.length; offset += 64, counter++) {
        const block = blockToBytes(chacha20Block(key, counter, nonce));
        const end = Math.min(offset + 64, data.length);

        for (let i = offset; i < end; i++) {
            output[i] = data[i] ^ block[i - offset];
        }
    }

    return output;
}

const POLY1305_MODULUS = (1n << 130n) - 5n;

function poly1305(key: Uint8Array, data: Uint8Array): Uint8Array {
    const rBytes = key.slice(0, 16);
    rBytes[3] &= 15;
    rBytes[7] &= 15;
    rBytes[11] &= 15;
    rBytes[15] &= 15;
    rBytes[4] &= 252;
    rBytes[8] &= 252;
    rBytes[12] &= 252;

    const r = littleEndianToBigInt(rBytes);
    const s = littleEndianToBigInt(key.subarray(16, 32));
    let accumulator = 0n;

    for (let offset = 0; offset < data.length; offset += 16) {
        const block = data.subarray(offset, Math.min(offset + 16, data.length));
        const value = littleEndianToBigInt(block) + (1n << BigInt(block.length * 8));
        accumulator = ((accumulator + value) * r) % POLY1305_MODULUS;
    }

    return bigIntToLittleEndian((accumulator + s) & ((1n << 128n) - 1n), 16);
}

function createChaCha20Poly1305(key: Uint8Array): AeadCipher {
    const keyWords = new Uint32Array(8);

    for (let i = 0; i < 8; i++) {
        keyWords[i] = (
            key[i * 4] |
            (key[i * 4 + 1] << 8) |
            (key[i * 4 + 2] << 16) |
            (key[i * 4 + 3] << 24)
        ) >>> 0;
    }

    const nonceWords = (nonce: Uint8Array): Uint32Array => {
        if (nonce.length !== 12) {
            throw new Error('security: invalid nonce size');
        }

        const view = new DataView(nonce.buffer, nonce.byteOffset, nonce.byteLength);

        return new Uint32Array([view.getUint32(0, true), view.getUint32(4, true), view.getUint32(8, true)]);
    };

    const polyKey = (words: Uint32Array): Uint8Array => blockToBytes(chacha20Block(keyWords, 0, words)).subarray(0, 32).slice();

    return {
        tagSize: TAG_SIZE,

        seal(nonce: Uint8Array, aad: Uint8Array, plaintext: Uint8Array): Uint8Array {
            const words = nonceWords(nonce);
            const ciphertext = chacha20Xor(keyWords, words, 1, plaintext);
            const tag = poly1305(polyKey(words), buildPoly1305Data(aad, ciphertext));

            return concatBytes(ciphertext, tag);
        },

        open(nonce: Uint8Array, aad: Uint8Array, sealed: Uint8Array): Uint8Array | null {
            if (sealed.length < TAG_SIZE) {
                return null;
            }

            const words = nonceWords(nonce);
            const ciphertext = sealed.subarray(0, sealed.length - TAG_SIZE);
            const expected = poly1305(polyKey(words), buildPoly1305Data(aad, ciphertext));

            if (!equalBytes(expected, sealed.subarray(sealed.length - TAG_SIZE))) {
                return null;
            }

            return chacha20Xor(keyWords, words, 1, ciphertext);
        },
    };
}

// ---------------------------------------------------------------------------
// AES-256-GCM
// ---------------------------------------------------------------------------

const SBOX = new Uint8Array(256);
const INV_SBOX = new Uint8Array(256);

function xtime(value: number): number {
    return ((value << 1) ^ ((value & 0x80) ? 0x1b : 0)) & 0xff;
}

(function buildSBoxes() {
    const exp = new Uint8Array(255);
    const log = new Uint8Array(256);
    let value = 1;

    for (let i = 0; i < 255; i++) {
        exp[i] = value;
        log[value] = i;
        value ^= xtime(value);
    }

    for (let i = 0; i < 256; i++) {
        const inverse = i === 0 ? 0 : exp[(255 - log[i]) % 255];
        let s = inverse;
        let rotated = inverse;

        for (let j = 0; j < 4; j++) {
            rotated = ((rotated << 1) | (rotated >> 7)) & 0xff;
            s ^= rotated;
        }

        s ^= 0x63;
        SBOX[i] = s;
        INV_SBOX[s] = i;
    }
})();

function subWord(word: number): number {
    return (
        (SBOX[(word >>> 24) & 0xff] << 24) |
        (SBOX[(word >>> 16) & 0xff] << 16) |
        (SBOX[(word >>> 8) & 0xff] << 8) |
        SBOX[word & 0xff]
    ) >>> 0;
}

function rotWord(word: number): number {
    return ((word << 8) | (word >>> 24)) >>> 0;
}

function expandAes256Key(key: Uint8Array): Uint32Array {
    const nk = 8;
    const nr = 14;
    const words = new Uint32Array(4 * (nr + 1));

    for (let i = 0; i < nk; i++) {
        words[i] = readUint32BE(key, i * 4);
    }

    let rcon = 1;

    for (let i = nk; i < words.length; i++) {
        let temp = words[i - 1];

        if (i % nk === 0) {
            temp = subWord(rotWord(temp)) ^ (rcon << 24);
            rcon = xtime(rcon);
        } else if (i % nk === 4) {
            temp = subWord(temp);
        }

        words[i] = (words[i - nk] ^ temp) >>> 0;
    }

    return words;
}

function encryptAesBlock(roundKeys: Uint32Array, input: Uint8Array): Uint8Array {
    const state = input.slice();
    const nr = 14;

    const addRoundKey = (round: number) => {
        for (let column = 0; column < 4; column++) {
            const word = roundKeys[round * 4 + column];

            state[column * 4] ^= (word >>> 24) & 0xff;
            state[column * 4 + 1] ^= (word >>> 16) & 0xff;
            state[column * 4 + 2] ^= (word >>> 8) & 0xff;
            state[column * 4 + 3] ^= word & 0xff;
        }
    };

    const subBytes = () => {
        for (let i = 0; i < 16; i++) {
            state[i] = SBOX[state[i]];
        }
    };

    const shiftRows = () => {
        const copy = state.slice();

        for (let row = 1; row < 4; row++) {
            for (let column = 0; column < 4; column++) {
                state[row + 4 * column] = copy[row + 4 * ((column + row) % 4)];
            }
        }
    };

    const mixColumns = () => {
        for (let column = 0; column < 4; column++) {
            const offset = column * 4;
            const a0 = state[offset];
            const a1 = state[offset + 1];
            const a2 = state[offset + 2];
            const a3 = state[offset + 3];
            const all = a0 ^ a1 ^ a2 ^ a3;

            state[offset] = a0 ^ all ^ xtime(a0 ^ a1);
            state[offset + 1] = a1 ^ all ^ xtime(a1 ^ a2);
            state[offset + 2] = a2 ^ all ^ xtime(a2 ^ a3);
            state[offset + 3] = a3 ^ all ^ xtime(a3 ^ a0);
        }
    };

    addRoundKey(0);

    for (let round = 1; round < nr; round++) {
        subBytes();
        shiftRows();
        mixColumns();
        addRoundKey(round);
    }

    subBytes();
    shiftRows();
    addRoundKey(nr);

    return state;
}

function ghashMultiply(x: Uint8Array, y: Uint8Array): Uint8Array {
    const z = new Uint8Array(16);
    const v = y.slice();

    for (let i = 0; i < 128; i++) {
        if ((x[i >> 3] >> (7 - (i & 7))) & 1) {
            for (let j = 0; j < 16; j++) {
                z[j] ^= v[j];
            }
        }

        const lsb = v[15] & 1;

        for (let j = 15; j > 0; j--) {
            v[j] = ((v[j] >>> 1) | ((v[j - 1] & 1) << 7)) & 0xff;
        }

        v[0] = (v[0] >>> 1) & 0xff;

        if (lsb) {
            v[0] ^= 0xe1;
        }
    }

    return z;
}

function ghash(hashKey: Uint8Array, aad: Uint8Array, ciphertext: Uint8Array): Uint8Array {
    let x: Uint8Array = new Uint8Array(16);

    const update = (data: Uint8Array) => {
        for (let offset = 0; offset < data.length; offset += 16) {
            const block = new Uint8Array(16);
            block.set(data.subarray(offset, Math.min(offset + 16, data.length)));

            for (let i = 0; i < 16; i++) {
                x[i] ^= block[i];
            }

            x = ghashMultiply(x, hashKey);
        }
    };

    update(aad);
    update(ciphertext);

    const lengthBlock = new Uint8Array(16);
    const view = new DataView(lengthBlock.buffer);
    view.setUint32(0, Math.floor(aad.length / 0x20000000));
    view.setUint32(4, (aad.length * 8) >>> 0);
    view.setUint32(8, Math.floor(ciphertext.length / 0x20000000));
    view.setUint32(12, (ciphertext.length * 8) >>> 0);

    for (let i = 0; i < 16; i++) {
        x[i] ^= lengthBlock[i];
    }

    return ghashMultiply(x, hashKey);
}

function createAesGcm(key: Uint8Array): AeadCipher {
    const roundKeys = expandAes256Key(key);
    const hashKey = encryptAesBlock(roundKeys, new Uint8Array(16));

    const counterBlock = (nonce: Uint8Array, counter: number): Uint8Array => {
        if (nonce.length !== 12) {
            throw new Error('security: invalid nonce size');
        }

        const block = new Uint8Array(16);
        block.set(nonce);
        writeUint32BE(block, 12, counter >>> 0);

        return block;
    };

    const ctrCrypt = (nonce: Uint8Array, data: Uint8Array): Uint8Array => {
        const output = new Uint8Array(data.length);
        let counter = 2;

        for (let offset = 0; offset < data.length; offset += 16, counter++) {
            const stream = encryptAesBlock(roundKeys, counterBlock(nonce, counter));
            const end = Math.min(offset + 16, data.length);

            for (let i = offset; i < end; i++) {
                output[i] = data[i] ^ stream[i - offset];
            }
        }

        return output;
    };

    const computeTag = (nonce: Uint8Array, aad: Uint8Array, ciphertext: Uint8Array): Uint8Array => {
        const tag = ghash(hashKey, aad, ciphertext);
        const mask = encryptAesBlock(roundKeys, counterBlock(nonce, 1));

        for (let i = 0; i < 16; i++) {
            tag[i] ^= mask[i];
        }

        return tag;
    };

    return {
        tagSize: TAG_SIZE,

        seal(nonce: Uint8Array, aad: Uint8Array, plaintext: Uint8Array): Uint8Array {
            const ciphertext = ctrCrypt(nonce, plaintext);

            return concatBytes(ciphertext, computeTag(nonce, aad, ciphertext));
        },

        open(nonce: Uint8Array, aad: Uint8Array, sealed: Uint8Array): Uint8Array | null {
            if (sealed.length < TAG_SIZE) {
                return null;
            }

            const ciphertext = sealed.subarray(0, sealed.length - TAG_SIZE);

            if (!equalBytes(computeTag(nonce, aad, ciphertext), sealed.subarray(sealed.length - TAG_SIZE))) {
                return null;
            }

            return ctrCrypt(nonce, ciphertext);
        },
    };
}
