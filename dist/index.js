'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _classCallCheck(a, n) {
  if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function");
}

function _typeof(o) {
  "@babel/helpers - typeof";

  return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) {
    return typeof o;
  } : function (o) {
    return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
  }, _typeof(o);
}

function toPrimitive(t, e) {
  if ("object" != _typeof(t) || !t) return t;
  var r;
  if ("undefined" != typeof Symbol && void 0 !== (r = t[Symbol.toPrimitive])) {
    var i = r.call(t, e || "default");
    if ("object" != _typeof(i)) return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return ("string" === e ? String : Number)(t);
}

function toPropertyKey(t) {
  var i = toPrimitive(t, "string");
  return "symbol" == _typeof(i) ? i : i + "";
}

function _defineProperties(e, r) {
  for (var t = 0; t < r.length; t++) {
    var o = r[t];
    o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, toPropertyKey(o.key), o);
  }
}
function _createClass(e, r, t) {
  return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", {
    writable: !1
  }), e;
}

function _defineProperty(e, r, t) {
  return (r = toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
    value: t,
    enumerable: !0,
    configurable: !0,
    writable: !0
  }) : e[r] = t, e;
}

var BIG_ENDIAN = 'big';
var LITTLE_ENDIAN = 'little';
var DEFAULT_BYTE_ORDER = BIG_ENDIAN;
var DEFAULT_SIZE_BYTES = 4;
var DEFAULT_HEADER_BYTES = 1;
var DEFAULT_ROUTE_BYTES = 2;
var DEFAULT_SEQ_BYTES = 2;
var DEFAULT_TIMESTAMP_BYTES = 8;
var DEFAULT_BUFFER_BYTES = 5000;
var HEARTBEAT_BIT = 1 << 7;
var HANDSHAKE_BIT = 1 << 0;
var Packer = /*#__PURE__*/function () {
  function Packer(opts) {
    _classCallCheck(this, Packer);
    _defineProperty(this, "byteOrder", void 0);
    _defineProperty(this, "seqBytes", void 0);
    _defineProperty(this, "routeBytes", void 0);
    _defineProperty(this, "bufferBytes", void 0);
    _defineProperty(this, "heartbeat", void 0);
    this.byteOrder = opts ? opts.byteOrder ? opts.byteOrder : DEFAULT_BYTE_ORDER : DEFAULT_BYTE_ORDER;
    this.routeBytes = opts ? opts.routeBytes ? opts.routeBytes : DEFAULT_ROUTE_BYTES : DEFAULT_ROUTE_BYTES;
    this.seqBytes = opts ? opts.seqBytes !== undefined ? opts.seqBytes : DEFAULT_SEQ_BYTES : DEFAULT_SEQ_BYTES;
    this.bufferBytes = opts ? opts.bufferBytes !== undefined ? opts.bufferBytes : DEFAULT_BUFFER_BYTES : DEFAULT_BUFFER_BYTES;
    this.heartbeat = this.doPackHeartbeat();
  }
  _createClass(Packer, [{
    key: "packHeartbeat",
    value: function packHeartbeat() {
      return this.heartbeat;
    }
  }, {
    key: "doPackHeartbeat",
    value: function doPackHeartbeat() {
      var offset = 0;
      var arrayBuffer = new ArrayBuffer(DEFAULT_SIZE_BYTES + DEFAULT_HEADER_BYTES);
      var dataView = new DataView(arrayBuffer);
      var isLittleEndian = this.byteOrder == LITTLE_ENDIAN;
      dataView.setUint32(offset, DEFAULT_HEADER_BYTES, isLittleEndian);
      offset += DEFAULT_SIZE_BYTES;
      dataView.setUint8(offset, HEARTBEAT_BIT);
      offset += DEFAULT_HEADER_BYTES;
      return arrayBuffer;
    }
  }, {
    key: "packHandshake",
    value: function packHandshake(payload) {
      if (payload.length > this.bufferBytes) {
        throw 'handshake too large';
      }
      var size = DEFAULT_HEADER_BYTES + payload.length;
      var arrayBuffer = new ArrayBuffer(DEFAULT_SIZE_BYTES + size);
      var dataView = new DataView(arrayBuffer);
      var isLittleEndian = this.byteOrder == LITTLE_ENDIAN;
      dataView.setUint32(0, size, isLittleEndian);
      dataView.setUint8(DEFAULT_SIZE_BYTES, HANDSHAKE_BIT);
      new Uint8Array(arrayBuffer).set(payload, DEFAULT_SIZE_BYTES + DEFAULT_HEADER_BYTES);
      return arrayBuffer;
    }
  }, {
    key: "packMessage",
    value: function packMessage(message) {
      var seq = message.seq || 0;
      var route = message.route;
      var offset = 0;
      var size = DEFAULT_HEADER_BYTES + this.routeBytes + this.seqBytes + (message.buffer ? message.buffer.length : 0);
      var isLittleEndian = this.byteOrder == LITTLE_ENDIAN;
      if (route > Math.pow(2, 8 * this.routeBytes) / 2 - 1 || route < Math.pow(2, 8 * this.routeBytes) / -2) {
        throw 'route overflow';
      }
      if (this.seqBytes > 0 && (seq > Math.pow(2, 8 * this.seqBytes) / 2 - 1 || seq < Math.pow(2, 8 * this.seqBytes) / -2)) {
        throw 'seq overflow';
      }
      if (message.buffer && message.buffer.length > this.bufferBytes) {
        throw 'message too large';
      }
      var arrayBuffer = new ArrayBuffer(DEFAULT_SIZE_BYTES + size);
      var dataView = new DataView(arrayBuffer);
      dataView.setUint32(offset, size, isLittleEndian);
      offset += DEFAULT_SIZE_BYTES;
      dataView.setUint8(offset, 0);
      offset += DEFAULT_HEADER_BYTES;
      switch (this.routeBytes) {
        case 1:
          dataView.setInt8(offset, route);
          break;
        case 2:
          dataView.setInt16(offset, route, isLittleEndian);
          break;
        case 4:
          dataView.setInt32(offset, route, isLittleEndian);
          break;
      }
      offset += this.routeBytes;
      switch (this.seqBytes) {
        case 1:
          dataView.setInt8(offset, seq);
          break;
        case 2:
          dataView.setInt16(offset, seq, isLittleEndian);
          break;
        case 4:
          dataView.setInt32(offset, seq, isLittleEndian);
          break;
      }
      offset += this.seqBytes;
      if (message.buffer) {
        new Uint8Array(arrayBuffer).set(message.buffer, offset);
      }
      return arrayBuffer;
    }
  }, {
    key: "unpack",
    value: function unpack(data) {
      var offset = 0;
      var dataView = new DataView(data);
      var isLittleEndian = this.byteOrder == LITTLE_ENDIAN;
      var size = dataView.getUint32(offset, isLittleEndian);
      offset += DEFAULT_SIZE_BYTES;
      if (size + DEFAULT_SIZE_BYTES > data.byteLength) {
        throw 'invalid packet';
      }
      var header = dataView.getUint8(offset);
      offset += DEFAULT_HEADER_BYTES;
      var isHeartbeat = (header & HEARTBEAT_BIT) == HEARTBEAT_BIT;
      if (isHeartbeat) {
        if (size + DEFAULT_SIZE_BYTES > offset) {
          var millisecond = Number(dataView.getBigUint64(offset, isLittleEndian).toString());
          offset += DEFAULT_TIMESTAMP_BYTES;
          return {
            isHeartbeat: isHeartbeat,
            isHandshake: false,
            millisecond: millisecond
          };
        } else {
          return {
            isHeartbeat: isHeartbeat,
            isHandshake: false
          };
        }
      }
      if ((header & HANDSHAKE_BIT) == HANDSHAKE_BIT) {
        var end = DEFAULT_SIZE_BYTES + size;
        return {
          isHeartbeat: false,
          isHandshake: true,
          handshake: end > offset ? new Uint8Array(data, offset, end - offset) : new Uint8Array(0)
        };
      }
      var message = {
        seq: 0,
        route: 0
      };
      if (this.routeBytes) {
        switch (this.routeBytes) {
          case 1:
            message.route = dataView.getInt8(offset);
            break;
          case 2:
            message.route = dataView.getInt16(offset, isLittleEndian);
            break;
          case 4:
            message.route = dataView.getInt32(offset, isLittleEndian);
            break;
        }
      }
      offset += this.routeBytes;
      switch (this.seqBytes) {
        case 1:
          message.seq = dataView.getInt8(offset);
          break;
        case 2:
          message.seq = dataView.getInt16(offset, isLittleEndian);
          break;
        case 4:
          message.seq = dataView.getInt32(offset, isLittleEndian);
          break;
      }
      offset += this.seqBytes;
      if (size + DEFAULT_SIZE_BYTES > offset) {
        message.buffer = new Uint8Array(data, offset, size + DEFAULT_SIZE_BYTES - offset);
        offset += message.buffer.length;
      }
      return {
        isHeartbeat: isHeartbeat,
        isHandshake: false,
        message: message
      };
    }
  }]);
  return Packer;
}();

function randomBytes(length, source) {
  if (source) {
    var bytes = source(length);
    if (!bytes || bytes.length !== length) {
      throw new Error('security: invalid random source');
    }
    return bytes;
  }
  var crypto = globalThis.crypto || globalThis.msCrypto;
  if (crypto && typeof crypto.getRandomValues === 'function') {
    var _bytes = new Uint8Array(length);
    for (var offset = 0; offset < length; offset += 65536) {
      crypto.getRandomValues(_bytes.subarray(offset, Math.min(offset + 65536, length)));
    }
    return _bytes;
  }
  throw new Error('security: a csprng is required, please provide security.random');
}
function concatBytes() {
  var length = 0;
  for (var _len = arguments.length, arrays = new Array(_len), _key = 0; _key < _len; _key++) {
    arrays[_key] = arguments[_key];
  }
  for (var _i = 0, _arrays = arrays; _i < _arrays.length; _i++) {
    var array = _arrays[_i];
    length += array.length;
  }
  var result = new Uint8Array(length);
  var offset = 0;
  for (var _i2 = 0, _arrays2 = arrays; _i2 < _arrays2.length; _i2++) {
    var _array = _arrays2[_i2];
    result.set(_array, offset);
    offset += _array.length;
  }
  return result;
}
function equalBytes(a, b) {
  if (a.length !== b.length) {
    return false;
  }
  var diff = 0;
  for (var i = 0; i < a.length; i++) {
    diff |= a[i] ^ b[i];
  }
  return diff === 0;
}
function utf8Bytes(text) {
  if (typeof TextEncoder !== 'undefined') {
    return new TextEncoder().encode(text);
  }
  var result = [];
  for (var i = 0; i < text.length; i++) {
    var code = text.charCodeAt(i);
    if (code < 0x80) {
      result.push(code);
    } else if (code < 0x800) {
      result.push(0xc0 | code >> 6, 0x80 | code & 0x3f);
    } else {
      result.push(0xe0 | code >> 12, 0x80 | code >> 6 & 0x3f, 0x80 | code & 0x3f);
    }
  }
  return new Uint8Array(result);
}
function readUint32BE(data) {
  var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  return (data[offset] << 24 | data[offset + 1] << 16 | data[offset + 2] << 8 | data[offset + 3]) >>> 0;
}
function writeUint32BE(data, offset, value) {
  data[offset] = value >>> 24 & 0xff;
  data[offset + 1] = value >>> 16 & 0xff;
  data[offset + 2] = value >>> 8 & 0xff;
  data[offset + 3] = value & 0xff;
}
function writeUint64BE(data, offset, value) {
  for (var i = 7; i >= 0; i--) {
    data[offset + i] = Number(value & 0xffn);
    value >>= 8n;
  }
}
function readUint64BE$1(data) {
  var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  var value = 0n;
  for (var i = 0; i < 8; i++) {
    value = value << 8n | BigInt(data[offset + i]);
  }
  return value;
}
function bytesToBigInt(data) {
  var value = 0n;
  for (var i = 0; i < data.length; i++) {
    value = value << 8n | BigInt(data[i]);
  }
  return value;
}
function bigIntToBytes(value, length) {
  var bytes = new Uint8Array(length);
  for (var i = length - 1; i >= 0; i--) {
    bytes[i] = Number(value & 0xffn);
    value >>= 8n;
  }
  return bytes;
}
var BASE64_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
function base64Decode(text) {
  var clean = text.replace(/[^A-Za-z0-9+/]/g, '');
  var length = Math.floor(clean.length * 3 / 4);
  var result = new Uint8Array(length);
  var offset = 0;
  var buffer = 0;
  var bits = 0;
  for (var i = 0; i < clean.length; i++) {
    var value = BASE64_ALPHABET.indexOf(clean[i]);
    if (value < 0) {
      continue;
    }
    buffer = buffer << 6 | value;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      result[offset++] = buffer >> bits & 0xff;
    }
  }
  return offset === length ? result : result.subarray(0, offset);
}

var SUITE_AES_GCM = 1;
var SUITE_CHACHA20_POLY1305 = 2;
var DEFAULT_SUITES = [SUITE_AES_GCM, SUITE_CHACHA20_POLY1305];
function isSuiteSupported(id) {
  return id === SUITE_AES_GCM || id === SUITE_CHACHA20_POLY1305;
}
function createAeadCipher(id, key) {
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
var TAG_SIZE = 16;
function littleEndianToBigInt$1(bytes) {
  var value = 0n;
  for (var i = bytes.length - 1; i >= 0; i--) {
    value = value << 8n | BigInt(bytes[i]);
  }
  return value;
}
function bigIntToLittleEndian$1(value, length) {
  var bytes = new Uint8Array(length);
  for (var i = 0; i < length; i++) {
    bytes[i] = Number(value & 0xffn);
    value >>= 8n;
  }
  return bytes;
}
function pad16(length) {
  var padding = (16 - length % 16) % 16;
  return new Uint8Array(padding);
}
function buildPoly1305Data(aad, ciphertext) {
  var aadPadding = pad16(aad.length);
  var ciphertextPadding = pad16(ciphertext.length);
  var data = new Uint8Array(aad.length + aadPadding.length + ciphertext.length + ciphertextPadding.length + 16);
  var offset = 0;
  data.set(aad, offset);
  offset += aad.length;
  data.set(aadPadding, offset);
  offset += aadPadding.length;
  data.set(ciphertext, offset);
  offset += ciphertext.length;
  data.set(ciphertextPadding, offset);
  offset += ciphertextPadding.length;
  var view = new DataView(data.buffer);
  view.setUint32(offset, aad.length >>> 0, true);
  view.setUint32(offset + 4, Math.floor(aad.length / 0x100000000), true);
  view.setUint32(offset + 8, ciphertext.length >>> 0, true);
  view.setUint32(offset + 12, Math.floor(ciphertext.length / 0x100000000), true);
  return data;
}
function rotl$1(value, bits) {
  return (value << bits | value >>> 32 - bits) >>> 0;
}
function quarterRound(state, a, b, c, d) {
  state[a] = state[a] + state[b] >>> 0;
  state[d] = rotl$1(state[d] ^ state[a], 16);
  state[c] = state[c] + state[d] >>> 0;
  state[b] = rotl$1(state[b] ^ state[c], 12);
  state[a] = state[a] + state[b] >>> 0;
  state[d] = rotl$1(state[d] ^ state[a], 8);
  state[c] = state[c] + state[d] >>> 0;
  state[b] = rotl$1(state[b] ^ state[c], 7);
}
function chacha20Block(key, counter, nonce) {
  var state = new Uint32Array(16);
  state[0] = 0x61707865;
  state[1] = 0x3320646e;
  state[2] = 0x79622d32;
  state[3] = 0x6b206574;
  state.set(key, 4);
  state[12] = counter >>> 0;
  state[13] = nonce[0];
  state[14] = nonce[1];
  state[15] = nonce[2];
  var working = new Uint32Array(state);
  for (var i = 0; i < 10; i++) {
    quarterRound(working, 0, 4, 8, 12);
    quarterRound(working, 1, 5, 9, 13);
    quarterRound(working, 2, 6, 10, 14);
    quarterRound(working, 3, 7, 11, 15);
    quarterRound(working, 0, 5, 10, 15);
    quarterRound(working, 1, 6, 11, 12);
    quarterRound(working, 2, 7, 8, 13);
    quarterRound(working, 3, 4, 9, 14);
  }
  for (var _i = 0; _i < 16; _i++) {
    working[_i] = working[_i] + state[_i] >>> 0;
  }
  return working;
}
function blockToBytes(words) {
  var bytes = new Uint8Array(64);
  var view = new DataView(bytes.buffer);
  for (var i = 0; i < 16; i++) {
    view.setUint32(i * 4, words[i], true);
  }
  return bytes;
}
function chacha20Xor(key, nonce, counter, data) {
  var output = new Uint8Array(data.length);
  for (var offset = 0; offset < data.length; offset += 64, counter++) {
    var block = blockToBytes(chacha20Block(key, counter, nonce));
    var end = Math.min(offset + 64, data.length);
    for (var i = offset; i < end; i++) {
      output[i] = data[i] ^ block[i - offset];
    }
  }
  return output;
}
var POLY1305_MODULUS = (1n << 130n) - 5n;
function poly1305(key, data) {
  var rBytes = key.slice(0, 16);
  rBytes[3] &= 15;
  rBytes[7] &= 15;
  rBytes[11] &= 15;
  rBytes[15] &= 15;
  rBytes[4] &= 252;
  rBytes[8] &= 252;
  rBytes[12] &= 252;
  var r = littleEndianToBigInt$1(rBytes);
  var s = littleEndianToBigInt$1(key.subarray(16, 32));
  var accumulator = 0n;
  for (var offset = 0; offset < data.length; offset += 16) {
    var block = data.subarray(offset, Math.min(offset + 16, data.length));
    var value = littleEndianToBigInt$1(block) + (1n << BigInt(block.length * 8));
    accumulator = (accumulator + value) * r % POLY1305_MODULUS;
  }
  return bigIntToLittleEndian$1(accumulator + s & (1n << 128n) - 1n, 16);
}
function createChaCha20Poly1305(key) {
  var keyWords = new Uint32Array(8);
  for (var i = 0; i < 8; i++) {
    keyWords[i] = (key[i * 4] | key[i * 4 + 1] << 8 | key[i * 4 + 2] << 16 | key[i * 4 + 3] << 24) >>> 0;
  }
  var nonceWords = function nonceWords(nonce) {
    if (nonce.length !== 12) {
      throw new Error('security: invalid nonce size');
    }
    var view = new DataView(nonce.buffer, nonce.byteOffset, nonce.byteLength);
    return new Uint32Array([view.getUint32(0, true), view.getUint32(4, true), view.getUint32(8, true)]);
  };
  var polyKey = function polyKey(words) {
    return blockToBytes(chacha20Block(keyWords, 0, words)).subarray(0, 32).slice();
  };
  return {
    tagSize: TAG_SIZE,
    seal: function seal(nonce, aad, plaintext) {
      var words = nonceWords(nonce);
      var ciphertext = chacha20Xor(keyWords, words, 1, plaintext);
      var tag = poly1305(polyKey(words), buildPoly1305Data(aad, ciphertext));
      return concatBytes(ciphertext, tag);
    },
    open: function open(nonce, aad, sealed) {
      if (sealed.length < TAG_SIZE) {
        return null;
      }
      var words = nonceWords(nonce);
      var ciphertext = sealed.subarray(0, sealed.length - TAG_SIZE);
      var expected = poly1305(polyKey(words), buildPoly1305Data(aad, ciphertext));
      if (!equalBytes(expected, sealed.subarray(sealed.length - TAG_SIZE))) {
        return null;
      }
      return chacha20Xor(keyWords, words, 1, ciphertext);
    }
  };
}
var SBOX = new Uint8Array(256);
var INV_SBOX = new Uint8Array(256);
function xtime(value) {
  return (value << 1 ^ (value & 0x80 ? 0x1b : 0)) & 0xff;
}
(function buildSBoxes() {
  var exp = new Uint8Array(255);
  var log = new Uint8Array(256);
  var value = 1;
  for (var i = 0; i < 255; i++) {
    exp[i] = value;
    log[value] = i;
    value ^= xtime(value);
  }
  for (var _i2 = 0; _i2 < 256; _i2++) {
    var inverse = _i2 === 0 ? 0 : exp[(255 - log[_i2]) % 255];
    var s = inverse;
    var rotated = inverse;
    for (var j = 0; j < 4; j++) {
      rotated = (rotated << 1 | rotated >> 7) & 0xff;
      s ^= rotated;
    }
    s ^= 0x63;
    SBOX[_i2] = s;
    INV_SBOX[s] = _i2;
  }
})();
function subWord(word) {
  return (SBOX[word >>> 24 & 0xff] << 24 | SBOX[word >>> 16 & 0xff] << 16 | SBOX[word >>> 8 & 0xff] << 8 | SBOX[word & 0xff]) >>> 0;
}
function rotWord(word) {
  return (word << 8 | word >>> 24) >>> 0;
}
function expandAes256Key(key) {
  var nk = 8;
  var nr = 14;
  var words = new Uint32Array(4 * (nr + 1));
  for (var i = 0; i < nk; i++) {
    words[i] = readUint32BE(key, i * 4);
  }
  var rcon = 1;
  for (var _i3 = nk; _i3 < words.length; _i3++) {
    var temp = words[_i3 - 1];
    if (_i3 % nk === 0) {
      temp = subWord(rotWord(temp)) ^ rcon << 24;
      rcon = xtime(rcon);
    } else if (_i3 % nk === 4) {
      temp = subWord(temp);
    }
    words[_i3] = (words[_i3 - nk] ^ temp) >>> 0;
  }
  return words;
}
function encryptAesBlock(roundKeys, input) {
  var state = input.slice();
  var nr = 14;
  var addRoundKey = function addRoundKey(round) {
    for (var column = 0; column < 4; column++) {
      var word = roundKeys[round * 4 + column];
      state[column * 4] ^= word >>> 24 & 0xff;
      state[column * 4 + 1] ^= word >>> 16 & 0xff;
      state[column * 4 + 2] ^= word >>> 8 & 0xff;
      state[column * 4 + 3] ^= word & 0xff;
    }
  };
  var subBytes = function subBytes() {
    for (var i = 0; i < 16; i++) {
      state[i] = SBOX[state[i]];
    }
  };
  var shiftRows = function shiftRows() {
    var copy = state.slice();
    for (var row = 1; row < 4; row++) {
      for (var column = 0; column < 4; column++) {
        state[row + 4 * column] = copy[row + 4 * ((column + row) % 4)];
      }
    }
  };
  var mixColumns = function mixColumns() {
    for (var column = 0; column < 4; column++) {
      var offset = column * 4;
      var a0 = state[offset];
      var a1 = state[offset + 1];
      var a2 = state[offset + 2];
      var a3 = state[offset + 3];
      var all = a0 ^ a1 ^ a2 ^ a3;
      state[offset] = a0 ^ all ^ xtime(a0 ^ a1);
      state[offset + 1] = a1 ^ all ^ xtime(a1 ^ a2);
      state[offset + 2] = a2 ^ all ^ xtime(a2 ^ a3);
      state[offset + 3] = a3 ^ all ^ xtime(a3 ^ a0);
    }
  };
  addRoundKey(0);
  for (var round = 1; round < nr; round++) {
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
function ghashMultiply(x, y) {
  var z = new Uint8Array(16);
  var v = y.slice();
  for (var i = 0; i < 128; i++) {
    if (x[i >> 3] >> 7 - (i & 7) & 1) {
      for (var j = 0; j < 16; j++) {
        z[j] ^= v[j];
      }
    }
    var lsb = v[15] & 1;
    for (var _j = 15; _j > 0; _j--) {
      v[_j] = (v[_j] >>> 1 | (v[_j - 1] & 1) << 7) & 0xff;
    }
    v[0] = v[0] >>> 1 & 0xff;
    if (lsb) {
      v[0] ^= 0xe1;
    }
  }
  return z;
}
function ghash(hashKey, aad, ciphertext) {
  var x = new Uint8Array(16);
  var update = function update(data) {
    for (var offset = 0; offset < data.length; offset += 16) {
      var block = new Uint8Array(16);
      block.set(data.subarray(offset, Math.min(offset + 16, data.length)));
      for (var i = 0; i < 16; i++) {
        x[i] ^= block[i];
      }
      x = ghashMultiply(x, hashKey);
    }
  };
  update(aad);
  update(ciphertext);
  var lengthBlock = new Uint8Array(16);
  var view = new DataView(lengthBlock.buffer);
  view.setUint32(0, Math.floor(aad.length / 0x20000000));
  view.setUint32(4, aad.length * 8 >>> 0);
  view.setUint32(8, Math.floor(ciphertext.length / 0x20000000));
  view.setUint32(12, ciphertext.length * 8 >>> 0);
  for (var i = 0; i < 16; i++) {
    x[i] ^= lengthBlock[i];
  }
  return ghashMultiply(x, hashKey);
}
function createAesGcm(key) {
  var roundKeys = expandAes256Key(key);
  var hashKey = encryptAesBlock(roundKeys, new Uint8Array(16));
  var counterBlock = function counterBlock(nonce, counter) {
    if (nonce.length !== 12) {
      throw new Error('security: invalid nonce size');
    }
    var block = new Uint8Array(16);
    block.set(nonce);
    writeUint32BE(block, 12, counter >>> 0);
    return block;
  };
  var ctrCrypt = function ctrCrypt(nonce, data) {
    var output = new Uint8Array(data.length);
    var counter = 2;
    for (var offset = 0; offset < data.length; offset += 16, counter++) {
      var stream = encryptAesBlock(roundKeys, counterBlock(nonce, counter));
      var end = Math.min(offset + 16, data.length);
      for (var i = offset; i < end; i++) {
        output[i] = data[i] ^ stream[i - offset];
      }
    }
    return output;
  };
  var computeTag = function computeTag(nonce, aad, ciphertext) {
    var tag = ghash(hashKey, aad, ciphertext);
    var mask = encryptAesBlock(roundKeys, counterBlock(nonce, 1));
    for (var i = 0; i < 16; i++) {
      tag[i] ^= mask[i];
    }
    return tag;
  };
  return {
    tagSize: TAG_SIZE,
    seal: function seal(nonce, aad, plaintext) {
      var ciphertext = ctrCrypt(nonce, plaintext);
      return concatBytes(ciphertext, computeTag(nonce, aad, ciphertext));
    },
    open: function open(nonce, aad, sealed) {
      if (sealed.length < TAG_SIZE) {
        return null;
      }
      var ciphertext = sealed.subarray(0, sealed.length - TAG_SIZE);
      if (!equalBytes(computeTag(nonce, aad, ciphertext), sealed.subarray(sealed.length - TAG_SIZE))) {
        return null;
      }
      return ctrCrypt(nonce, ciphertext);
    }
  };
}

function _arrayWithHoles(r) {
  if (Array.isArray(r)) return r;
}

function _iterableToArrayLimit(r, l) {
  var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
  if (null != t) {
    var e,
      n,
      i,
      u,
      a = [],
      f = !0,
      o = !1;
    try {
      if (i = (t = t.call(r)).next, 0 === l) {
        if (Object(t) !== t) return;
        f = !1;
      } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0);
    } catch (r) {
      o = !0, n = r;
    } finally {
      try {
        if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return;
      } finally {
        if (o) throw n;
      }
    }
    return a;
  }
}

function _arrayLikeToArray$1(r, a) {
  (null == a || a > r.length) && (a = r.length);
  for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
  return n;
}

function _unsupportedIterableToArray$1(r, a) {
  if (r) {
    if ("string" == typeof r) return _arrayLikeToArray$1(r, a);
    var t = {}.toString.call(r).slice(8, -1);
    return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray$1(r, a) : void 0;
  }
}

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

function _slicedToArray(r, e) {
  return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray$1(r, e) || _nonIterableRest();
}

var K = new Uint32Array([0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da, 0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070, 0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2]);
var H0 = new Uint32Array([0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19]);
var H224 = new Uint32Array([0xc1059ed8, 0x367cd507, 0x3070dd17, 0xf70e5939, 0xffc00b31, 0x68581511, 0x64f98fa7, 0xbefa4fa4]);
function rotr(value, bits) {
  return (value >>> bits | value << 32 - bits) >>> 0;
}
function sha256Core(initial, outLength, data) {
  var length = data.length;
  var padded = new Uint8Array(length + 9 + 63 >> 6 << 6);
  padded.set(data);
  padded[length] = 0x80;
  var view = new DataView(padded.buffer);
  var bitLength = length * 8;
  view.setUint32(padded.length - 8, Math.floor(bitLength / 0x100000000));
  view.setUint32(padded.length - 4, bitLength >>> 0);
  var hash = new Uint32Array(initial);
  var w = new Uint32Array(64);
  for (var offset = 0; offset < padded.length; offset += 64) {
    for (var i = 0; i < 16; i++) {
      w[i] = view.getUint32(offset + i * 4);
    }
    for (var _i = 16; _i < 64; _i++) {
      var s0 = (rotr(w[_i - 15], 7) ^ rotr(w[_i - 15], 18) ^ w[_i - 15] >>> 3) >>> 0;
      var s1 = (rotr(w[_i - 2], 17) ^ rotr(w[_i - 2], 19) ^ w[_i - 2] >>> 10) >>> 0;
      w[_i] = w[_i - 16] + s0 + w[_i - 7] + s1 >>> 0;
    }
    var _hash = _slicedToArray(hash, 8),
      a = _hash[0],
      b = _hash[1],
      c = _hash[2],
      d = _hash[3],
      e = _hash[4],
      f = _hash[5],
      g = _hash[6],
      h = _hash[7];
    for (var _i2 = 0; _i2 < 64; _i2++) {
      var _s = (rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25)) >>> 0;
      var ch = (e & f ^ ~e & g) >>> 0;
      var t1 = h + _s + ch + K[_i2] + w[_i2] >>> 0;
      var _s2 = (rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22)) >>> 0;
      var maj = (a & b ^ a & c ^ b & c) >>> 0;
      var t2 = _s2 + maj >>> 0;
      h = g;
      g = f;
      f = e;
      e = d + t1 >>> 0;
      d = c;
      c = b;
      b = a;
      a = t1 + t2 >>> 0;
    }
    hash[0] = hash[0] + a >>> 0;
    hash[1] = hash[1] + b >>> 0;
    hash[2] = hash[2] + c >>> 0;
    hash[3] = hash[3] + d >>> 0;
    hash[4] = hash[4] + e >>> 0;
    hash[5] = hash[5] + f >>> 0;
    hash[6] = hash[6] + g >>> 0;
    hash[7] = hash[7] + h >>> 0;
  }
  var digest = new Uint8Array(outLength);
  var digestView = new DataView(digest.buffer);
  for (var _i3 = 0; _i3 < outLength / 4; _i3++) {
    digestView.setUint32(_i3 * 4, hash[_i3]);
  }
  return digest;
}
function sha256(data) {
  return sha256Core(H0, 32, data);
}
function sha224(data) {
  return sha256Core(H224, 28, data);
}
function hmacSha256(key, data) {
  var blockSize = 64;
  var normalized = key.length > blockSize ? sha256(key) : key;
  var padded = new Uint8Array(blockSize);
  padded.set(normalized);
  var inner = new Uint8Array(blockSize + data.length);
  var outer = new Uint8Array(blockSize + 32);
  for (var i = 0; i < blockSize; i++) {
    inner[i] = padded[i] ^ 0x36;
    outer[i] = padded[i] ^ 0x5c;
  }
  inner.set(data, blockSize);
  outer.set(sha256(inner), blockSize);
  return sha256(outer);
}
function hkdfSha256(ikm, salt, info, length) {
  var prk = hmacSha256(salt, ikm);
  var blocks = Math.ceil(length / 32);
  var output = new Uint8Array(blocks * 32);
  var previous = new Uint8Array(0);
  for (var i = 0; i < blocks; i++) {
    var input = new Uint8Array(previous.length + info.length + 1);
    input.set(previous);
    input.set(info, previous.length);
    input[input.length - 1] = i + 1;
    previous = hmacSha256(prk, input);
    output.set(previous, i * 32);
  }
  return output.subarray(0, length);
}

var P = (1n << 255n) - 19n;
var A24 = 121665n;
var BASE_POINT = new Uint8Array(32);
BASE_POINT[0] = 9;
function mod$1(value) {
  var result = value % P;
  return result >= 0n ? result : result + P;
}
function modPow$1(base, exponent, modulus) {
  var result = 1n;
  var value = base % modulus;
  while (exponent > 0n) {
    if (exponent & 1n) {
      result = result * value % modulus;
    }
    exponent >>= 1n;
    value = value * value % modulus;
  }
  return result;
}
function littleEndianToBigInt(bytes) {
  var value = 0n;
  for (var i = bytes.length - 1; i >= 0; i--) {
    value = value << 8n | BigInt(bytes[i]);
  }
  return value;
}
function bigIntToLittleEndian(value) {
  var bytes = new Uint8Array(32);
  for (var i = 0; i < 32; i++) {
    bytes[i] = Number(value & 0xffn);
    value >>= 8n;
  }
  return bytes;
}
function clampPrivateKey(privateKey) {
  if (privateKey.length !== 32) {
    throw new Error('x25519: invalid private key size');
  }
  var clamped = privateKey.slice();
  clamped[0] &= 248;
  clamped[31] &= 127;
  clamped[31] |= 64;
  return clamped;
}
function x25519(privateKey, peerPublicKey) {
  if (privateKey.length !== 32 || peerPublicKey.length !== 32) {
    throw new Error('x25519: invalid key size');
  }
  var scalar = littleEndianToBigInt(clampPrivateKey(privateKey));
  var encoded = peerPublicKey.slice();
  encoded[31] &= 127;
  var x1 = mod$1(littleEndianToBigInt(encoded));
  var x2 = 1n;
  var z2 = 0n;
  var x3 = x1;
  var z3 = 1n;
  var swap = 0;
  for (var t = 254; t >= 0; t--) {
    var bit = Number(scalar >> BigInt(t) & 1n);
    swap ^= bit;
    if (swap) {
      var _ref = [x3, x2];
      x2 = _ref[0];
      x3 = _ref[1];
      var _ref2 = [z3, z2];
      z2 = _ref2[0];
      z3 = _ref2[1];
    }
    swap = bit;
    var a = mod$1(x2 + z2);
    var aa = mod$1(a * a);
    var b = mod$1(x2 - z2);
    var bb = mod$1(b * b);
    var e = mod$1(aa - bb);
    var c = mod$1(x3 + z3);
    var d = mod$1(x3 - z3);
    var da = mod$1(d * a);
    var cb = mod$1(c * b);
    var daPlusCb = mod$1(da + cb);
    var daMinusCb = mod$1(da - cb);
    x3 = mod$1(daPlusCb * daPlusCb);
    z3 = mod$1(x1 * daMinusCb * daMinusCb);
    x2 = mod$1(aa * bb);
    z2 = mod$1(e * mod$1(aa + A24 * e));
  }
  if (swap) {
    var _ref3 = [x3, x2];
    x2 = _ref3[0];
    x3 = _ref3[1];
    var _ref4 = [z3, z2];
    z2 = _ref4[0];
    z3 = _ref4[1];
  }
  var shared = mod$1(x2 * modPow$1(z2, P - 2n, P));
  if (shared === 0n) {
    throw new Error('x25519: low order point');
  }
  return bigIntToLittleEndian(shared);
}
function generateX25519KeyPair(random) {
  var privateKey = clampPrivateKey(randomBytes(32, random));
  return {
    privateKey: privateKey,
    publicKey: x25519(privateKey, BASE_POINT)
  };
}

function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
var VERSION = 1;
var FRAME_CLIENT_HELLO = 1;
var FRAME_SERVER_HELLO = 2;
var FRAME_FINISHED = 3;
var FRAME_HEADER_SIZE = 4;
var RANDOM_SIZE = 32;
var PUBLIC_KEY_SIZE = 32;
var MAC_SIZE = 32;
var SERVER_HELLO_PREFIX_SIZE = 1 + RANDOM_SIZE + PUBLIC_KEY_SIZE;
var TRANSCRIPT_LABEL = 'due-handshake-v1';
var KEY_MATERIAL_SIZE = 32 * 4 + 4;
var ENVELOPE_HEADER_SIZE = 9;
var AAD_SIZE = 11;
var NONCE_SIZE = 12;
var SALT_SIZE = 4;
var MAX_COUNTER = (1n << 64n) - 1n;
var WINDOW_MASK = (1n << 64n) - 1n;
var Direction = {
  ClientToServer: 0,
  ServerToClient: 1
};
function encodeHandshakeFrame(type, body) {
  var frame = new Uint8Array(FRAME_HEADER_SIZE + body.length);
  frame[0] = VERSION;
  frame[1] = type;
  frame[2] = body.length >>> 8 & 0xff;
  frame[3] = body.length & 0xff;
  frame.set(body, FRAME_HEADER_SIZE);
  return frame;
}
function decodeHandshakeFrame(frame) {
  if (frame.length < FRAME_HEADER_SIZE) {
    throw new Error('security: invalid handshake frame');
  }
  if (frame[0] !== VERSION) {
    throw new Error('security: unsupported handshake version');
  }
  var length = frame[2] << 8 | frame[3];
  if (length !== frame.length - FRAME_HEADER_SIZE) {
    throw new Error('security: invalid handshake frame');
  }
  return {
    type: frame[1],
    body: frame.subarray(FRAME_HEADER_SIZE)
  };
}
function transcriptHash() {
  return sha256(concatBytes.apply(void 0, arguments));
}
function finishMac(key, transcript) {
  return hmacSha256(key, transcript);
}
function deriveKeyMaterial(shared, salt, transcript) {
  var info = concatBytes(utf8Bytes(TRANSCRIPT_LABEL), transcript);
  var output = hkdfSha256(shared, salt, info, KEY_MATERIAL_SIZE);
  return {
    c2sKey: output.subarray(0, 32),
    s2cKey: output.subarray(32, 64),
    c2sFinish: output.subarray(64, 96),
    s2cFinish: output.subarray(96, 128),
    salt: output.subarray(128, KEY_MATERIAL_SIZE)
  };
}
function makeAAD(direction, epoch, route, seq) {
  var aad = new Uint8Array(AAD_SIZE);
  aad[0] = VERSION;
  aad[1] = direction;
  aad[2] = epoch;
  var view = new DataView(aad.buffer);
  view.setUint32(3, route >>> 0);
  view.setUint32(7, seq >>> 0);
  return aad;
}
var SecureSession = /*#__PURE__*/function () {
  function SecureSession(suiteID, material) {
    var role = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'client';
    _classCallCheck(this, SecureSession);
    _defineProperty(this, "epoch", 1);
    _defineProperty(this, "salt", void 0);
    _defineProperty(this, "send", void 0);
    _defineProperty(this, "recv", void 0);
    _defineProperty(this, "sendCounter", 0n);
    _defineProperty(this, "replayHighest", 0n);
    _defineProperty(this, "replayBits", 0n);
    _defineProperty(this, "replayInited", false);
    this.send = createAeadCipher(suiteID, role === 'client' ? material.c2sKey : material.s2cKey);
    this.recv = createAeadCipher(suiteID, role === 'client' ? material.s2cKey : material.c2sKey);
    this.salt = material.salt.slice();
  }
  _createClass(SecureSession, [{
    key: "overhead",
    get: function get() {
      return ENVELOPE_HEADER_SIZE + this.send.tagSize;
    }
  }, {
    key: "seal",
    value: function seal(plaintext, direction, route, seq) {
      var counter = this.sendCounter;
      if (counter >= MAX_COUNTER) {
        throw new Error('security: session key exhausted');
      }
      this.sendCounter += 1n;
      var nonce = new Uint8Array(NONCE_SIZE);
      nonce.set(this.salt, 0);
      writeUint64BE(nonce, SALT_SIZE, counter);
      var sealed = this.send.seal(nonce, makeAAD(direction, this.epoch, route, seq), plaintext);
      var output = new Uint8Array(ENVELOPE_HEADER_SIZE + sealed.length);
      output[0] = this.epoch;
      writeUint64BE(output, 1, counter);
      output.set(sealed, ENVELOPE_HEADER_SIZE);
      return output;
    }
  }, {
    key: "open",
    value: function open(sealed, direction, route, seq) {
      if (sealed.length < ENVELOPE_HEADER_SIZE + this.recv.tagSize) {
        throw new Error('security: invalid secure message');
      }
      if (sealed[0] !== this.epoch) {
        throw new Error('security: invalid secure message');
      }
      var counter = readUint64BE$1(sealed, 1);
      var nonce = new Uint8Array(NONCE_SIZE);
      nonce.set(this.salt, 0);
      writeUint64BE(nonce, SALT_SIZE, counter);
      var plaintext = this.recv.open(nonce, makeAAD(direction, this.epoch, route, seq), sealed.subarray(ENVELOPE_HEADER_SIZE));
      if (plaintext === null) {
        throw new Error('security: message authentication failed');
      }
      if (!this.advanceReplayWindow(counter)) {
        throw new Error('security: replayed message');
      }
      return plaintext;
    }
  }, {
    key: "advanceReplayWindow",
    value: function advanceReplayWindow(counter) {
      if (!this.replayInited) {
        this.replayInited = true;
        this.replayHighest = counter;
        this.replayBits = 1n;
        return true;
      }
      if (counter > this.replayHighest) {
        var shift = counter - this.replayHighest;
        this.replayBits = shift >= 64n ? 0n : this.replayBits << shift & WINDOW_MASK;
        this.replayBits |= 1n;
        this.replayHighest = counter;
        return true;
      }
      var diff = this.replayHighest - counter;
      if (diff >= 64n || (this.replayBits >> diff & 1n) === 1n) {
        return false;
      }
      this.replayBits |= 1n << diff;
      return true;
    }
  }]);
  return SecureSession;
}();
var HandshakeClient = /*#__PURE__*/function () {
  function HandshakeClient(verifier, suites, random) {
    _classCallCheck(this, HandshakeClient);
    _defineProperty(this, "verifier", void 0);
    _defineProperty(this, "suites", void 0);
    _defineProperty(this, "randomSource", void 0);
    _defineProperty(this, "state", 0);
    _defineProperty(this, "privateKey", void 0);
    _defineProperty(this, "random", void 0);
    _defineProperty(this, "helloBody", void 0);
    if (!verifier || typeof verifier !== 'function') {
      throw new Error('security: a server verifier is required');
    }
    this.verifier = verifier;
    this.randomSource = random;
    this.suites = suites && suites.length ? suites.slice() : DEFAULT_SUITES.slice();
    if (this.suites.length > 255) {
      throw new Error('security: too many aead suites');
    }
    var _iterator = _createForOfIteratorHelper(this.suites),
      _step;
    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var suite = _step.value;
        if (!isSuiteSupported(suite)) {
          throw new Error("security: unsupported aead suite ".concat(suite));
        }
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }
  }
  _createClass(HandshakeClient, [{
    key: "hello",
    value: function hello() {
      if (this.state !== 0) {
        throw new Error('security: unexpected handshake state');
      }
      var _generateX25519KeyPai = generateX25519KeyPair(this.randomSource),
        privateKey = _generateX25519KeyPai.privateKey,
        publicKey = _generateX25519KeyPai.publicKey;
      var random = randomBytes(RANDOM_SIZE, this.randomSource);
      var body = concatBytes(random, publicKey, new Uint8Array([this.suites.length]), new Uint8Array(this.suites));
      this.privateKey = privateKey;
      this.random = random;
      this.helloBody = body;
      this.state = 1;
      return encodeHandshakeFrame(FRAME_CLIENT_HELLO, body);
    }
  }, {
    key: "handle",
    value: function handle(frame) {
      if (this.state !== 1 || !this.privateKey || !this.random || !this.helloBody) {
        throw new Error('security: unexpected handshake state');
      }
      var _decodeHandshakeFrame = decodeHandshakeFrame(frame),
        type = _decodeHandshakeFrame.type,
        body = _decodeHandshakeFrame.body;
      if (type !== FRAME_SERVER_HELLO) {
        throw new Error('security: invalid handshake frame');
      }
      if (body.length < SERVER_HELLO_PREFIX_SIZE + 2 + MAC_SIZE) {
        throw new Error('security: invalid server hello');
      }
      var suiteID = body[0];
      var random = body.subarray(1, 1 + RANDOM_SIZE);
      var publicKey = body.subarray(1 + RANDOM_SIZE, SERVER_HELLO_PREFIX_SIZE);
      var signatureLength = body[SERVER_HELLO_PREFIX_SIZE] << 8 | body[SERVER_HELLO_PREFIX_SIZE + 1];
      var signatureStart = SERVER_HELLO_PREFIX_SIZE + 2;
      if (body.length !== signatureStart + signatureLength + MAC_SIZE) {
        throw new Error('security: invalid server hello');
      }
      if (this.suites.indexOf(suiteID) === -1) {
        throw new Error('security: unsupported aead suite');
      }
      var signature = body.subarray(signatureStart, signatureStart + signatureLength);
      var mac = body.subarray(signatureStart + signatureLength);
      var prefix = body.subarray(0, SERVER_HELLO_PREFIX_SIZE);
      var signed = transcriptHash(utf8Bytes(TRANSCRIPT_LABEL), this.helloBody, prefix);
      if (!this.verifier(signed, signature)) {
        throw new Error('security: invalid server signature');
      }
      var transcript = transcriptHash(this.helloBody, prefix, signature);
      var shared = x25519(this.privateKey, publicKey);
      var salt = concatBytes(this.random, random);
      var material = deriveKeyMaterial(shared, salt, transcript);
      if (!equalBytes(finishMac(material.s2cFinish, transcript), mac)) {
        throw new Error('security: invalid server mac');
      }
      this.state = 2;
      return {
        session: new SecureSession(suiteID, material, 'client'),
        finished: encodeHandshakeFrame(FRAME_FINISHED, finishMac(material.c2sFinish, transcript))
      };
    }
  }]);
  return HandshakeClient;
}();

var HASH_SIZES = {
  sha1: 20,
  sha224: 28,
  sha256: 32,
  sha384: 48,
  sha512: 64
};
function hashSize(hash) {
  return HASH_SIZES[hash];
}
function digest(hash, data) {
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
function rotl(value, bits) {
  return (value << bits | value >>> 32 - bits) >>> 0;
}
function sha1(data) {
  var length = data.length;
  var paddedLength = length + 9 + 63 >> 6 << 6;
  var padded = new Uint8Array(paddedLength);
  padded.set(data);
  padded[length] = 0x80;
  var view = new DataView(padded.buffer);
  var bitLength = length * 8;
  view.setUint32(paddedLength - 8, Math.floor(bitLength / 0x100000000));
  view.setUint32(paddedLength - 4, bitLength >>> 0);
  var h0 = 0x67452301;
  var h1 = 0xefcdab89;
  var h2 = 0x98badcfe;
  var h3 = 0x10325476;
  var h4 = 0xc3d2e1f0;
  var w = new Uint32Array(80);
  for (var offset = 0; offset < paddedLength; offset += 64) {
    for (var i = 0; i < 16; i++) {
      w[i] = view.getUint32(offset + i * 4);
    }
    for (var _i = 16; _i < 80; _i++) {
      w[_i] = rotl(w[_i - 3] ^ w[_i - 8] ^ w[_i - 14] ^ w[_i - 16], 1);
    }
    var a = h0;
    var b = h1;
    var c = h2;
    var d = h3;
    var e = h4;
    for (var _i2 = 0; _i2 < 80; _i2++) {
      var f = void 0;
      var k = void 0;
      if (_i2 < 20) {
        f = b & c | ~b & d;
        k = 0x5a827999;
      } else if (_i2 < 40) {
        f = b ^ c ^ d;
        k = 0x6ed9eba1;
      } else if (_i2 < 60) {
        f = b & c | b & d | c & d;
        k = 0x8f1bbcdc;
      } else {
        f = b ^ c ^ d;
        k = 0xca62c1d6;
      }
      var temp = rotl(a, 5) + f + e + k + w[_i2] >>> 0;
      e = d;
      d = c;
      c = rotl(b, 30);
      b = a;
      a = temp;
    }
    h0 = h0 + a >>> 0;
    h1 = h1 + b >>> 0;
    h2 = h2 + c >>> 0;
    h3 = h3 + d >>> 0;
    h4 = h4 + e >>> 0;
  }
  var out = new Uint8Array(20);
  var outView = new DataView(out.buffer);
  outView.setUint32(0, h0);
  outView.setUint32(4, h1);
  outView.setUint32(8, h2);
  outView.setUint32(12, h3);
  outView.setUint32(16, h4);
  return out;
}
var MASK64 = 0xffffffffffffffffn;
var K512 = [0x428a2f98d728ae22n, 0x7137449123ef65cdn, 0xb5c0fbcfec4d3b2fn, 0xe9b5dba58189dbbcn, 0x3956c25bf348b538n, 0x59f111f1b605d019n, 0x923f82a4af194f9bn, 0xab1c5ed5da6d8118n, 0xd807aa98a3030242n, 0x12835b0145706fben, 0x243185be4ee4b28cn, 0x550c7dc3d5ffb4e2n, 0x72be5d74f27b896fn, 0x80deb1fe3b1696b1n, 0x9bdc06a725c71235n, 0xc19bf174cf692694n, 0xe49b69c19ef14ad2n, 0xefbe4786384f25e3n, 0x0fc19dc68b8cd5b5n, 0x240ca1cc77ac9c65n, 0x2de92c6f592b0275n, 0x4a7484aa6ea6e483n, 0x5cb0a9dcbd41fbd4n, 0x76f988da831153b5n, 0x983e5152ee66dfabn, 0xa831c66d2db43210n, 0xb00327c898fb213fn, 0xbf597fc7beef0ee4n, 0xc6e00bf33da88fc2n, 0xd5a79147930aa725n, 0x06ca6351e003826fn, 0x142929670a0e6e70n, 0x27b70a8546d22ffcn, 0x2e1b21385c26c926n, 0x4d2c6dfc5ac42aedn, 0x53380d139d95b3dfn, 0x650a73548baf63den, 0x766a0abb3c77b2a8n, 0x81c2c92e47edaee6n, 0x92722c851482353bn, 0xa2bfe8a14cf10364n, 0xa81a664bbc423001n, 0xc24b8b70d0f89791n, 0xc76c51a30654be30n, 0xd192e819d6ef5218n, 0xd69906245565a910n, 0xf40e35855771202an, 0x106aa07032bbd1b8n, 0x19a4c116b8d2d0c8n, 0x1e376c085141ab53n, 0x2748774cdf8eeb99n, 0x34b0bcb5e19b48a8n, 0x391c0cb3c5c95a63n, 0x4ed8aa4ae3418acbn, 0x5b9cca4f7763e373n, 0x682e6ff3d6b2b8a3n, 0x748f82ee5defb2fcn, 0x78a5636f43172f60n, 0x84c87814a1f0ab72n, 0x8cc702081a6439ecn, 0x90befffa23631e28n, 0xa4506cebde82bde9n, 0xbef9a3f7b2c67915n, 0xc67178f2e372532bn, 0xca273eceea26619cn, 0xd186b8c721c0c207n, 0xeada7dd6cde0eb1en, 0xf57d4f7fee6ed178n, 0x06f067aa72176fban, 0x0a637dc5a2c898a6n, 0x113f9804bef90daen, 0x1b710b35131c471bn, 0x28db77f523047d84n, 0x32caab7b40c72493n, 0x3c9ebe0a15c9bebcn, 0x431d67c49c100d4cn, 0x4cc5d4becb3e42b6n, 0x597f299cfc657e2an, 0x5fcb6fab3ad6faecn, 0x6c44198c4a475817n];
var H512 = [0x6a09e667f3bcc908n, 0xbb67ae8584caa73bn, 0x3c6ef372fe94f82bn, 0xa54ff53a5f1d36f1n, 0x510e527fade682d1n, 0x9b05688c2b3e6c1fn, 0x1f83d9abfb41bd6bn, 0x5be0cd19137e2179n];
var H384 = [0xcbbb9d5dc1059ed8n, 0x629a292a367cd507n, 0x9159015a3070dd17n, 0x152fecd8f70e5939n, 0x67332667ffc00b31n, 0x8eb44a8768581511n, 0xdb0c2e0d64f98fa7n, 0x47b5481dbefa4fa4n];
function rotr64(value, bits) {
  return (value >> bits | value << 64n - bits) & MASK64;
}
function readUint64BE(data, offset) {
  var value = 0n;
  for (var i = 0; i < 8; i++) {
    value = value << 8n | BigInt(data[offset + i]);
  }
  return value;
}
function sha512Core(initial, outLength, data) {
  var blockSize = 128;
  var paddedLength = Math.ceil((data.length + 17) / blockSize) * blockSize;
  var padded = new Uint8Array(paddedLength);
  padded.set(data);
  padded[data.length] = 0x80;
  var bitLength = BigInt(data.length) * 8n;
  for (var i = 0; i < 16; i++) {
    padded[paddedLength - 1 - i] = Number(bitLength & 0xffn);
    bitLength >>= 8n;
  }
  var state = initial.slice();
  var w = new Array(80);
  for (var offset = 0; offset < paddedLength; offset += blockSize) {
    for (var _i3 = 0; _i3 < 16; _i3++) {
      w[_i3] = readUint64BE(padded, offset + _i3 * 8);
    }
    for (var _i4 = 16; _i4 < 80; _i4++) {
      var s0 = rotr64(w[_i4 - 15], 1n) ^ rotr64(w[_i4 - 15], 8n) ^ w[_i4 - 15] >> 7n;
      var s1 = rotr64(w[_i4 - 2], 19n) ^ rotr64(w[_i4 - 2], 61n) ^ w[_i4 - 2] >> 6n;
      w[_i4] = w[_i4 - 16] + s0 + w[_i4 - 7] + s1 & MASK64;
    }
    var _state = _slicedToArray(state, 8),
      a = _state[0],
      b = _state[1],
      c = _state[2],
      d = _state[3],
      e = _state[4],
      f = _state[5],
      g = _state[6],
      h = _state[7];
    for (var _i5 = 0; _i5 < 80; _i5++) {
      var sigma1 = rotr64(e, 14n) ^ rotr64(e, 18n) ^ rotr64(e, 41n);
      var ch = e & f ^ (e ^ MASK64) & g;
      var t1 = h + sigma1 + ch + K512[_i5] + w[_i5] & MASK64;
      var sigma0 = rotr64(a, 28n) ^ rotr64(a, 34n) ^ rotr64(a, 39n);
      var maj = a & b ^ a & c ^ b & c;
      var t2 = sigma0 + maj & MASK64;
      h = g;
      g = f;
      f = e;
      e = d + t1 & MASK64;
      d = c;
      c = b;
      b = a;
      a = t1 + t2 & MASK64;
    }
    state[0] = state[0] + a & MASK64;
    state[1] = state[1] + b & MASK64;
    state[2] = state[2] + c & MASK64;
    state[3] = state[3] + d & MASK64;
    state[4] = state[4] + e & MASK64;
    state[5] = state[5] + f & MASK64;
    state[6] = state[6] + g & MASK64;
    state[7] = state[7] + h & MASK64;
  }
  var out = new Uint8Array(outLength);
  for (var _i6 = 0; _i6 < outLength / 8; _i6++) {
    var value = state[_i6];
    for (var j = 7; j >= 0; j--) {
      out[_i6 * 8 + j] = Number(value & 0xffn);
      value >>= 8n;
    }
  }
  return out;
}

var P256 = {
  name: 'P-256',
  p: 0xffffffff00000001000000000000000000000000ffffffffffffffffffffffffn,
  a: 0xffffffff00000001000000000000000000000000fffffffffffffffffffffffcn,
  b: 0x5ac635d8aa3a93e7b3ebbd55769886bc651d06b0cc53b0f63bce3c3e27d2604bn,
  gx: 0x6b17d1f2e12c4247f8bce6e563a440f277037d812deb33a0f4a13945d898c296n,
  gy: 0x4fe342e2fe1a7f9b8ee7eb4a7c0f9e162bce33576b315ececbb6406837bf51f5n,
  n: 0xffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551n,
  size: 32
};
var P384 = {
  name: 'P-384',
  p: 0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffeffffffff0000000000000000ffffffffn,
  a: 0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffeffffffff0000000000000000fffffffcn,
  b: 0xb3312fa7e23ee7e4988e056be3f82d19181d9c6efe8141120314088f5013875ac656398d8a2ed19d2a85c8edd3ec2aefn,
  gx: 0xaa87ca22be8b05378eb1c71ef320ad746e1d3b628ba79b9859f741e082542a385502f25dbf55296c3a545e3872760ab7n,
  gy: 0x3617de4a96262c6f5d9e98bf9292dc29f8f41dbd289a147ce9da3113b5f0b8c00a60b1ce1d7e819d7a431d7c90ea0e5fn,
  n: 0xffffffffffffffffffffffffffffffffffffffffffffffffc7634d81f4372ddf581a0db248b0a77aecec196accc52973n,
  size: 48
};
var P521 = {
  name: 'P-521',
  p: (1n << 521n) - 1n,
  a: (1n << 521n) - 4n,
  b: 0x0051953eb9618e1c9a1f929a21a0b68540eea2da725b99b315f3b8b489918ef109e156193951ec7e937b1652c0bd3bb1bf073573df883d2c34f1ef451fd46b503f00n,
  gx: 0x00c6858e06b70404e9cd9e3ecb662395b4429c648139053fb521f828af606b4d3dbaa14b5e77efe75928fe1dc127a2ffa8de3348b3c1856a429bf97e7e31c2e5bd66n,
  gy: 0x011839296a789a3bc0045c8a5fb42c7d1bd998f54449579b446817afbd17273e662c97ee72995ef42640c550b9013fad0761353c7086a272c24088be94769fd16650n,
  n: 0x01fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffa51868783bf2f966b7fcc0148f709a5d03bb5c9b8899c47aebb6fb71e91386409n,
  size: 66
};
var OID_RSA_ENCRYPTION = [0x2a, 0x86, 0x48, 0x86, 0xf7, 0x0d, 0x01, 0x01, 0x01];
var OID_EC_PUBLIC_KEY = [0x2a, 0x86, 0x48, 0xce, 0x3d, 0x02, 0x01];
var OID_P256 = [0x2a, 0x86, 0x48, 0xce, 0x3d, 0x03, 0x01, 0x07];
var OID_P384 = [0x2b, 0x81, 0x04, 0x00, 0x22];
var OID_P521 = [0x2b, 0x81, 0x04, 0x00, 0x23];
function equalOid(a, b) {
  if (a.length !== b.length) {
    return false;
  }
  for (var i = 0; i < b.length; i++) {
    if (a[i] !== b[i]) {
      return false;
    }
  }
  return true;
}
var DerReader = /*#__PURE__*/function () {
  function DerReader(data) {
    _classCallCheck(this, DerReader);
    _defineProperty(this, "data", void 0);
    _defineProperty(this, "offset", 0);
    this.data = data;
  }
  _createClass(DerReader, [{
    key: "read",
    value: function read() {
      if (this.offset + 2 > this.data.length) {
        throw new Error('security: truncated der');
      }
      var tag = this.data[this.offset++];
      var length = this.data[this.offset++];
      if (length & 0x80) {
        var bytes = length & 0x7f;
        if (bytes === 0 || bytes > 4) {
          throw new Error('security: invalid der length');
        }
        length = 0;
        for (var i = 0; i < bytes; i++) {
          length = length << 8 | this.data[this.offset++];
        }
      }
      if (this.offset + length > this.data.length) {
        throw new Error('security: truncated der');
      }
      var content = this.data.subarray(this.offset, this.offset + length);
      this.offset += length;
      return {
        tag: tag,
        content: content
      };
    }
  }, {
    key: "readTag",
    value: function readTag(tag) {
      var value = this.read();
      if (value.tag !== tag) {
        throw new Error('security: unexpected der tag');
      }
      return value.content;
    }
  }]);
  return DerReader;
}();
function rsaPublicKey(modulus, exponent) {
  var normalized = trimInteger(modulus);
  return {
    kind: 'rsa',
    modulus: bytesToBigInt(normalized),
    exponent: bytesToBigInt(trimInteger(exponent)),
    size: normalized.length
  };
}
function trimInteger(value) {
  var offset = 0;
  while (offset < value.length - 1 && value[offset] === 0) {
    offset++;
  }
  return value.subarray(offset);
}
function derToPublicKey(der) {
  var root = new DerReader(der).readTag(0x30);
  var reader = new DerReader(root);
  var first = reader.read();
  if (first.tag === 0x02) {
    var sequence = new DerReader(root);
    return rsaPublicKey(sequence.readTag(0x02), sequence.readTag(0x02));
  }
  if (first.tag !== 0x30) {
    throw new Error('security: unsupported public key format');
  }
  var algorithm = new DerReader(first.content);
  var oid = algorithm.readTag(0x06);
  var bitString = reader.read();
  if (bitString.tag !== 0x03 || bitString.content[0] !== 0) {
    throw new Error('security: invalid public key bit string');
  }
  var key = bitString.content.subarray(1);
  if (equalOid(oid, OID_RSA_ENCRYPTION)) {
    var _sequence = new DerReader(new DerReader(key).readTag(0x30));
    return rsaPublicKey(_sequence.readTag(0x02), _sequence.readTag(0x02));
  }
  if (equalOid(oid, OID_EC_PUBLIC_KEY)) {
    var parameters = algorithm.readTag(0x06);
    var curve;
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
      curve: curve,
      x: bytesToBigInt(key.subarray(1, 1 + curve.size)),
      y: bytesToBigInt(key.subarray(1 + curve.size))
    };
  }
  throw new Error('security: unsupported public key algorithm');
}
function parsePublicKey(input) {
  var der;
  if (typeof input === 'string') {
    var match = /-----BEGIN [^-]+-----([\s\S]+?)-----END [^-]+-----/.exec(input);
    der = base64Decode(match ? match[1] : input);
  } else if (input.length > 0 && input[0] === 0x30) {
    der = input;
  } else {
    var text = '';
    for (var i = 0; i < input.length; i++) {
      text += String.fromCharCode(input[i]);
    }
    return parsePublicKey(text);
  }
  return derToPublicKey(der);
}

var DIGEST_INFO = {
  sha1: new Uint8Array([0x30, 0x21, 0x30, 0x09, 0x06, 0x05, 0x2b, 0x0e, 0x03, 0x02, 0x1a, 0x05, 0x00, 0x04, 0x14]),
  sha224: new Uint8Array([0x30, 0x2d, 0x30, 0x0d, 0x06, 0x09, 0x60, 0x86, 0x48, 0x01, 0x65, 0x03, 0x04, 0x02, 0x04, 0x05, 0x00, 0x04, 0x1c]),
  sha256: new Uint8Array([0x30, 0x31, 0x30, 0x0d, 0x06, 0x09, 0x60, 0x86, 0x48, 0x01, 0x65, 0x03, 0x04, 0x02, 0x01, 0x05, 0x00, 0x04, 0x20]),
  sha384: new Uint8Array([0x30, 0x41, 0x30, 0x0d, 0x06, 0x09, 0x60, 0x86, 0x48, 0x01, 0x65, 0x03, 0x04, 0x02, 0x02, 0x05, 0x00, 0x04, 0x30]),
  sha512: new Uint8Array([0x30, 0x51, 0x30, 0x0d, 0x06, 0x09, 0x60, 0x86, 0x48, 0x01, 0x65, 0x03, 0x04, 0x02, 0x03, 0x05, 0x00, 0x04, 0x40])
};
function mod(value, modulus) {
  var result = value % modulus;
  return result >= 0n ? result : result + modulus;
}
function modPow(base, exponent, modulus) {
  var result = 1n;
  var value = base % modulus;
  while (exponent > 0n) {
    if (exponent & 1n) {
      result = result * value % modulus;
    }
    exponent >>= 1n;
    value = value * value % modulus;
  }
  return result;
}
function modInverse(value, modulus) {
  var _ref = [mod(value, modulus), modulus],
    oldR = _ref[0],
    r = _ref[1];
  var oldS = 1n,
    s = 0n;
  while (r !== 0n) {
    var quotient = oldR / r;
    var _ref2 = [r, oldR - quotient * r];
    oldR = _ref2[0];
    r = _ref2[1];
    var _ref3 = [s, oldS - quotient * s];
    oldS = _ref3[0];
    s = _ref3[1];
  }
  if (oldR !== 1n) {
    throw new Error('security: value is not invertible');
  }
  return mod(oldS, modulus);
}
function mgf1(seed, length, hash) {
  var hLen = hashSize(hash);
  var output = new Uint8Array(length);
  var counter = new Uint8Array(4);
  var offset = 0;
  for (var index = 0; offset < length; index++) {
    new DataView(counter.buffer).setUint32(0, index);
    var block = digest(hash, concatBytes(seed, counter));
    output.set(block.subarray(0, Math.min(block.length, length - offset)), offset);
    offset += hLen;
  }
  return output;
}
function verifyPkcs1(em, digestBytes, hash) {
  var info = DIGEST_INFO[hash];
  if (em.length < info.length + digestBytes.length + 11) {
    return false;
  }
  if (em[0] !== 0x00 || em[1] !== 0x01) {
    return false;
  }
  var offset = 2;
  while (offset < em.length && em[offset] === 0xff) {
    offset++;
  }
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
function verifyPss(em, digestBytes, emBits, hash) {
  var emLength = em.length;
  var hLen = hashSize(hash);
  var saltLength = hLen;
  if (emLength < hLen + saltLength + 2) {
    return false;
  }
  if (em[emLength - 1] !== 0xbc) {
    return false;
  }
  var dbLength = emLength - hLen - 1;
  var maskedDb = em.subarray(0, dbLength);
  var h = em.subarray(dbLength, dbLength + hLen);
  var unusedBits = 8 * emLength - emBits;
  if (unusedBits < 0 || unusedBits > 8) {
    return false;
  }
  if (unusedBits > 0 && (maskedDb[0] & 0xff << 8 - unusedBits) !== 0) {
    return false;
  }
  var db = new Uint8Array(dbLength);
  var mask = mgf1(h, dbLength, hash);
  for (var i = 0; i < dbLength; i++) {
    db[i] = maskedDb[i] ^ mask[i];
  }
  if (unusedBits > 0) {
    db[0] &= 0xff >>> unusedBits;
  }
  var paddingLength = dbLength - saltLength - 1;
  for (var _i = 0; _i < paddingLength; _i++) {
    if (db[_i] !== 0) {
      return false;
    }
  }
  if (db[paddingLength] !== 0x01) {
    return false;
  }
  var salt = db.subarray(paddingLength + 1);
  var expected = digest(hash, concatBytes(new Uint8Array(8), digestBytes, salt));
  return equalBytes(expected, h);
}
function createRsaVerifierFromKey(key, hash, pss) {
  var emBits = key.modulus.toString(2).length - 1;
  var emLength = Math.ceil(emBits / 8);
  var verifyPssWith = function verifyPssWith(value, em, digestBytes) {
    if (value >> BigInt(emLength * 8) !== 0n) {
      return false;
    }
    return verifyPss(em.subarray(em.length - emLength), digestBytes, emBits, hash);
  };
  return function (data, signature) {
    if (signature.length !== key.size) {
      return false;
    }
    var value = bytesToBigInt(signature);
    if (value <= 0n || value >= key.modulus) {
      return false;
    }
    var message = modPow(value, key.exponent, key.modulus);
    var em = bigIntToBytes(message, key.size);
    var digestBytes = digest(hash, data);
    if (!pss) {
      return verifyPkcs1(em, digestBytes, hash);
    }
    return verifyPssWith(message, em, digestBytes);
  };
}
function pointDouble(point, curve) {
  if (point.y === 0n) {
    return null;
  }
  var lambda = mod((3n * point.x * point.x + curve.a) * modInverse(2n * point.y, curve.p), curve.p);
  var x = mod(lambda * lambda - 2n * point.x, curve.p);
  return {
    x: x,
    y: mod(lambda * (point.x - x) - point.y, curve.p)
  };
}
function pointAdd(a, b, curve) {
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
  var lambda = mod((b.y - a.y) * modInverse(b.x - a.x, curve.p), curve.p);
  var x = mod(lambda * lambda - a.x - b.x, curve.p);
  return {
    x: x,
    y: mod(lambda * (a.x - x) - a.y, curve.p)
  };
}
function pointMultiply(scalar, point, curve) {
  var result = null;
  var addend = point;
  var value = scalar;
  while (value > 0n) {
    if (value & 1n) {
      result = pointAdd(result, addend, curve);
    }
    addend = addend && pointDouble(addend, curve);
    value >>= 1n;
  }
  return result;
}
function parseSignatureParts(signature, delimiter) {
  var text = '';
  for (var i = 0; i < signature.length; i++) {
    text += String.fromCharCode(signature[i]);
  }
  var parts = text.split(delimiter);
  if (parts.length !== 2) {
    return null;
  }
  if (!/^\d+$/.test(parts[0]) || !/^\d+$/.test(parts[1])) {
    return null;
  }
  return [BigInt(parts[0]), BigInt(parts[1])];
}
function hashToInt(bytes, curve) {
  var orderBits = curve.n.toString(2).length;
  var orderBytes = orderBits + 7 >> 3;
  var sliced = bytes.length > orderBytes ? bytes.subarray(0, orderBytes) : bytes;
  var value = bytesToBigInt(sliced);
  var excess = sliced.length * 8 - orderBits;
  if (excess > 0) {
    value >>= BigInt(excess);
  }
  return value;
}
function createEcdsaVerifierFromKey(key, hash, delimiter) {
  return function (data, signature) {
    var parts = parseSignatureParts(signature, delimiter);
    if (parts === null) {
      return false;
    }
    var _parts = _slicedToArray(parts, 2),
      r = _parts[0],
      s = _parts[1];
    var curve = key.curve;
    if (r <= 0n || r >= curve.n || s <= 0n || s >= curve.n) {
      return false;
    }
    var z = hashToInt(digest(hash, data), curve);
    var w = modInverse(s, curve.n);
    var u1 = z * w % curve.n;
    var u2 = r * w % curve.n;
    var point = pointAdd(pointMultiply(u1, {
      x: curve.gx,
      y: curve.gy
    }, curve), pointMultiply(u2, {
      x: key.x,
      y: key.y
    }, curve), curve);
    if (point === null) {
      return false;
    }
    return mod(point.x, curve.n) === r;
  };
}
var Verifier = {
  ecdsa: function ecdsa(publicKey) {
    var hash = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'sha256';
    var delimiter = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : ' ';
    var parsed = typeof publicKey === 'string' || publicKey instanceof Uint8Array ? parsePublicKey(publicKey) : publicKey;
    if (parsed.kind !== 'ec') {
      throw new Error('security: not an ecdsa public key');
    }
    return createEcdsaVerifierFromKey(parsed, hash, delimiter);
  },
  rsa: function rsa(publicKey) {
    var hash = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'sha256';
    var pss = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
    var parsed = typeof publicKey === 'string' || publicKey instanceof Uint8Array ? parsePublicKey(publicKey) : publicKey;
    if (parsed.kind !== 'rsa') {
      throw new Error('security: not an rsa public key');
    }
    return createRsaVerifierFromKey(parsed, hash, pss);
  }
};

var DEFAULT_HANDSHAKE_TIMEOUT = 5000;
var CLIENT_TO_SERVER = 0;
var SERVER_TO_CLIENT = 1;
var Client = /*#__PURE__*/function () {
  function Client(opts) {
    _classCallCheck(this, Client);
    _defineProperty(this, "connectHandler", void 0);
    _defineProperty(this, "disconnectHandler", void 0);
    _defineProperty(this, "receiveHandler", void 0);
    _defineProperty(this, "errorHandler", void 0);
    _defineProperty(this, "heartbeatHandler", void 0);
    _defineProperty(this, "opts", void 0);
    _defineProperty(this, "websocket", void 0);
    _defineProperty(this, "intervalId", void 0);
    _defineProperty(this, "handshakeTimer", void 0);
    _defineProperty(this, "packer", void 0);
    _defineProperty(this, "security", void 0);
    _defineProperty(this, "handshake", void 0);
    _defineProperty(this, "session", void 0);
    _defineProperty(this, "waitgroup", void 0);
    this.opts = opts;
    this.websocket = undefined;
    this.packer = opts.packer || new Packer(opts.packer);
    this.security = opts.security;
    this.waitgroup = new Map();
  }
  _createClass(Client, [{
    key: "connect",
    value: function connect() {
      var _this = this;
      try {
        this.disconnect();
        var websocket = new WebSocket(this.opts.url);
        websocket.binaryType = 'arraybuffer';
        this.websocket = websocket;
        websocket.onopen = function () {
          if (_this.websocket !== websocket) {
            return;
          }
          if (_this.security) {
            try {
              _this.startHandshake(websocket);
            } catch (error) {
              _this.failHandshake(error);
            }
          } else {
            _this.established();
          }
        };
        websocket.onclose = function () {
          if (_this.websocket !== websocket) {
            return;
          }
          _this.stopHeartbeat();
          _this.stopHandshakeTimer();
          _this.handshake = undefined;
          _this.session = undefined;
          _this.disconnectHandler && _this.disconnectHandler(_this);
        };
        websocket.onerror = function () {
          _this.errorHandler && _this.errorHandler(_this);
        };
        websocket.onmessage = function (e) {
          if (_this.websocket !== websocket) {
            return;
          }
          if (e.data.byteLength == 0) {
            return;
          }
          var packet;
          try {
            packet = _this.packer.unpack(e.data);
          } catch (error) {
            _this.errorHandler && _this.errorHandler(_this);
            return;
          }
          if (packet.isHandshake) {
            _this.receiveHandshake(packet.handshake || new Uint8Array(0));
            return;
          }
          if (packet.isHeartbeat) {
            _this.heartbeatHandler && _this.heartbeatHandler(_this, packet.millisecond);
            return;
          }
          if (!packet.message) {
            return;
          }
          if (_this.security) {
            if (!_this.session) {
              _this.failHandshake(new Error('security: session is not established'));
              return;
            }
            try {
              packet.message.buffer = _this.session.open(packet.message.buffer || new Uint8Array(0), SERVER_TO_CLIENT, packet.message.route, packet.message.seq || 0);
            } catch (error) {
              _this.failHandshake(error);
              return;
            }
          }
          _this.invoke(packet.message) || _this.receiveHandler && _this.receiveHandler(_this, packet.message);
        };
        return true;
      } catch (error) {
        console.log(error);
        return false;
      }
    }
  }, {
    key: "startHandshake",
    value: function startHandshake(websocket) {
      var _this2 = this;
      var options = this.security;
      if (this.websocket !== websocket || !this.isConnected()) {
        return;
      }
      var verifier = options.verifier;
      if (!verifier) {
        throw new Error('security: verifier is required');
      }
      var handshake = new HandshakeClient(verifier, options.suites, options.random);
      var hello = handshake.hello();
      var timeout = options.handshakeTimeout === undefined ? DEFAULT_HANDSHAKE_TIMEOUT : options.handshakeTimeout;
      this.handshake = handshake;
      if (timeout > 0) {
        this.handshakeTimer = setTimeout(function () {
          _this2.failHandshake(new Error('security: handshake timeout'));
        }, timeout);
      }
      this.sendRaw(this.packer.packHandshake(hello));
    }
  }, {
    key: "receiveHandshake",
    value: function receiveHandshake(frame) {
      if (!this.security || !this.handshake) {
        return;
      }
      try {
        var _this$handshake$handl = this.handshake.handle(frame),
          session = _this$handshake$handl.session,
          finished = _this$handshake$handl.finished;
        this.session = session;
        this.handshake = undefined;
        this.stopHandshakeTimer();
        this.sendRaw(this.packer.packHandshake(finished));
        this.established();
      } catch (error) {
        this.failHandshake(error);
      }
    }
  }, {
    key: "failHandshake",
    value: function failHandshake(error) {
      this.stopHandshakeTimer();
      this.handshake = undefined;
      this.session = undefined;
      console.warn('[due] security handshake failed:', error);
      this.websocket && this.websocket.close();
      this.errorHandler && this.errorHandler(this);
    }
  }, {
    key: "established",
    value: function established() {
      this.heartbeat();
      this.connectHandler && this.connectHandler(this);
    }
  }, {
    key: "stopHandshakeTimer",
    value: function stopHandshakeTimer() {
      this.handshakeTimer && clearTimeout(this.handshakeTimer);
      this.handshakeTimer = null;
    }
  }, {
    key: "sendRaw",
    value: function sendRaw(data) {
      this.isConnected() && this.websocket && this.websocket.send(data);
    }
  }, {
    key: "disconnect",
    value: function disconnect() {
      this.stopHandshakeTimer();
      this.handshake = undefined;
      this.session = undefined;
      if (!this.websocket) {
        return;
      }
      this.stopHeartbeat();
      this.websocket.close();
    }
  }, {
    key: "stopHeartbeat",
    value: function stopHeartbeat() {
      this.intervalId && clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }, {
    key: "heartbeat",
    value: function heartbeat() {
      var _this3 = this;
      if (!this.opts.heartbeat || this.opts.heartbeat <= 0) {
        return;
      }
      var data = this.packer.packHeartbeat();
      this.intervalId = setInterval(function () {
        _this3.isConnected() && _this3.websocket && _this3.websocket.send(data);
      }, this.opts.heartbeat);
    }
  }, {
    key: "onConnect",
    value: function onConnect(handler) {
      this.connectHandler = handler;
    }
  }, {
    key: "onDisconnect",
    value: function onDisconnect(handler) {
      this.disconnectHandler = handler;
    }
  }, {
    key: "onReceive",
    value: function onReceive(handler) {
      this.receiveHandler = handler;
    }
  }, {
    key: "onError",
    value: function onError(handler) {
      this.errorHandler = handler;
    }
  }, {
    key: "onHeartbeat",
    value: function onHeartbeat(handler) {
      this.heartbeatHandler = handler;
    }
  }, {
    key: "isConnected",
    value: function isConnected() {
      return this.websocket !== undefined && this.websocket.readyState == WebSocket.OPEN;
    }
  }, {
    key: "isConnecting",
    value: function isConnecting() {
      return this.websocket !== undefined && this.websocket.readyState === WebSocket.CONNECTING;
    }
  }, {
    key: "send",
    value: function send(message) {
      if (!this.isConnected()) {
        return false;
      }
      if (this.security && !this.session) {
        return false;
      }
      var data = this.packer.packMessage(this.protect(message));
      try {
        this.websocket && this.websocket.send(data);
        return true;
      } catch (error) {
        console.warn('[due] send message failed:', error);
        return false;
      }
    }
  }, {
    key: "protect",
    value: function protect(message) {
      if (!this.security) {
        return message;
      }
      if (!this.session) {
        throw new Error('security: session is not established');
      }
      var buffer = this.session.seal(message.buffer || new Uint8Array(0), CLIENT_TO_SERVER, message.route, message.seq || 0);
      return {
        seq: message.seq,
        route: message.route,
        buffer: buffer
      };
    }
  }, {
    key: "request",
    value: function request(route, buffer, timeout) {
      var _this4 = this;
      return new Promise(function (resolve, reject) {
        if (!_this4.isConnected()) {
          reject(new Error('client not connected'));
          return;
        }
        var group = _this4.waitgroup.get(route);
        if (group === undefined) {
          group = {
            seq: 0,
            callback: new Map()
          };
          _this4.waitgroup.set(route, group);
        }
        var seq = ++group.seq;
        var timeoutId;
        var cleanup = function cleanup() {
          group.callback["delete"](seq);
        };
        if (timeout && timeout > 0) {
          timeoutId = setTimeout(function () {
            cleanup();
            reject(new Error('request timeout'));
          }, timeout);
        }
        group.callback.set(seq, function (message) {
          timeoutId && clearTimeout(timeoutId);
          resolve(message);
        });
        try {
          if (!_this4.send({
            seq: seq,
            route: route,
            buffer: buffer
          })) {
            timeoutId && clearTimeout(timeoutId);
            cleanup();
            reject(new Error('send message failed'));
            return;
          }
        } catch (error) {
          timeoutId && clearTimeout(timeoutId);
          cleanup();
          reject(error);
        }
      });
    }
  }, {
    key: "invoke",
    value: function invoke(message) {
      if (message.seq === undefined || message.seq === 0) {
        return false;
      }
      var group = this.waitgroup.get(message.route);
      if (group === undefined) {
        return false;
      }
      var callback = group.callback.get(message.seq || 0);
      group.callback["delete"](message.seq || 0);
      callback && callback(message);
      return true;
    }
  }]);
  return Client;
}();

exports.Client = Client;
exports.DEFAULT_SUITES = DEFAULT_SUITES;
exports.Direction = Direction;
exports.HandshakeClient = HandshakeClient;
exports.Packer = Packer;
exports.SUITE_AES_GCM = SUITE_AES_GCM;
exports.SUITE_CHACHA20_POLY1305 = SUITE_CHACHA20_POLY1305;
exports.SecureSession = SecureSession;
exports.Verifier = Verifier;
exports.makeAAD = makeAAD;
exports.parsePublicKey = parsePublicKey;
