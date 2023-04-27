function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _typeof(obj) {
  "@babel/helpers - typeof";

  return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
  }, _typeof(obj);
}

function _toPrimitive(input, hint) {
  if (_typeof(input) !== "object" || input === null) return input;
  var prim = input[Symbol.toPrimitive];
  if (prim !== undefined) {
    var res = prim.call(input, hint || "default");
    if (_typeof(res) !== "object") return res;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (hint === "string" ? String : Number)(input);
}

function _toPropertyKey(arg) {
  var key = _toPrimitive(arg, "string");
  return _typeof(key) === "symbol" ? key : String(key);
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);
  }
}
function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  Object.defineProperty(Constructor, "prototype", {
    writable: false
  });
  return Constructor;
}

function _defineProperty(obj, key, value) {
  key = _toPropertyKey(key);
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }
  return obj;
}

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function getDefaultExportFromCjs (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

function getAugmentedNamespace(n) {
  if (n.__esModule) return n;
  var f = n.default;
	if (typeof f == "function") {
		var a = function a () {
			if (this instanceof a) {
				var args = [null];
				args.push.apply(args, arguments);
				var Ctor = Function.bind.apply(f, args);
				return new Ctor();
			}
			return f.apply(this, arguments);
		};
		a.prototype = f.prototype;
  } else a = {};
  Object.defineProperty(a, '__esModule', {value: true});
	Object.keys(n).forEach(function (k) {
		var d = Object.getOwnPropertyDescriptor(n, k);
		Object.defineProperty(a, k, d.get ? d : {
			enumerable: true,
			get: function () {
				return n[k];
			}
		});
	});
	return a;
}

var global$1 = (typeof global !== "undefined" ? global :
  typeof self !== "undefined" ? self :
  typeof window !== "undefined" ? window : {});

var lookup = [];
var revLookup = [];
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array;
var inited = false;
function init () {
  inited = true;
  var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  for (var i = 0, len = code.length; i < len; ++i) {
    lookup[i] = code[i];
    revLookup[code.charCodeAt(i)] = i;
  }

  revLookup['-'.charCodeAt(0)] = 62;
  revLookup['_'.charCodeAt(0)] = 63;
}

function toByteArray (b64) {
  if (!inited) {
    init();
  }
  var i, j, l, tmp, placeHolders, arr;
  var len = b64.length;

  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // the number of equal signs (place holders)
  // if there are two placeholders, than the two characters before it
  // represent one byte
  // if there is only one, then the three characters before it represent 2 bytes
  // this is just a cheap hack to not do indexOf twice
  placeHolders = b64[len - 2] === '=' ? 2 : b64[len - 1] === '=' ? 1 : 0;

  // base64 is 4/3 + up to two characters of the original data
  arr = new Arr(len * 3 / 4 - placeHolders);

  // if there are placeholders, only get up to the last complete 4 chars
  l = placeHolders > 0 ? len - 4 : len;

  var L = 0;

  for (i = 0, j = 0; i < l; i += 4, j += 3) {
    tmp = (revLookup[b64.charCodeAt(i)] << 18) | (revLookup[b64.charCodeAt(i + 1)] << 12) | (revLookup[b64.charCodeAt(i + 2)] << 6) | revLookup[b64.charCodeAt(i + 3)];
    arr[L++] = (tmp >> 16) & 0xFF;
    arr[L++] = (tmp >> 8) & 0xFF;
    arr[L++] = tmp & 0xFF;
  }

  if (placeHolders === 2) {
    tmp = (revLookup[b64.charCodeAt(i)] << 2) | (revLookup[b64.charCodeAt(i + 1)] >> 4);
    arr[L++] = tmp & 0xFF;
  } else if (placeHolders === 1) {
    tmp = (revLookup[b64.charCodeAt(i)] << 10) | (revLookup[b64.charCodeAt(i + 1)] << 4) | (revLookup[b64.charCodeAt(i + 2)] >> 2);
    arr[L++] = (tmp >> 8) & 0xFF;
    arr[L++] = tmp & 0xFF;
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp;
  var output = [];
  for (var i = start; i < end; i += 3) {
    tmp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2]);
    output.push(tripletToBase64(tmp));
  }
  return output.join('')
}

function fromByteArray (uint8) {
  if (!inited) {
    init();
  }
  var tmp;
  var len = uint8.length;
  var extraBytes = len % 3; // if we have 1 byte left, pad 2 bytes
  var output = '';
  var parts = [];
  var maxChunkLength = 16383; // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)));
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1];
    output += lookup[tmp >> 2];
    output += lookup[(tmp << 4) & 0x3F];
    output += '==';
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + (uint8[len - 1]);
    output += lookup[tmp >> 10];
    output += lookup[(tmp >> 4) & 0x3F];
    output += lookup[(tmp << 2) & 0x3F];
    output += '=';
  }

  parts.push(output);

  return parts.join('')
}

function read (buffer, offset, isLE, mLen, nBytes) {
  var e, m;
  var eLen = nBytes * 8 - mLen - 1;
  var eMax = (1 << eLen) - 1;
  var eBias = eMax >> 1;
  var nBits = -7;
  var i = isLE ? (nBytes - 1) : 0;
  var d = isLE ? -1 : 1;
  var s = buffer[offset + i];

  i += d;

  e = s & ((1 << (-nBits)) - 1);
  s >>= (-nBits);
  nBits += eLen;
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1);
  e >>= (-nBits);
  nBits += mLen;
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias;
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen);
    e = e - eBias;
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

function write (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c;
  var eLen = nBytes * 8 - mLen - 1;
  var eMax = (1 << eLen) - 1;
  var eBias = eMax >> 1;
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0);
  var i = isLE ? 0 : (nBytes - 1);
  var d = isLE ? 1 : -1;
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

  value = Math.abs(value);

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0;
    e = eMax;
  } else {
    e = Math.floor(Math.log(value) / Math.LN2);
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--;
      c *= 2;
    }
    if (e + eBias >= 1) {
      value += rt / c;
    } else {
      value += rt * Math.pow(2, 1 - eBias);
    }
    if (value * c >= 2) {
      e++;
      c /= 2;
    }

    if (e + eBias >= eMax) {
      m = 0;
      e = eMax;
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen);
      e = e + eBias;
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
      e = 0;
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m;
  eLen += mLen;
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128;
}

var toString = {}.toString;

var isArray = Array.isArray || function (arr) {
  return toString.call(arr) == '[object Array]';
};

/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */

var INSPECT_MAX_BYTES = 50;

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * Due to various browser bugs, sometimes the Object implementation will be used even
 * when the browser supports typed arrays.
 *
 * Note:
 *
 *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
 *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
 *
 *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
 *
 *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
 *     incorrect length in some situations.

 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
 * get the Object implementation, which is slower but behaves correctly.
 */
Buffer.TYPED_ARRAY_SUPPORT = global$1.TYPED_ARRAY_SUPPORT !== undefined
  ? global$1.TYPED_ARRAY_SUPPORT
  : true;

/*
 * Export kMaxLength after typed array support is determined.
 */
var _kMaxLength = kMaxLength();

function kMaxLength () {
  return Buffer.TYPED_ARRAY_SUPPORT
    ? 0x7fffffff
    : 0x3fffffff
}

function createBuffer (that, length) {
  if (kMaxLength() < length) {
    throw new RangeError('Invalid typed array length')
  }
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = new Uint8Array(length);
    that.__proto__ = Buffer.prototype;
  } else {
    // Fallback: Return an object instance of the Buffer class
    if (that === null) {
      that = new Buffer(length);
    }
    that.length = length;
  }

  return that
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  if (!Buffer.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer)) {
    return new Buffer(arg, encodingOrOffset, length)
  }

  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new Error(
        'If encoding is specified then the first argument must be a string'
      )
    }
    return allocUnsafe(this, arg)
  }
  return from(this, arg, encodingOrOffset, length)
}

Buffer.poolSize = 8192; // not used by this implementation

// TODO: Legacy, not needed anymore. Remove in next major version.
Buffer._augment = function (arr) {
  arr.__proto__ = Buffer.prototype;
  return arr
};

function from (that, value, encodingOrOffset, length) {
  if (typeof value === 'number') {
    throw new TypeError('"value" argument must not be a number')
  }

  if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {
    return fromArrayBuffer(that, value, encodingOrOffset, length)
  }

  if (typeof value === 'string') {
    return fromString(that, value, encodingOrOffset)
  }

  return fromObject(that, value)
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(null, value, encodingOrOffset, length)
};

if (Buffer.TYPED_ARRAY_SUPPORT) {
  Buffer.prototype.__proto__ = Uint8Array.prototype;
  Buffer.__proto__ = Uint8Array;
  if (typeof Symbol !== 'undefined' && Symbol.species &&
      Buffer[Symbol.species] === Buffer) ;
}

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be a number')
  } else if (size < 0) {
    throw new RangeError('"size" argument must not be negative')
  }
}

function alloc (that, size, fill, encoding) {
  assertSize(size);
  if (size <= 0) {
    return createBuffer(that, size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(that, size).fill(fill, encoding)
      : createBuffer(that, size).fill(fill)
  }
  return createBuffer(that, size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(null, size, fill, encoding)
};

function allocUnsafe (that, size) {
  assertSize(size);
  that = createBuffer(that, size < 0 ? 0 : checked(size) | 0);
  if (!Buffer.TYPED_ARRAY_SUPPORT) {
    for (var i = 0; i < size; ++i) {
      that[i] = 0;
    }
  }
  return that
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(null, size)
};
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(null, size)
};

function fromString (that, string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8';
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('"encoding" must be a valid string encoding')
  }

  var length = byteLength(string, encoding) | 0;
  that = createBuffer(that, length);

  var actual = that.write(string, encoding);

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    that = that.slice(0, actual);
  }

  return that
}

function fromArrayLike (that, array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0;
  that = createBuffer(that, length);
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255;
  }
  return that
}

function fromArrayBuffer (that, array, byteOffset, length) {
  array.byteLength; // this throws if `array` is not a valid ArrayBuffer

  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('\'offset\' is out of bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('\'length\' is out of bounds')
  }

  if (byteOffset === undefined && length === undefined) {
    array = new Uint8Array(array);
  } else if (length === undefined) {
    array = new Uint8Array(array, byteOffset);
  } else {
    array = new Uint8Array(array, byteOffset, length);
  }

  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = array;
    that.__proto__ = Buffer.prototype;
  } else {
    // Fallback: Return an object instance of the Buffer class
    that = fromArrayLike(that, array);
  }
  return that
}

function fromObject (that, obj) {
  if (internalIsBuffer(obj)) {
    var len = checked(obj.length) | 0;
    that = createBuffer(that, len);

    if (that.length === 0) {
      return that
    }

    obj.copy(that, 0, 0, len);
    return that
  }

  if (obj) {
    if ((typeof ArrayBuffer !== 'undefined' &&
        obj.buffer instanceof ArrayBuffer) || 'length' in obj) {
      if (typeof obj.length !== 'number' || isnan(obj.length)) {
        return createBuffer(that, 0)
      }
      return fromArrayLike(that, obj)
    }

    if (obj.type === 'Buffer' && isArray(obj.data)) {
      return fromArrayLike(that, obj.data)
    }
  }

  throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.')
}

function checked (length) {
  // Note: cannot use `length < kMaxLength()` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= kMaxLength()) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + kMaxLength().toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0;
  }
  return Buffer.alloc(+length)
}
Buffer.isBuffer = isBuffer;
function internalIsBuffer (b) {
  return !!(b != null && b._isBuffer)
}

Buffer.compare = function compare (a, b) {
  if (!internalIsBuffer(a) || !internalIsBuffer(b)) {
    throw new TypeError('Arguments must be Buffers')
  }

  if (a === b) return 0

  var x = a.length;
  var y = b.length;

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i];
      y = b[i];
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
};

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
};

Buffer.concat = function concat (list, length) {
  if (!isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i;
  if (length === undefined) {
    length = 0;
    for (i = 0; i < list.length; ++i) {
      length += list[i].length;
    }
  }

  var buffer = Buffer.allocUnsafe(length);
  var pos = 0;
  for (i = 0; i < list.length; ++i) {
    var buf = list[i];
    if (!internalIsBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos);
    pos += buf.length;
  }
  return buffer
};

function byteLength (string, encoding) {
  if (internalIsBuffer(string)) {
    return string.length
  }
  if (typeof ArrayBuffer !== 'undefined' && typeof ArrayBuffer.isView === 'function' &&
      (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    string = '' + string;
  }

  var len = string.length;
  if (len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false;
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
      case undefined:
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) return utf8ToBytes(string).length // assume utf8
        encoding = ('' + encoding).toLowerCase();
        loweredCase = true;
    }
  }
}
Buffer.byteLength = byteLength;

function slowToString (encoding, start, end) {
  var loweredCase = false;

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0;
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length;
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0;
  start >>>= 0;

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8';

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase();
        loweredCase = true;
    }
  }
}

// The property is used by `Buffer.isBuffer` and `is-buffer` (in Safari 5-7) to detect
// Buffer instances.
Buffer.prototype._isBuffer = true;

function swap (b, n, m) {
  var i = b[n];
  b[n] = b[m];
  b[m] = i;
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length;
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1);
  }
  return this
};

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length;
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3);
    swap(this, i + 1, i + 2);
  }
  return this
};

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length;
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7);
    swap(this, i + 1, i + 6);
    swap(this, i + 2, i + 5);
    swap(this, i + 3, i + 4);
  }
  return this
};

Buffer.prototype.toString = function toString () {
  var length = this.length | 0;
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
};

Buffer.prototype.equals = function equals (b) {
  if (!internalIsBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
};

Buffer.prototype.inspect = function inspect () {
  var str = '';
  var max = INSPECT_MAX_BYTES;
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ');
    if (this.length > max) str += ' ... ';
  }
  return '<Buffer ' + str + '>'
};

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (!internalIsBuffer(target)) {
    throw new TypeError('Argument must be a Buffer')
  }

  if (start === undefined) {
    start = 0;
  }
  if (end === undefined) {
    end = target ? target.length : 0;
  }
  if (thisStart === undefined) {
    thisStart = 0;
  }
  if (thisEnd === undefined) {
    thisEnd = this.length;
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0;
  end >>>= 0;
  thisStart >>>= 0;
  thisEnd >>>= 0;

  if (this === target) return 0

  var x = thisEnd - thisStart;
  var y = end - start;
  var len = Math.min(x, y);

  var thisCopy = this.slice(thisStart, thisEnd);
  var targetCopy = target.slice(start, end);

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i];
      y = targetCopy[i];
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
};

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset;
    byteOffset = 0;
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff;
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000;
  }
  byteOffset = +byteOffset;  // Coerce to Number.
  if (isNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1);
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset;
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1;
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0;
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding);
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (internalIsBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF; // Search for a byte value [0-255]
    if (Buffer.TYPED_ARRAY_SUPPORT &&
        typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1;
  var arrLength = arr.length;
  var valLength = val.length;

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase();
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2;
      arrLength /= 2;
      valLength /= 2;
      byteOffset /= 2;
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i;
  if (dir) {
    var foundIndex = -1;
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i;
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex;
        foundIndex = -1;
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength;
    for (i = byteOffset; i >= 0; i--) {
      var found = true;
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false;
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
};

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
};

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
};

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0;
  var remaining = buf.length - offset;
  if (!length) {
    length = remaining;
  } else {
    length = Number(length);
    if (length > remaining) {
      length = remaining;
    }
  }

  // must be an even number of digits
  var strLen = string.length;
  if (strLen % 2 !== 0) throw new TypeError('Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2;
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16);
    if (isNaN(parsed)) return i
    buf[offset + i] = parsed;
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8';
    length = this.length;
    offset = 0;
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset;
    length = this.length;
    offset = 0;
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset | 0;
    if (isFinite(length)) {
      length = length | 0;
      if (encoding === undefined) encoding = 'utf8';
    } else {
      encoding = length;
      length = undefined;
    }
  // legacy write(string, encoding, offset, length) - remove in v0.13
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset;
  if (length === undefined || length > remaining) length = remaining;

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8';

  var loweredCase = false;
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase();
        loweredCase = true;
    }
  }
};

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
};

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return fromByteArray(buf)
  } else {
    return fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end);
  var res = [];

  var i = start;
  while (i < end) {
    var firstByte = buf[i];
    var codePoint = null;
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
      : (firstByte > 0xBF) ? 2
      : 1;

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint;

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte;
          }
          break
        case 2:
          secondByte = buf[i + 1];
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F);
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint;
            }
          }
          break
        case 3:
          secondByte = buf[i + 1];
          thirdByte = buf[i + 2];
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F);
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint;
            }
          }
          break
        case 4:
          secondByte = buf[i + 1];
          thirdByte = buf[i + 2];
          fourthByte = buf[i + 3];
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F);
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint;
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD;
      bytesPerSequence = 1;
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000;
      res.push(codePoint >>> 10 & 0x3FF | 0xD800);
      codePoint = 0xDC00 | codePoint & 0x3FF;
    }

    res.push(codePoint);
    i += bytesPerSequence;
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000;

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length;
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = '';
  var i = 0;
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    );
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = '';
  end = Math.min(buf.length, end);

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F);
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = '';
  end = Math.min(buf.length, end);

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i]);
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length;

  if (!start || start < 0) start = 0;
  if (!end || end < 0 || end > len) end = len;

  var out = '';
  for (var i = start; i < end; ++i) {
    out += toHex(buf[i]);
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end);
  var res = '';
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256);
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length;
  start = ~~start;
  end = end === undefined ? len : ~~end;

  if (start < 0) {
    start += len;
    if (start < 0) start = 0;
  } else if (start > len) {
    start = len;
  }

  if (end < 0) {
    end += len;
    if (end < 0) end = 0;
  } else if (end > len) {
    end = len;
  }

  if (end < start) end = start;

  var newBuf;
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    newBuf = this.subarray(start, end);
    newBuf.__proto__ = Buffer.prototype;
  } else {
    var sliceLen = end - start;
    newBuf = new Buffer(sliceLen, undefined);
    for (var i = 0; i < sliceLen; ++i) {
      newBuf[i] = this[i + start];
    }
  }

  return newBuf
};

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset | 0;
  byteLength = byteLength | 0;
  if (!noAssert) checkOffset(offset, byteLength, this.length);

  var val = this[offset];
  var mul = 1;
  var i = 0;
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul;
  }

  return val
};

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset | 0;
  byteLength = byteLength | 0;
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length);
  }

  var val = this[offset + --byteLength];
  var mul = 1;
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul;
  }

  return val
};

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length);
  return this[offset]
};

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length);
  return this[offset] | (this[offset + 1] << 8)
};

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length);
  return (this[offset] << 8) | this[offset + 1]
};

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length);

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
};

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length);

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
};

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset | 0;
  byteLength = byteLength | 0;
  if (!noAssert) checkOffset(offset, byteLength, this.length);

  var val = this[offset];
  var mul = 1;
  var i = 0;
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul;
  }
  mul *= 0x80;

  if (val >= mul) val -= Math.pow(2, 8 * byteLength);

  return val
};

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset | 0;
  byteLength = byteLength | 0;
  if (!noAssert) checkOffset(offset, byteLength, this.length);

  var i = byteLength;
  var mul = 1;
  var val = this[offset + --i];
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul;
  }
  mul *= 0x80;

  if (val >= mul) val -= Math.pow(2, 8 * byteLength);

  return val
};

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length);
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
};

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length);
  var val = this[offset] | (this[offset + 1] << 8);
  return (val & 0x8000) ? val | 0xFFFF0000 : val
};

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length);
  var val = this[offset + 1] | (this[offset] << 8);
  return (val & 0x8000) ? val | 0xFFFF0000 : val
};

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length);

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
};

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length);

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
};

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length);
  return read(this, offset, true, 23, 4)
};

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length);
  return read(this, offset, false, 23, 4)
};

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length);
  return read(this, offset, true, 52, 8)
};

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length);
  return read(this, offset, false, 52, 8)
};

function checkInt (buf, value, offset, ext, max, min) {
  if (!internalIsBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value;
  offset = offset | 0;
  byteLength = byteLength | 0;
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1;
    checkInt(this, value, offset, byteLength, maxBytes, 0);
  }

  var mul = 1;
  var i = 0;
  this[offset] = value & 0xFF;
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF;
  }

  return offset + byteLength
};

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value;
  offset = offset | 0;
  byteLength = byteLength | 0;
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1;
    checkInt(this, value, offset, byteLength, maxBytes, 0);
  }

  var i = byteLength - 1;
  var mul = 1;
  this[offset + i] = value & 0xFF;
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF;
  }

  return offset + byteLength
};

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0);
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value);
  this[offset] = (value & 0xff);
  return offset + 1
};

function objectWriteUInt16 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffff + value + 1;
  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; ++i) {
    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
      (littleEndian ? i : 1 - i) * 8;
  }
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff);
    this[offset + 1] = (value >>> 8);
  } else {
    objectWriteUInt16(this, value, offset, true);
  }
  return offset + 2
};

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8);
    this[offset + 1] = (value & 0xff);
  } else {
    objectWriteUInt16(this, value, offset, false);
  }
  return offset + 2
};

function objectWriteUInt32 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffffffff + value + 1;
  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; ++i) {
    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff;
  }
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset + 3] = (value >>> 24);
    this[offset + 2] = (value >>> 16);
    this[offset + 1] = (value >>> 8);
    this[offset] = (value & 0xff);
  } else {
    objectWriteUInt32(this, value, offset, true);
  }
  return offset + 4
};

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24);
    this[offset + 1] = (value >>> 16);
    this[offset + 2] = (value >>> 8);
    this[offset + 3] = (value & 0xff);
  } else {
    objectWriteUInt32(this, value, offset, false);
  }
  return offset + 4
};

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1);

    checkInt(this, value, offset, byteLength, limit - 1, -limit);
  }

  var i = 0;
  var mul = 1;
  var sub = 0;
  this[offset] = value & 0xFF;
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1;
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF;
  }

  return offset + byteLength
};

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1);

    checkInt(this, value, offset, byteLength, limit - 1, -limit);
  }

  var i = byteLength - 1;
  var mul = 1;
  var sub = 0;
  this[offset + i] = value & 0xFF;
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1;
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF;
  }

  return offset + byteLength
};

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80);
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value);
  if (value < 0) value = 0xff + value + 1;
  this[offset] = (value & 0xff);
  return offset + 1
};

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000);
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff);
    this[offset + 1] = (value >>> 8);
  } else {
    objectWriteUInt16(this, value, offset, true);
  }
  return offset + 2
};

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000);
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8);
    this[offset + 1] = (value & 0xff);
  } else {
    objectWriteUInt16(this, value, offset, false);
  }
  return offset + 2
};

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff);
    this[offset + 1] = (value >>> 8);
    this[offset + 2] = (value >>> 16);
    this[offset + 3] = (value >>> 24);
  } else {
    objectWriteUInt32(this, value, offset, true);
  }
  return offset + 4
};

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
  if (value < 0) value = 0xffffffff + value + 1;
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24);
    this[offset + 1] = (value >>> 16);
    this[offset + 2] = (value >>> 8);
    this[offset + 3] = (value & 0xff);
  } else {
    objectWriteUInt32(this, value, offset, false);
  }
  return offset + 4
};

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4);
  }
  write(buf, value, offset, littleEndian, 23, 4);
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
};

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
};

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8);
  }
  write(buf, value, offset, littleEndian, 52, 8);
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
};

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
};

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!start) start = 0;
  if (!end && end !== 0) end = this.length;
  if (targetStart >= target.length) targetStart = target.length;
  if (!targetStart) targetStart = 0;
  if (end > 0 && end < start) end = start;

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length;
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start;
  }

  var len = end - start;
  var i;

  if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start];
    }
  } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
    // ascending copy from start
    for (i = 0; i < len; ++i) {
      target[i + targetStart] = this[i + start];
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, start + len),
      targetStart
    );
  }

  return len
};

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start;
      start = 0;
      end = this.length;
    } else if (typeof end === 'string') {
      encoding = end;
      end = this.length;
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0);
      if (code < 256) {
        val = code;
      }
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
  } else if (typeof val === 'number') {
    val = val & 255;
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0;
  end = end === undefined ? this.length : end >>> 0;

  if (!val) val = 0;

  var i;
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val;
    }
  } else {
    var bytes = internalIsBuffer(val)
      ? val
      : utf8ToBytes(new Buffer(val, encoding).toString());
    var len = bytes.length;
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len];
    }
  }

  return this
};

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g;

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = stringtrim(str).replace(INVALID_BASE64_RE, '');
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '=';
  }
  return str
}

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity;
  var codePoint;
  var length = string.length;
  var leadSurrogate = null;
  var bytes = [];

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i);

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
          continue
        }

        // valid lead
        leadSurrogate = codePoint;

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
        leadSurrogate = codePoint;
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000;
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
    }

    leadSurrogate = null;

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint);
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      );
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      );
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      );
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = [];
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF);
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo;
  var byteArray = [];
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i);
    hi = c >> 8;
    lo = c % 256;
    byteArray.push(lo);
    byteArray.push(hi);
  }

  return byteArray
}


function base64ToBytes (str) {
  return toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i];
  }
  return i
}

function isnan (val) {
  return val !== val // eslint-disable-line no-self-compare
}


// the following is from is-buffer, also by Feross Aboukhadijeh and with same lisence
// The _isBuffer check is for Safari 5-7 support, because it's missing
// Object.prototype.constructor. Remove this eventually
function isBuffer(obj) {
  return obj != null && (!!obj._isBuffer || isFastBuffer(obj) || isSlowBuffer(obj))
}

function isFastBuffer (obj) {
  return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
}

// For Node v0.10 support. Remove this eventually.
function isSlowBuffer (obj) {
  return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isFastBuffer(obj.slice(0, 0))
}

var _polyfillNode_buffer = /*#__PURE__*/Object.freeze({
  __proto__: null,
  Buffer: Buffer,
  INSPECT_MAX_BYTES: INSPECT_MAX_BYTES,
  SlowBuffer: SlowBuffer,
  isBuffer: isBuffer,
  kMaxLength: _kMaxLength
});

var require$$0 = /*@__PURE__*/getAugmentedNamespace(_polyfillNode_buffer);

function commonjsRequire(path) {
	throw new Error('Could not dynamically require "' + path + '". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.');
}

var long = {exports: {}};

/*
 Copyright 2013 Daniel Wirtz <dcode@dcode.io>
 Copyright 2009 The Closure Library Authors. All Rights Reserved.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS-IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */
long.exports;
(function (module) {
  /**
   * @license long.js (c) 2013 Daniel Wirtz <dcode@dcode.io>
   * Released under the Apache License, Version 2.0
   * see: https://github.com/dcodeIO/long.js for details
   */
  (function (global, factory) {
    /* AMD */if (typeof commonjsRequire === 'function' && 'object' === "object" && module && module["exports"]) module["exports"] = factory();
    /* Global */else (global["dcodeIO"] = global["dcodeIO"] || {})["Long"] = factory();
  })(commonjsGlobal, function () {

    /**
     * Constructs a 64 bit two's-complement integer, given its low and high 32 bit values as *signed* integers.
     *  See the from* functions below for more convenient ways of constructing Longs.
     * @exports Long
     * @class A Long class for representing a 64 bit two's-complement integer value.
     * @param {number} low The low (signed) 32 bits of the long
     * @param {number} high The high (signed) 32 bits of the long
     * @param {boolean=} unsigned Whether unsigned or not, defaults to `false` for signed
     * @constructor
     */
    function Long(low, high, unsigned) {
      /**
       * The low 32 bits as a signed value.
       * @type {number}
       */
      this.low = low | 0;

      /**
       * The high 32 bits as a signed value.
       * @type {number}
       */
      this.high = high | 0;

      /**
       * Whether unsigned or not.
       * @type {boolean}
       */
      this.unsigned = !!unsigned;
    }

    // The internal representation of a long is the two given signed, 32-bit values.
    // We use 32-bit pieces because these are the size of integers on which
    // Javascript performs bit-operations.  For operations like addition and
    // multiplication, we split each number into 16 bit pieces, which can easily be
    // multiplied within Javascript's floating-point representation without overflow
    // or change in sign.
    //
    // In the algorithms below, we frequently reduce the negative case to the
    // positive case by negating the input(s) and then post-processing the result.
    // Note that we must ALWAYS check specially whether those values are MIN_VALUE
    // (-2^63) because -MIN_VALUE == MIN_VALUE (since 2^63 cannot be represented as
    // a positive number, it overflows back into a negative).  Not handling this
    // case would often result in infinite recursion.
    //
    // Common constant values ZERO, ONE, NEG_ONE, etc. are defined below the from*
    // methods on which they depend.

    /**
     * An indicator used to reliably determine if an object is a Long or not.
     * @type {boolean}
     * @const
     * @private
     */
    Long.prototype.__isLong__;
    Object.defineProperty(Long.prototype, "__isLong__", {
      value: true,
      enumerable: false,
      configurable: false
    });

    /**
     * @function
     * @param {*} obj Object
     * @returns {boolean}
     * @inner
     */
    function isLong(obj) {
      return (obj && obj["__isLong__"]) === true;
    }

    /**
     * Tests if the specified object is a Long.
     * @function
     * @param {*} obj Object
     * @returns {boolean}
     */
    Long.isLong = isLong;

    /**
     * A cache of the Long representations of small integer values.
     * @type {!Object}
     * @inner
     */
    var INT_CACHE = {};

    /**
     * A cache of the Long representations of small unsigned integer values.
     * @type {!Object}
     * @inner
     */
    var UINT_CACHE = {};

    /**
     * @param {number} value
     * @param {boolean=} unsigned
     * @returns {!Long}
     * @inner
     */
    function fromInt(value, unsigned) {
      var obj, cachedObj, cache;
      if (unsigned) {
        value >>>= 0;
        if (cache = 0 <= value && value < 256) {
          cachedObj = UINT_CACHE[value];
          if (cachedObj) return cachedObj;
        }
        obj = fromBits(value, (value | 0) < 0 ? -1 : 0, true);
        if (cache) UINT_CACHE[value] = obj;
        return obj;
      } else {
        value |= 0;
        if (cache = -128 <= value && value < 128) {
          cachedObj = INT_CACHE[value];
          if (cachedObj) return cachedObj;
        }
        obj = fromBits(value, value < 0 ? -1 : 0, false);
        if (cache) INT_CACHE[value] = obj;
        return obj;
      }
    }

    /**
     * Returns a Long representing the given 32 bit integer value.
     * @function
     * @param {number} value The 32 bit integer in question
     * @param {boolean=} unsigned Whether unsigned or not, defaults to `false` for signed
     * @returns {!Long} The corresponding Long value
     */
    Long.fromInt = fromInt;

    /**
     * @param {number} value
     * @param {boolean=} unsigned
     * @returns {!Long}
     * @inner
     */
    function fromNumber(value, unsigned) {
      if (isNaN(value) || !isFinite(value)) return unsigned ? UZERO : ZERO;
      if (unsigned) {
        if (value < 0) return UZERO;
        if (value >= TWO_PWR_64_DBL) return MAX_UNSIGNED_VALUE;
      } else {
        if (value <= -TWO_PWR_63_DBL) return MIN_VALUE;
        if (value + 1 >= TWO_PWR_63_DBL) return MAX_VALUE;
      }
      if (value < 0) return fromNumber(-value, unsigned).neg();
      return fromBits(value % TWO_PWR_32_DBL | 0, value / TWO_PWR_32_DBL | 0, unsigned);
    }

    /**
     * Returns a Long representing the given value, provided that it is a finite number. Otherwise, zero is returned.
     * @function
     * @param {number} value The number in question
     * @param {boolean=} unsigned Whether unsigned or not, defaults to `false` for signed
     * @returns {!Long} The corresponding Long value
     */
    Long.fromNumber = fromNumber;

    /**
     * @param {number} lowBits
     * @param {number} highBits
     * @param {boolean=} unsigned
     * @returns {!Long}
     * @inner
     */
    function fromBits(lowBits, highBits, unsigned) {
      return new Long(lowBits, highBits, unsigned);
    }

    /**
     * Returns a Long representing the 64 bit integer that comes by concatenating the given low and high bits. Each is
     *  assumed to use 32 bits.
     * @function
     * @param {number} lowBits The low 32 bits
     * @param {number} highBits The high 32 bits
     * @param {boolean=} unsigned Whether unsigned or not, defaults to `false` for signed
     * @returns {!Long} The corresponding Long value
     */
    Long.fromBits = fromBits;

    /**
     * @function
     * @param {number} base
     * @param {number} exponent
     * @returns {number}
     * @inner
     */
    var pow_dbl = Math.pow; // Used 4 times (4*8 to 15+4)

    /**
     * @param {string} str
     * @param {(boolean|number)=} unsigned
     * @param {number=} radix
     * @returns {!Long}
     * @inner
     */
    function fromString(str, unsigned, radix) {
      if (str.length === 0) throw Error('empty string');
      if (str === "NaN" || str === "Infinity" || str === "+Infinity" || str === "-Infinity") return ZERO;
      if (typeof unsigned === 'number') {
        // For goog.math.long compatibility
        radix = unsigned, unsigned = false;
      } else {
        unsigned = !!unsigned;
      }
      radix = radix || 10;
      if (radix < 2 || 36 < radix) throw RangeError('radix');
      var p;
      if ((p = str.indexOf('-')) > 0) throw Error('interior hyphen');else if (p === 0) {
        return fromString(str.substring(1), unsigned, radix).neg();
      }

      // Do several (8) digits each time through the loop, so as to
      // minimize the calls to the very expensive emulated div.
      var radixToPower = fromNumber(pow_dbl(radix, 8));
      var result = ZERO;
      for (var i = 0; i < str.length; i += 8) {
        var size = Math.min(8, str.length - i),
          value = parseInt(str.substring(i, i + size), radix);
        if (size < 8) {
          var power = fromNumber(pow_dbl(radix, size));
          result = result.mul(power).add(fromNumber(value));
        } else {
          result = result.mul(radixToPower);
          result = result.add(fromNumber(value));
        }
      }
      result.unsigned = unsigned;
      return result;
    }

    /**
     * Returns a Long representation of the given string, written using the specified radix.
     * @function
     * @param {string} str The textual representation of the Long
     * @param {(boolean|number)=} unsigned Whether unsigned or not, defaults to `false` for signed
     * @param {number=} radix The radix in which the text is written (2-36), defaults to 10
     * @returns {!Long} The corresponding Long value
     */
    Long.fromString = fromString;

    /**
     * @function
     * @param {!Long|number|string|!{low: number, high: number, unsigned: boolean}} val
     * @returns {!Long}
     * @inner
     */
    function fromValue(val) {
      if (val /* is compatible */ instanceof Long) return val;
      if (typeof val === 'number') return fromNumber(val);
      if (typeof val === 'string') return fromString(val);
      // Throws for non-objects, converts non-instanceof Long:
      return fromBits(val.low, val.high, val.unsigned);
    }

    /**
     * Converts the specified value to a Long.
     * @function
     * @param {!Long|number|string|!{low: number, high: number, unsigned: boolean}} val Value
     * @returns {!Long}
     */
    Long.fromValue = fromValue;

    // NOTE: the compiler should inline these constant values below and then remove these variables, so there should be
    // no runtime penalty for these.

    /**
     * @type {number}
     * @const
     * @inner
     */
    var TWO_PWR_16_DBL = 1 << 16;

    /**
     * @type {number}
     * @const
     * @inner
     */
    var TWO_PWR_24_DBL = 1 << 24;

    /**
     * @type {number}
     * @const
     * @inner
     */
    var TWO_PWR_32_DBL = TWO_PWR_16_DBL * TWO_PWR_16_DBL;

    /**
     * @type {number}
     * @const
     * @inner
     */
    var TWO_PWR_64_DBL = TWO_PWR_32_DBL * TWO_PWR_32_DBL;

    /**
     * @type {number}
     * @const
     * @inner
     */
    var TWO_PWR_63_DBL = TWO_PWR_64_DBL / 2;

    /**
     * @type {!Long}
     * @const
     * @inner
     */
    var TWO_PWR_24 = fromInt(TWO_PWR_24_DBL);

    /**
     * @type {!Long}
     * @inner
     */
    var ZERO = fromInt(0);

    /**
     * Signed zero.
     * @type {!Long}
     */
    Long.ZERO = ZERO;

    /**
     * @type {!Long}
     * @inner
     */
    var UZERO = fromInt(0, true);

    /**
     * Unsigned zero.
     * @type {!Long}
     */
    Long.UZERO = UZERO;

    /**
     * @type {!Long}
     * @inner
     */
    var ONE = fromInt(1);

    /**
     * Signed one.
     * @type {!Long}
     */
    Long.ONE = ONE;

    /**
     * @type {!Long}
     * @inner
     */
    var UONE = fromInt(1, true);

    /**
     * Unsigned one.
     * @type {!Long}
     */
    Long.UONE = UONE;

    /**
     * @type {!Long}
     * @inner
     */
    var NEG_ONE = fromInt(-1);

    /**
     * Signed negative one.
     * @type {!Long}
     */
    Long.NEG_ONE = NEG_ONE;

    /**
     * @type {!Long}
     * @inner
     */
    var MAX_VALUE = fromBits(0xFFFFFFFF | 0, 0x7FFFFFFF | 0, false);

    /**
     * Maximum signed value.
     * @type {!Long}
     */
    Long.MAX_VALUE = MAX_VALUE;

    /**
     * @type {!Long}
     * @inner
     */
    var MAX_UNSIGNED_VALUE = fromBits(0xFFFFFFFF | 0, 0xFFFFFFFF | 0, true);

    /**
     * Maximum unsigned value.
     * @type {!Long}
     */
    Long.MAX_UNSIGNED_VALUE = MAX_UNSIGNED_VALUE;

    /**
     * @type {!Long}
     * @inner
     */
    var MIN_VALUE = fromBits(0, 0x80000000 | 0, false);

    /**
     * Minimum signed value.
     * @type {!Long}
     */
    Long.MIN_VALUE = MIN_VALUE;

    /**
     * @alias Long.prototype
     * @inner
     */
    var LongPrototype = Long.prototype;

    /**
     * Converts the Long to a 32 bit integer, assuming it is a 32 bit integer.
     * @returns {number}
     */
    LongPrototype.toInt = function toInt() {
      return this.unsigned ? this.low >>> 0 : this.low;
    };

    /**
     * Converts the Long to a the nearest floating-point representation of this value (double, 53 bit mantissa).
     * @returns {number}
     */
    LongPrototype.toNumber = function toNumber() {
      if (this.unsigned) return (this.high >>> 0) * TWO_PWR_32_DBL + (this.low >>> 0);
      return this.high * TWO_PWR_32_DBL + (this.low >>> 0);
    };

    /**
     * Converts the Long to a string written in the specified radix.
     * @param {number=} radix Radix (2-36), defaults to 10
     * @returns {string}
     * @override
     * @throws {RangeError} If `radix` is out of range
     */
    LongPrototype.toString = function toString(radix) {
      radix = radix || 10;
      if (radix < 2 || 36 < radix) throw RangeError('radix');
      if (this.isZero()) return '0';
      if (this.isNegative()) {
        // Unsigned Longs are never negative
        if (this.eq(MIN_VALUE)) {
          // We need to change the Long value before it can be negated, so we remove
          // the bottom-most digit in this base and then recurse to do the rest.
          var radixLong = fromNumber(radix),
            div = this.div(radixLong),
            rem1 = div.mul(radixLong).sub(this);
          return div.toString(radix) + rem1.toInt().toString(radix);
        } else return '-' + this.neg().toString(radix);
      }

      // Do several (6) digits each time through the loop, so as to
      // minimize the calls to the very expensive emulated div.
      var radixToPower = fromNumber(pow_dbl(radix, 6), this.unsigned),
        rem = this;
      var result = '';
      while (true) {
        var remDiv = rem.div(radixToPower),
          intval = rem.sub(remDiv.mul(radixToPower)).toInt() >>> 0,
          digits = intval.toString(radix);
        rem = remDiv;
        if (rem.isZero()) return digits + result;else {
          while (digits.length < 6) digits = '0' + digits;
          result = '' + digits + result;
        }
      }
    };

    /**
     * Gets the high 32 bits as a signed integer.
     * @returns {number} Signed high bits
     */
    LongPrototype.getHighBits = function getHighBits() {
      return this.high;
    };

    /**
     * Gets the high 32 bits as an unsigned integer.
     * @returns {number} Unsigned high bits
     */
    LongPrototype.getHighBitsUnsigned = function getHighBitsUnsigned() {
      return this.high >>> 0;
    };

    /**
     * Gets the low 32 bits as a signed integer.
     * @returns {number} Signed low bits
     */
    LongPrototype.getLowBits = function getLowBits() {
      return this.low;
    };

    /**
     * Gets the low 32 bits as an unsigned integer.
     * @returns {number} Unsigned low bits
     */
    LongPrototype.getLowBitsUnsigned = function getLowBitsUnsigned() {
      return this.low >>> 0;
    };

    /**
     * Gets the number of bits needed to represent the absolute value of this Long.
     * @returns {number}
     */
    LongPrototype.getNumBitsAbs = function getNumBitsAbs() {
      if (this.isNegative())
        // Unsigned Longs are never negative
        return this.eq(MIN_VALUE) ? 64 : this.neg().getNumBitsAbs();
      var val = this.high != 0 ? this.high : this.low;
      for (var bit = 31; bit > 0; bit--) if ((val & 1 << bit) != 0) break;
      return this.high != 0 ? bit + 33 : bit + 1;
    };

    /**
     * Tests if this Long's value equals zero.
     * @returns {boolean}
     */
    LongPrototype.isZero = function isZero() {
      return this.high === 0 && this.low === 0;
    };

    /**
     * Tests if this Long's value is negative.
     * @returns {boolean}
     */
    LongPrototype.isNegative = function isNegative() {
      return !this.unsigned && this.high < 0;
    };

    /**
     * Tests if this Long's value is positive.
     * @returns {boolean}
     */
    LongPrototype.isPositive = function isPositive() {
      return this.unsigned || this.high >= 0;
    };

    /**
     * Tests if this Long's value is odd.
     * @returns {boolean}
     */
    LongPrototype.isOdd = function isOdd() {
      return (this.low & 1) === 1;
    };

    /**
     * Tests if this Long's value is even.
     * @returns {boolean}
     */
    LongPrototype.isEven = function isEven() {
      return (this.low & 1) === 0;
    };

    /**
     * Tests if this Long's value equals the specified's.
     * @param {!Long|number|string} other Other value
     * @returns {boolean}
     */
    LongPrototype.equals = function equals(other) {
      if (!isLong(other)) other = fromValue(other);
      if (this.unsigned !== other.unsigned && this.high >>> 31 === 1 && other.high >>> 31 === 1) return false;
      return this.high === other.high && this.low === other.low;
    };

    /**
     * Tests if this Long's value equals the specified's. This is an alias of {@link Long#equals}.
     * @function
     * @param {!Long|number|string} other Other value
     * @returns {boolean}
     */
    LongPrototype.eq = LongPrototype.equals;

    /**
     * Tests if this Long's value differs from the specified's.
     * @param {!Long|number|string} other Other value
     * @returns {boolean}
     */
    LongPrototype.notEquals = function notEquals(other) {
      return !this.eq( /* validates */other);
    };

    /**
     * Tests if this Long's value differs from the specified's. This is an alias of {@link Long#notEquals}.
     * @function
     * @param {!Long|number|string} other Other value
     * @returns {boolean}
     */
    LongPrototype.neq = LongPrototype.notEquals;

    /**
     * Tests if this Long's value is less than the specified's.
     * @param {!Long|number|string} other Other value
     * @returns {boolean}
     */
    LongPrototype.lessThan = function lessThan(other) {
      return this.comp( /* validates */other) < 0;
    };

    /**
     * Tests if this Long's value is less than the specified's. This is an alias of {@link Long#lessThan}.
     * @function
     * @param {!Long|number|string} other Other value
     * @returns {boolean}
     */
    LongPrototype.lt = LongPrototype.lessThan;

    /**
     * Tests if this Long's value is less than or equal the specified's.
     * @param {!Long|number|string} other Other value
     * @returns {boolean}
     */
    LongPrototype.lessThanOrEqual = function lessThanOrEqual(other) {
      return this.comp( /* validates */other) <= 0;
    };

    /**
     * Tests if this Long's value is less than or equal the specified's. This is an alias of {@link Long#lessThanOrEqual}.
     * @function
     * @param {!Long|number|string} other Other value
     * @returns {boolean}
     */
    LongPrototype.lte = LongPrototype.lessThanOrEqual;

    /**
     * Tests if this Long's value is greater than the specified's.
     * @param {!Long|number|string} other Other value
     * @returns {boolean}
     */
    LongPrototype.greaterThan = function greaterThan(other) {
      return this.comp( /* validates */other) > 0;
    };

    /**
     * Tests if this Long's value is greater than the specified's. This is an alias of {@link Long#greaterThan}.
     * @function
     * @param {!Long|number|string} other Other value
     * @returns {boolean}
     */
    LongPrototype.gt = LongPrototype.greaterThan;

    /**
     * Tests if this Long's value is greater than or equal the specified's.
     * @param {!Long|number|string} other Other value
     * @returns {boolean}
     */
    LongPrototype.greaterThanOrEqual = function greaterThanOrEqual(other) {
      return this.comp( /* validates */other) >= 0;
    };

    /**
     * Tests if this Long's value is greater than or equal the specified's. This is an alias of {@link Long#greaterThanOrEqual}.
     * @function
     * @param {!Long|number|string} other Other value
     * @returns {boolean}
     */
    LongPrototype.gte = LongPrototype.greaterThanOrEqual;

    /**
     * Compares this Long's value with the specified's.
     * @param {!Long|number|string} other Other value
     * @returns {number} 0 if they are the same, 1 if the this is greater and -1
     *  if the given one is greater
     */
    LongPrototype.compare = function compare(other) {
      if (!isLong(other)) other = fromValue(other);
      if (this.eq(other)) return 0;
      var thisNeg = this.isNegative(),
        otherNeg = other.isNegative();
      if (thisNeg && !otherNeg) return -1;
      if (!thisNeg && otherNeg) return 1;
      // At this point the sign bits are the same
      if (!this.unsigned) return this.sub(other).isNegative() ? -1 : 1;
      // Both are positive if at least one is unsigned
      return other.high >>> 0 > this.high >>> 0 || other.high === this.high && other.low >>> 0 > this.low >>> 0 ? -1 : 1;
    };

    /**
     * Compares this Long's value with the specified's. This is an alias of {@link Long#compare}.
     * @function
     * @param {!Long|number|string} other Other value
     * @returns {number} 0 if they are the same, 1 if the this is greater and -1
     *  if the given one is greater
     */
    LongPrototype.comp = LongPrototype.compare;

    /**
     * Negates this Long's value.
     * @returns {!Long} Negated Long
     */
    LongPrototype.negate = function negate() {
      if (!this.unsigned && this.eq(MIN_VALUE)) return MIN_VALUE;
      return this.not().add(ONE);
    };

    /**
     * Negates this Long's value. This is an alias of {@link Long#negate}.
     * @function
     * @returns {!Long} Negated Long
     */
    LongPrototype.neg = LongPrototype.negate;

    /**
     * Returns the sum of this and the specified Long.
     * @param {!Long|number|string} addend Addend
     * @returns {!Long} Sum
     */
    LongPrototype.add = function add(addend) {
      if (!isLong(addend)) addend = fromValue(addend);

      // Divide each number into 4 chunks of 16 bits, and then sum the chunks.

      var a48 = this.high >>> 16;
      var a32 = this.high & 0xFFFF;
      var a16 = this.low >>> 16;
      var a00 = this.low & 0xFFFF;
      var b48 = addend.high >>> 16;
      var b32 = addend.high & 0xFFFF;
      var b16 = addend.low >>> 16;
      var b00 = addend.low & 0xFFFF;
      var c48 = 0,
        c32 = 0,
        c16 = 0,
        c00 = 0;
      c00 += a00 + b00;
      c16 += c00 >>> 16;
      c00 &= 0xFFFF;
      c16 += a16 + b16;
      c32 += c16 >>> 16;
      c16 &= 0xFFFF;
      c32 += a32 + b32;
      c48 += c32 >>> 16;
      c32 &= 0xFFFF;
      c48 += a48 + b48;
      c48 &= 0xFFFF;
      return fromBits(c16 << 16 | c00, c48 << 16 | c32, this.unsigned);
    };

    /**
     * Returns the difference of this and the specified Long.
     * @param {!Long|number|string} subtrahend Subtrahend
     * @returns {!Long} Difference
     */
    LongPrototype.subtract = function subtract(subtrahend) {
      if (!isLong(subtrahend)) subtrahend = fromValue(subtrahend);
      return this.add(subtrahend.neg());
    };

    /**
     * Returns the difference of this and the specified Long. This is an alias of {@link Long#subtract}.
     * @function
     * @param {!Long|number|string} subtrahend Subtrahend
     * @returns {!Long} Difference
     */
    LongPrototype.sub = LongPrototype.subtract;

    /**
     * Returns the product of this and the specified Long.
     * @param {!Long|number|string} multiplier Multiplier
     * @returns {!Long} Product
     */
    LongPrototype.multiply = function multiply(multiplier) {
      if (this.isZero()) return ZERO;
      if (!isLong(multiplier)) multiplier = fromValue(multiplier);
      if (multiplier.isZero()) return ZERO;
      if (this.eq(MIN_VALUE)) return multiplier.isOdd() ? MIN_VALUE : ZERO;
      if (multiplier.eq(MIN_VALUE)) return this.isOdd() ? MIN_VALUE : ZERO;
      if (this.isNegative()) {
        if (multiplier.isNegative()) return this.neg().mul(multiplier.neg());else return this.neg().mul(multiplier).neg();
      } else if (multiplier.isNegative()) return this.mul(multiplier.neg()).neg();

      // If both longs are small, use float multiplication
      if (this.lt(TWO_PWR_24) && multiplier.lt(TWO_PWR_24)) return fromNumber(this.toNumber() * multiplier.toNumber(), this.unsigned);

      // Divide each long into 4 chunks of 16 bits, and then add up 4x4 products.
      // We can skip products that would overflow.

      var a48 = this.high >>> 16;
      var a32 = this.high & 0xFFFF;
      var a16 = this.low >>> 16;
      var a00 = this.low & 0xFFFF;
      var b48 = multiplier.high >>> 16;
      var b32 = multiplier.high & 0xFFFF;
      var b16 = multiplier.low >>> 16;
      var b00 = multiplier.low & 0xFFFF;
      var c48 = 0,
        c32 = 0,
        c16 = 0,
        c00 = 0;
      c00 += a00 * b00;
      c16 += c00 >>> 16;
      c00 &= 0xFFFF;
      c16 += a16 * b00;
      c32 += c16 >>> 16;
      c16 &= 0xFFFF;
      c16 += a00 * b16;
      c32 += c16 >>> 16;
      c16 &= 0xFFFF;
      c32 += a32 * b00;
      c48 += c32 >>> 16;
      c32 &= 0xFFFF;
      c32 += a16 * b16;
      c48 += c32 >>> 16;
      c32 &= 0xFFFF;
      c32 += a00 * b32;
      c48 += c32 >>> 16;
      c32 &= 0xFFFF;
      c48 += a48 * b00 + a32 * b16 + a16 * b32 + a00 * b48;
      c48 &= 0xFFFF;
      return fromBits(c16 << 16 | c00, c48 << 16 | c32, this.unsigned);
    };

    /**
     * Returns the product of this and the specified Long. This is an alias of {@link Long#multiply}.
     * @function
     * @param {!Long|number|string} multiplier Multiplier
     * @returns {!Long} Product
     */
    LongPrototype.mul = LongPrototype.multiply;

    /**
     * Returns this Long divided by the specified. The result is signed if this Long is signed or
     *  unsigned if this Long is unsigned.
     * @param {!Long|number|string} divisor Divisor
     * @returns {!Long} Quotient
     */
    LongPrototype.divide = function divide(divisor) {
      if (!isLong(divisor)) divisor = fromValue(divisor);
      if (divisor.isZero()) throw Error('division by zero');
      if (this.isZero()) return this.unsigned ? UZERO : ZERO;
      var approx, rem, res;
      if (!this.unsigned) {
        // This section is only relevant for signed longs and is derived from the
        // closure library as a whole.
        if (this.eq(MIN_VALUE)) {
          if (divisor.eq(ONE) || divisor.eq(NEG_ONE)) return MIN_VALUE; // recall that -MIN_VALUE == MIN_VALUE
          else if (divisor.eq(MIN_VALUE)) return ONE;else {
            // At this point, we have |other| >= 2, so |this/other| < |MIN_VALUE|.
            var halfThis = this.shr(1);
            approx = halfThis.div(divisor).shl(1);
            if (approx.eq(ZERO)) {
              return divisor.isNegative() ? ONE : NEG_ONE;
            } else {
              rem = this.sub(divisor.mul(approx));
              res = approx.add(rem.div(divisor));
              return res;
            }
          }
        } else if (divisor.eq(MIN_VALUE)) return this.unsigned ? UZERO : ZERO;
        if (this.isNegative()) {
          if (divisor.isNegative()) return this.neg().div(divisor.neg());
          return this.neg().div(divisor).neg();
        } else if (divisor.isNegative()) return this.div(divisor.neg()).neg();
        res = ZERO;
      } else {
        // The algorithm below has not been made for unsigned longs. It's therefore
        // required to take special care of the MSB prior to running it.
        if (!divisor.unsigned) divisor = divisor.toUnsigned();
        if (divisor.gt(this)) return UZERO;
        if (divisor.gt(this.shru(1)))
          // 15 >>> 1 = 7 ; with divisor = 8 ; true
          return UONE;
        res = UZERO;
      }

      // Repeat the following until the remainder is less than other:  find a
      // floating-point that approximates remainder / other *from below*, add this
      // into the result, and subtract it from the remainder.  It is critical that
      // the approximate value is less than or equal to the real value so that the
      // remainder never becomes negative.
      rem = this;
      while (rem.gte(divisor)) {
        // Approximate the result of division. This may be a little greater or
        // smaller than the actual value.
        approx = Math.max(1, Math.floor(rem.toNumber() / divisor.toNumber()));

        // We will tweak the approximate result by changing it in the 48-th digit or
        // the smallest non-fractional digit, whichever is larger.
        var log2 = Math.ceil(Math.log(approx) / Math.LN2),
          delta = log2 <= 48 ? 1 : pow_dbl(2, log2 - 48),
          // Decrease the approximation until it is smaller than the remainder.  Note
          // that if it is too large, the product overflows and is negative.
          approxRes = fromNumber(approx),
          approxRem = approxRes.mul(divisor);
        while (approxRem.isNegative() || approxRem.gt(rem)) {
          approx -= delta;
          approxRes = fromNumber(approx, this.unsigned);
          approxRem = approxRes.mul(divisor);
        }

        // We know the answer can't be zero... and actually, zero would cause
        // infinite recursion since we would make no progress.
        if (approxRes.isZero()) approxRes = ONE;
        res = res.add(approxRes);
        rem = rem.sub(approxRem);
      }
      return res;
    };

    /**
     * Returns this Long divided by the specified. This is an alias of {@link Long#divide}.
     * @function
     * @param {!Long|number|string} divisor Divisor
     * @returns {!Long} Quotient
     */
    LongPrototype.div = LongPrototype.divide;

    /**
     * Returns this Long modulo the specified.
     * @param {!Long|number|string} divisor Divisor
     * @returns {!Long} Remainder
     */
    LongPrototype.modulo = function modulo(divisor) {
      if (!isLong(divisor)) divisor = fromValue(divisor);
      return this.sub(this.div(divisor).mul(divisor));
    };

    /**
     * Returns this Long modulo the specified. This is an alias of {@link Long#modulo}.
     * @function
     * @param {!Long|number|string} divisor Divisor
     * @returns {!Long} Remainder
     */
    LongPrototype.mod = LongPrototype.modulo;

    /**
     * Returns the bitwise NOT of this Long.
     * @returns {!Long}
     */
    LongPrototype.not = function not() {
      return fromBits(~this.low, ~this.high, this.unsigned);
    };

    /**
     * Returns the bitwise AND of this Long and the specified.
     * @param {!Long|number|string} other Other Long
     * @returns {!Long}
     */
    LongPrototype.and = function and(other) {
      if (!isLong(other)) other = fromValue(other);
      return fromBits(this.low & other.low, this.high & other.high, this.unsigned);
    };

    /**
     * Returns the bitwise OR of this Long and the specified.
     * @param {!Long|number|string} other Other Long
     * @returns {!Long}
     */
    LongPrototype.or = function or(other) {
      if (!isLong(other)) other = fromValue(other);
      return fromBits(this.low | other.low, this.high | other.high, this.unsigned);
    };

    /**
     * Returns the bitwise XOR of this Long and the given one.
     * @param {!Long|number|string} other Other Long
     * @returns {!Long}
     */
    LongPrototype.xor = function xor(other) {
      if (!isLong(other)) other = fromValue(other);
      return fromBits(this.low ^ other.low, this.high ^ other.high, this.unsigned);
    };

    /**
     * Returns this Long with bits shifted to the left by the given amount.
     * @param {number|!Long} numBits Number of bits
     * @returns {!Long} Shifted Long
     */
    LongPrototype.shiftLeft = function shiftLeft(numBits) {
      if (isLong(numBits)) numBits = numBits.toInt();
      if ((numBits &= 63) === 0) return this;else if (numBits < 32) return fromBits(this.low << numBits, this.high << numBits | this.low >>> 32 - numBits, this.unsigned);else return fromBits(0, this.low << numBits - 32, this.unsigned);
    };

    /**
     * Returns this Long with bits shifted to the left by the given amount. This is an alias of {@link Long#shiftLeft}.
     * @function
     * @param {number|!Long} numBits Number of bits
     * @returns {!Long} Shifted Long
     */
    LongPrototype.shl = LongPrototype.shiftLeft;

    /**
     * Returns this Long with bits arithmetically shifted to the right by the given amount.
     * @param {number|!Long} numBits Number of bits
     * @returns {!Long} Shifted Long
     */
    LongPrototype.shiftRight = function shiftRight(numBits) {
      if (isLong(numBits)) numBits = numBits.toInt();
      if ((numBits &= 63) === 0) return this;else if (numBits < 32) return fromBits(this.low >>> numBits | this.high << 32 - numBits, this.high >> numBits, this.unsigned);else return fromBits(this.high >> numBits - 32, this.high >= 0 ? 0 : -1, this.unsigned);
    };

    /**
     * Returns this Long with bits arithmetically shifted to the right by the given amount. This is an alias of {@link Long#shiftRight}.
     * @function
     * @param {number|!Long} numBits Number of bits
     * @returns {!Long} Shifted Long
     */
    LongPrototype.shr = LongPrototype.shiftRight;

    /**
     * Returns this Long with bits logically shifted to the right by the given amount.
     * @param {number|!Long} numBits Number of bits
     * @returns {!Long} Shifted Long
     */
    LongPrototype.shiftRightUnsigned = function shiftRightUnsigned(numBits) {
      if (isLong(numBits)) numBits = numBits.toInt();
      numBits &= 63;
      if (numBits === 0) return this;else {
        var high = this.high;
        if (numBits < 32) {
          var low = this.low;
          return fromBits(low >>> numBits | high << 32 - numBits, high >>> numBits, this.unsigned);
        } else if (numBits === 32) return fromBits(high, 0, this.unsigned);else return fromBits(high >>> numBits - 32, 0, this.unsigned);
      }
    };

    /**
     * Returns this Long with bits logically shifted to the right by the given amount. This is an alias of {@link Long#shiftRightUnsigned}.
     * @function
     * @param {number|!Long} numBits Number of bits
     * @returns {!Long} Shifted Long
     */
    LongPrototype.shru = LongPrototype.shiftRightUnsigned;

    /**
     * Converts this Long to signed.
     * @returns {!Long} Signed long
     */
    LongPrototype.toSigned = function toSigned() {
      if (!this.unsigned) return this;
      return fromBits(this.low, this.high, false);
    };

    /**
     * Converts this Long to unsigned.
     * @returns {!Long} Unsigned long
     */
    LongPrototype.toUnsigned = function toUnsigned() {
      if (this.unsigned) return this;
      return fromBits(this.low, this.high, true);
    };

    /**
     * Converts this Long to its byte representation.
     * @param {boolean=} le Whether little or big endian, defaults to big endian
     * @returns {!Array.<number>} Byte representation
     */
    LongPrototype.toBytes = function (le) {
      return le ? this.toBytesLE() : this.toBytesBE();
    };

    /**
     * Converts this Long to its little endian byte representation.
     * @returns {!Array.<number>} Little endian byte representation
     */
    LongPrototype.toBytesLE = function () {
      var hi = this.high,
        lo = this.low;
      return [lo & 0xff, lo >>> 8 & 0xff, lo >>> 16 & 0xff, lo >>> 24 & 0xff, hi & 0xff, hi >>> 8 & 0xff, hi >>> 16 & 0xff, hi >>> 24 & 0xff];
    };

    /**
     * Converts this Long to its big endian byte representation.
     * @returns {!Array.<number>} Big endian byte representation
     */
    LongPrototype.toBytesBE = function () {
      var hi = this.high,
        lo = this.low;
      return [hi >>> 24 & 0xff, hi >>> 16 & 0xff, hi >>> 8 & 0xff, hi & 0xff, lo >>> 24 & 0xff, lo >>> 16 & 0xff, lo >>> 8 & 0xff, lo & 0xff];
    };
    return Long;
  });
})(long);
var longExports = long.exports;

/**
 * @license bytebuffer.js (c) 2015 Daniel Wirtz <dcode@dcode.io>
 * Backing buffer / Accessor: node Buffer
 * Released under the Apache License, Version 2.0
 * see: https://github.com/dcodeIO/bytebuffer.js for details
 */
var bytebufferNode = function () {

  var buffer = require$$0,
    Buffer = buffer["Buffer"],
    Long = longExports,
    memcpy = null;
  try {
    memcpy = require("memcpy");
  } catch (e) {}

  /**
   * Constructs a new ByteBuffer.
   * @class The swiss army knife for binary data in JavaScript.
   * @exports ByteBuffer
   * @constructor
   * @param {number=} capacity Initial capacity. Defaults to {@link ByteBuffer.DEFAULT_CAPACITY}.
   * @param {boolean=} littleEndian Whether to use little or big endian byte order. Defaults to
   *  {@link ByteBuffer.DEFAULT_ENDIAN}.
   * @param {boolean=} noAssert Whether to skip assertions of offsets and values. Defaults to
   *  {@link ByteBuffer.DEFAULT_NOASSERT}.
   * @expose
   */
  var ByteBuffer = function ByteBuffer(capacity, littleEndian, noAssert) {
    if (typeof capacity === 'undefined') capacity = ByteBuffer.DEFAULT_CAPACITY;
    if (typeof littleEndian === 'undefined') littleEndian = ByteBuffer.DEFAULT_ENDIAN;
    if (typeof noAssert === 'undefined') noAssert = ByteBuffer.DEFAULT_NOASSERT;
    if (!noAssert) {
      capacity = capacity | 0;
      if (capacity < 0) throw RangeError("Illegal capacity");
      littleEndian = !!littleEndian;
      noAssert = !!noAssert;
    }

    /**
     * Backing node Buffer.
     * @type {!Buffer}
     * @expose
     */
    this.buffer = capacity === 0 ? EMPTY_BUFFER : new Buffer(capacity);

    /**
     * Absolute read/write offset.
     * @type {number}
     * @expose
     * @see ByteBuffer#flip
     * @see ByteBuffer#clear
     */
    this.offset = 0;

    /**
     * Marked offset.
     * @type {number}
     * @expose
     * @see ByteBuffer#mark
     * @see ByteBuffer#reset
     */
    this.markedOffset = -1;

    /**
     * Absolute limit of the contained data. Set to the backing buffer's capacity upon allocation.
     * @type {number}
     * @expose
     * @see ByteBuffer#flip
     * @see ByteBuffer#clear
     */
    this.limit = capacity;

    /**
     * Whether to use little endian byte order, defaults to `false` for big endian.
     * @type {boolean}
     * @expose
     */
    this.littleEndian = littleEndian;

    /**
     * Whether to skip assertions of offsets and values, defaults to `false`.
     * @type {boolean}
     * @expose
     */
    this.noAssert = noAssert;
  };

  /**
   * ByteBuffer version.
   * @type {string}
   * @const
   * @expose
   */
  ByteBuffer.VERSION = "5.0.1";

  /**
   * Little endian constant that can be used instead of its boolean value. Evaluates to `true`.
   * @type {boolean}
   * @const
   * @expose
   */
  ByteBuffer.LITTLE_ENDIAN = true;

  /**
   * Big endian constant that can be used instead of its boolean value. Evaluates to `false`.
   * @type {boolean}
   * @const
   * @expose
   */
  ByteBuffer.BIG_ENDIAN = false;

  /**
   * Default initial capacity of `16`.
   * @type {number}
   * @expose
   */
  ByteBuffer.DEFAULT_CAPACITY = 16;

  /**
   * Default endianess of `false` for big endian.
   * @type {boolean}
   * @expose
   */
  ByteBuffer.DEFAULT_ENDIAN = ByteBuffer.BIG_ENDIAN;

  /**
   * Default no assertions flag of `false`.
   * @type {boolean}
   * @expose
   */
  ByteBuffer.DEFAULT_NOASSERT = false;

  /**
   * A `Long` class for representing a 64-bit two's-complement integer value.
   * @type {!Long}
   * @const
   * @see https://npmjs.org/package/long
   * @expose
   */
  ByteBuffer.Long = Long;

  /**
   * @alias ByteBuffer.prototype
   * @inner
   */
  var ByteBufferPrototype = ByteBuffer.prototype;

  /**
   * An indicator used to reliably determine if an object is a ByteBuffer or not.
   * @type {boolean}
   * @const
   * @expose
   * @private
   */
  ByteBufferPrototype.__isByteBuffer__;
  Object.defineProperty(ByteBufferPrototype, "__isByteBuffer__", {
    value: true,
    enumerable: false,
    configurable: false
  });

  // helpers

  /**
   * @type {!Buffer}
   * @inner
   */
  var EMPTY_BUFFER = new Buffer(0);

  /**
   * String.fromCharCode reference for compile-time renaming.
   * @type {function(...number):string}
   * @inner
   */
  var stringFromCharCode = String.fromCharCode;

  /**
   * Creates a source function for a string.
   * @param {string} s String to read from
   * @returns {function():number|null} Source function returning the next char code respectively `null` if there are
   *  no more characters left.
   * @throws {TypeError} If the argument is invalid
   * @inner
   */
  function stringSource(s) {
    var i = 0;
    return function () {
      return i < s.length ? s.charCodeAt(i++) : null;
    };
  }

  /**
   * Creates a destination function for a string.
   * @returns {function(number=):undefined|string} Destination function successively called with the next char code.
   *  Returns the final string when called without arguments.
   * @inner
   */
  function stringDestination() {
    var cs = [],
      ps = [];
    return function () {
      if (arguments.length === 0) return ps.join('') + stringFromCharCode.apply(String, cs);
      if (cs.length + arguments.length > 1024) ps.push(stringFromCharCode.apply(String, cs)), cs.length = 0;
      Array.prototype.push.apply(cs, arguments);
    };
  }

  /**
   * Gets the accessor type.
   * @returns {Function} `Buffer` under node.js, `Uint8Array` respectively `DataView` in the browser (classes)
   * @expose
   */
  ByteBuffer.accessor = function () {
    return Buffer;
  };
  /**
   * Allocates a new ByteBuffer backed by a buffer of the specified capacity.
   * @param {number=} capacity Initial capacity. Defaults to {@link ByteBuffer.DEFAULT_CAPACITY}.
   * @param {boolean=} littleEndian Whether to use little or big endian byte order. Defaults to
   *  {@link ByteBuffer.DEFAULT_ENDIAN}.
   * @param {boolean=} noAssert Whether to skip assertions of offsets and values. Defaults to
   *  {@link ByteBuffer.DEFAULT_NOASSERT}.
   * @returns {!ByteBuffer}
   * @expose
   */
  ByteBuffer.allocate = function (capacity, littleEndian, noAssert) {
    return new ByteBuffer(capacity, littleEndian, noAssert);
  };

  /**
   * Concatenates multiple ByteBuffers into one.
   * @param {!Array.<!ByteBuffer|!Buffer|!ArrayBuffer|!Uint8Array|string>} buffers Buffers to concatenate
   * @param {(string|boolean)=} encoding String encoding if `buffers` contains a string ("base64", "hex", "binary",
   *  defaults to "utf8")
   * @param {boolean=} littleEndian Whether to use little or big endian byte order for the resulting ByteBuffer. Defaults
   *  to {@link ByteBuffer.DEFAULT_ENDIAN}.
   * @param {boolean=} noAssert Whether to skip assertions of offsets and values for the resulting ByteBuffer. Defaults to
   *  {@link ByteBuffer.DEFAULT_NOASSERT}.
   * @returns {!ByteBuffer} Concatenated ByteBuffer
   * @expose
   */
  ByteBuffer.concat = function (buffers, encoding, littleEndian, noAssert) {
    if (typeof encoding === 'boolean' || typeof encoding !== 'string') {
      noAssert = littleEndian;
      littleEndian = encoding;
      encoding = undefined;
    }
    var capacity = 0;
    for (var i = 0, k = buffers.length, length; i < k; ++i) {
      if (!ByteBuffer.isByteBuffer(buffers[i])) buffers[i] = ByteBuffer.wrap(buffers[i], encoding);
      length = buffers[i].limit - buffers[i].offset;
      if (length > 0) capacity += length;
    }
    if (capacity === 0) return new ByteBuffer(0, littleEndian, noAssert);
    var bb = new ByteBuffer(capacity, littleEndian, noAssert),
      bi;
    i = 0;
    while (i < k) {
      bi = buffers[i++];
      length = bi.limit - bi.offset;
      if (length <= 0) continue;
      bi.buffer.copy(bb.buffer, bb.offset, bi.offset, bi.limit);
      bb.offset += length;
    }
    bb.limit = bb.offset;
    bb.offset = 0;
    return bb;
  };

  /**
   * Tests if the specified type is a ByteBuffer.
   * @param {*} bb ByteBuffer to test
   * @returns {boolean} `true` if it is a ByteBuffer, otherwise `false`
   * @expose
   */
  ByteBuffer.isByteBuffer = function (bb) {
    return (bb && bb["__isByteBuffer__"]) === true;
  };
  /**
   * Gets the backing buffer type.
   * @returns {Function} `Buffer` under node.js, `ArrayBuffer` in the browser (classes)
   * @expose
   */
  ByteBuffer.type = function () {
    return Buffer;
  };
  /**
   * Wraps a buffer or a string. Sets the allocated ByteBuffer's {@link ByteBuffer#offset} to `0` and its
   *  {@link ByteBuffer#limit} to the length of the wrapped data.
   * @param {!ByteBuffer|!Buffer|!ArrayBuffer|!Uint8Array|string|!Array.<number>} buffer Anything that can be wrapped
   * @param {(string|boolean)=} encoding String encoding if `buffer` is a string ("base64", "hex", "binary", defaults to
   *  "utf8")
   * @param {boolean=} littleEndian Whether to use little or big endian byte order. Defaults to
   *  {@link ByteBuffer.DEFAULT_ENDIAN}.
   * @param {boolean=} noAssert Whether to skip assertions of offsets and values. Defaults to
   *  {@link ByteBuffer.DEFAULT_NOASSERT}.
   * @returns {!ByteBuffer} A ByteBuffer wrapping `buffer`
   * @expose
   */
  ByteBuffer.wrap = function (buffer, encoding, littleEndian, noAssert) {
    if (typeof encoding !== 'string') {
      noAssert = littleEndian;
      littleEndian = encoding;
      encoding = undefined;
    }
    if (typeof buffer === 'string') {
      if (typeof encoding === 'undefined') encoding = "utf8";
      switch (encoding) {
        case "base64":
          return ByteBuffer.fromBase64(buffer, littleEndian);
        case "hex":
          return ByteBuffer.fromHex(buffer, littleEndian);
        case "binary":
          return ByteBuffer.fromBinary(buffer, littleEndian);
        case "utf8":
          return ByteBuffer.fromUTF8(buffer, littleEndian);
        case "debug":
          return ByteBuffer.fromDebug(buffer, littleEndian);
        default:
          throw Error("Unsupported encoding: " + encoding);
      }
    }
    if (buffer === null || _typeof(buffer) !== 'object') throw TypeError("Illegal buffer");
    var bb;
    if (ByteBuffer.isByteBuffer(buffer)) {
      bb = ByteBufferPrototype.clone.call(buffer);
      bb.markedOffset = -1;
      return bb;
    }
    var i = 0,
      k = 0,
      b;
    if (buffer instanceof Uint8Array) {
      // Extract bytes from Uint8Array
      b = new Buffer(buffer.length);
      if (memcpy) {
        // Fast
        memcpy(b, 0, buffer.buffer, buffer.byteOffset, buffer.byteOffset + buffer.length);
      } else {
        // Slow
        for (i = 0, k = buffer.length; i < k; ++i) b[i] = buffer[i];
      }
      buffer = b;
    } else if (buffer instanceof ArrayBuffer) {
      // Convert ArrayBuffer to Buffer
      b = new Buffer(buffer.byteLength);
      if (memcpy) {
        // Fast
        memcpy(b, 0, buffer, 0, buffer.byteLength);
      } else {
        // Slow
        buffer = new Uint8Array(buffer);
        for (i = 0, k = buffer.length; i < k; ++i) {
          b[i] = buffer[i];
        }
      }
      buffer = b;
    } else if (!(buffer instanceof Buffer)) {
      // Create from octets if it is an error, otherwise fail
      if (Object.prototype.toString.call(buffer) !== "[object Array]") throw TypeError("Illegal buffer");
      buffer = new Buffer(buffer);
    }
    bb = new ByteBuffer(0, littleEndian, noAssert);
    if (buffer.length > 0) {
      // Avoid references to more than one EMPTY_BUFFER
      bb.buffer = buffer;
      bb.limit = buffer.length;
    }
    return bb;
  };

  /**
   * Writes the array as a bitset.
   * @param {Array<boolean>} value Array of booleans to write
   * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by `length` if omitted.
   * @returns {!ByteBuffer}
   * @expose
   */
  ByteBufferPrototype.writeBitSet = function (value, offset) {
    var relative = typeof offset === 'undefined';
    if (relative) offset = this.offset;
    if (!this.noAssert) {
      if (!(value instanceof Array)) throw TypeError("Illegal BitSet: Not an array");
      if (typeof offset !== 'number' || offset % 1 !== 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
      offset >>>= 0;
      if (offset < 0 || offset + 0 > this.buffer.length) throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 0 + ") <= " + this.buffer.length);
    }
    var start = offset,
      bits = value.length,
      bytes = bits >> 3,
      bit = 0,
      k;
    offset += this.writeVarint32(bits, offset);
    while (bytes--) {
      k = !!value[bit++] & 1 | (!!value[bit++] & 1) << 1 | (!!value[bit++] & 1) << 2 | (!!value[bit++] & 1) << 3 | (!!value[bit++] & 1) << 4 | (!!value[bit++] & 1) << 5 | (!!value[bit++] & 1) << 6 | (!!value[bit++] & 1) << 7;
      this.writeByte(k, offset++);
    }
    if (bit < bits) {
      var m = 0;
      k = 0;
      while (bit < bits) k = k | (!!value[bit++] & 1) << m++;
      this.writeByte(k, offset++);
    }
    if (relative) {
      this.offset = offset;
      return this;
    }
    return offset - start;
  };

  /**
   * Reads a BitSet as an array of booleans.
   * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by `length` if omitted.
   * @returns {Array<boolean>
   * @expose
   */
  ByteBufferPrototype.readBitSet = function (offset) {
    var relative = typeof offset === 'undefined';
    if (relative) offset = this.offset;
    var ret = this.readVarint32(offset),
      bits = ret.value,
      bytes = bits >> 3,
      bit = 0,
      value = [],
      k;
    offset += ret.length;
    while (bytes--) {
      k = this.readByte(offset++);
      value[bit++] = !!(k & 0x01);
      value[bit++] = !!(k & 0x02);
      value[bit++] = !!(k & 0x04);
      value[bit++] = !!(k & 0x08);
      value[bit++] = !!(k & 0x10);
      value[bit++] = !!(k & 0x20);
      value[bit++] = !!(k & 0x40);
      value[bit++] = !!(k & 0x80);
    }
    if (bit < bits) {
      var m = 0;
      k = this.readByte(offset++);
      while (bit < bits) value[bit++] = !!(k >> m++ & 1);
    }
    if (relative) {
      this.offset = offset;
    }
    return value;
  };
  /**
   * Reads the specified number of bytes.
   * @param {number} length Number of bytes to read
   * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by `length` if omitted.
   * @returns {!ByteBuffer}
   * @expose
   */
  ByteBufferPrototype.readBytes = function (length, offset) {
    var relative = typeof offset === 'undefined';
    if (relative) offset = this.offset;
    if (!this.noAssert) {
      if (typeof offset !== 'number' || offset % 1 !== 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
      offset >>>= 0;
      if (offset < 0 || offset + length > this.buffer.length) throw RangeError("Illegal offset: 0 <= " + offset + " (+" + length + ") <= " + this.buffer.length);
    }
    var slice = this.slice(offset, offset + length);
    if (relative) this.offset += length;
    return slice;
  };

  /**
   * Writes a payload of bytes. This is an alias of {@link ByteBuffer#append}.
   * @function
   * @param {!ByteBuffer|!Buffer|!ArrayBuffer|!Uint8Array|string} source Data to write. If `source` is a ByteBuffer, its
   * offsets will be modified according to the performed read operation.
   * @param {(string|number)=} encoding Encoding if `data` is a string ("base64", "hex", "binary", defaults to "utf8")
   * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by the number of bytes
   *  written if omitted.
   * @returns {!ByteBuffer} this
   * @expose
   */
  ByteBufferPrototype.writeBytes = ByteBufferPrototype.append;

  // types/ints/int8

  /**
   * Writes an 8bit signed integer.
   * @param {number} value Value to write
   * @param {number=} offset Offset to write to. Will use and advance {@link ByteBuffer#offset} by `1` if omitted.
   * @returns {!ByteBuffer} this
   * @expose
   */
  ByteBufferPrototype.writeInt8 = function (value, offset) {
    var relative = typeof offset === 'undefined';
    if (relative) offset = this.offset;
    if (!this.noAssert) {
      if (typeof value !== 'number' || value % 1 !== 0) throw TypeError("Illegal value: " + value + " (not an integer)");
      value |= 0;
      if (typeof offset !== 'number' || offset % 1 !== 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
      offset >>>= 0;
      if (offset < 0 || offset + 0 > this.buffer.length) throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 0 + ") <= " + this.buffer.length);
    }
    offset += 1;
    var capacity0 = this.buffer.length;
    if (offset > capacity0) this.resize((capacity0 *= 2) > offset ? capacity0 : offset);
    offset -= 1;
    this.buffer[offset] = value;
    if (relative) this.offset += 1;
    return this;
  };

  /**
   * Writes an 8bit signed integer. This is an alias of {@link ByteBuffer#writeInt8}.
   * @function
   * @param {number} value Value to write
   * @param {number=} offset Offset to write to. Will use and advance {@link ByteBuffer#offset} by `1` if omitted.
   * @returns {!ByteBuffer} this
   * @expose
   */
  ByteBufferPrototype.writeByte = ByteBufferPrototype.writeInt8;

  /**
   * Reads an 8bit signed integer.
   * @param {number=} offset Offset to read from. Will use and advance {@link ByteBuffer#offset} by `1` if omitted.
   * @returns {number} Value read
   * @expose
   */
  ByteBufferPrototype.readInt8 = function (offset) {
    var relative = typeof offset === 'undefined';
    if (relative) offset = this.offset;
    if (!this.noAssert) {
      if (typeof offset !== 'number' || offset % 1 !== 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
      offset >>>= 0;
      if (offset < 0 || offset + 1 > this.buffer.length) throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 1 + ") <= " + this.buffer.length);
    }
    var value = this.buffer[offset];
    if ((value & 0x80) === 0x80) value = -(0xFF - value + 1); // Cast to signed
    if (relative) this.offset += 1;
    return value;
  };

  /**
   * Reads an 8bit signed integer. This is an alias of {@link ByteBuffer#readInt8}.
   * @function
   * @param {number=} offset Offset to read from. Will use and advance {@link ByteBuffer#offset} by `1` if omitted.
   * @returns {number} Value read
   * @expose
   */
  ByteBufferPrototype.readByte = ByteBufferPrototype.readInt8;

  /**
   * Writes an 8bit unsigned integer.
   * @param {number} value Value to write
   * @param {number=} offset Offset to write to. Will use and advance {@link ByteBuffer#offset} by `1` if omitted.
   * @returns {!ByteBuffer} this
   * @expose
   */
  ByteBufferPrototype.writeUint8 = function (value, offset) {
    var relative = typeof offset === 'undefined';
    if (relative) offset = this.offset;
    if (!this.noAssert) {
      if (typeof value !== 'number' || value % 1 !== 0) throw TypeError("Illegal value: " + value + " (not an integer)");
      value >>>= 0;
      if (typeof offset !== 'number' || offset % 1 !== 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
      offset >>>= 0;
      if (offset < 0 || offset + 0 > this.buffer.length) throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 0 + ") <= " + this.buffer.length);
    }
    offset += 1;
    var capacity1 = this.buffer.length;
    if (offset > capacity1) this.resize((capacity1 *= 2) > offset ? capacity1 : offset);
    offset -= 1;
    this.buffer[offset] = value;
    if (relative) this.offset += 1;
    return this;
  };

  /**
   * Writes an 8bit unsigned integer. This is an alias of {@link ByteBuffer#writeUint8}.
   * @function
   * @param {number} value Value to write
   * @param {number=} offset Offset to write to. Will use and advance {@link ByteBuffer#offset} by `1` if omitted.
   * @returns {!ByteBuffer} this
   * @expose
   */
  ByteBufferPrototype.writeUInt8 = ByteBufferPrototype.writeUint8;

  /**
   * Reads an 8bit unsigned integer.
   * @param {number=} offset Offset to read from. Will use and advance {@link ByteBuffer#offset} by `1` if omitted.
   * @returns {number} Value read
   * @expose
   */
  ByteBufferPrototype.readUint8 = function (offset) {
    var relative = typeof offset === 'undefined';
    if (relative) offset = this.offset;
    if (!this.noAssert) {
      if (typeof offset !== 'number' || offset % 1 !== 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
      offset >>>= 0;
      if (offset < 0 || offset + 1 > this.buffer.length) throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 1 + ") <= " + this.buffer.length);
    }
    var value = this.buffer[offset];
    if (relative) this.offset += 1;
    return value;
  };

  /**
   * Reads an 8bit unsigned integer. This is an alias of {@link ByteBuffer#readUint8}.
   * @function
   * @param {number=} offset Offset to read from. Will use and advance {@link ByteBuffer#offset} by `1` if omitted.
   * @returns {number} Value read
   * @expose
   */
  ByteBufferPrototype.readUInt8 = ByteBufferPrototype.readUint8;

  // types/ints/int16

  /**
   * Writes a 16bit signed integer.
   * @param {number} value Value to write
   * @param {number=} offset Offset to write to. Will use and advance {@link ByteBuffer#offset} by `2` if omitted.
   * @throws {TypeError} If `offset` or `value` is not a valid number
   * @throws {RangeError} If `offset` is out of bounds
   * @expose
   */
  ByteBufferPrototype.writeInt16 = function (value, offset) {
    var relative = typeof offset === 'undefined';
    if (relative) offset = this.offset;
    if (!this.noAssert) {
      if (typeof value !== 'number' || value % 1 !== 0) throw TypeError("Illegal value: " + value + " (not an integer)");
      value |= 0;
      if (typeof offset !== 'number' || offset % 1 !== 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
      offset >>>= 0;
      if (offset < 0 || offset + 0 > this.buffer.length) throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 0 + ") <= " + this.buffer.length);
    }
    offset += 2;
    var capacity2 = this.buffer.length;
    if (offset > capacity2) this.resize((capacity2 *= 2) > offset ? capacity2 : offset);
    offset -= 2;
    if (this.littleEndian) {
      this.buffer[offset + 1] = (value & 0xFF00) >>> 8;
      this.buffer[offset] = value & 0x00FF;
    } else {
      this.buffer[offset] = (value & 0xFF00) >>> 8;
      this.buffer[offset + 1] = value & 0x00FF;
    }
    if (relative) this.offset += 2;
    return this;
  };

  /**
   * Writes a 16bit signed integer. This is an alias of {@link ByteBuffer#writeInt16}.
   * @function
   * @param {number} value Value to write
   * @param {number=} offset Offset to write to. Will use and advance {@link ByteBuffer#offset} by `2` if omitted.
   * @throws {TypeError} If `offset` or `value` is not a valid number
   * @throws {RangeError} If `offset` is out of bounds
   * @expose
   */
  ByteBufferPrototype.writeShort = ByteBufferPrototype.writeInt16;

  /**
   * Reads a 16bit signed integer.
   * @param {number=} offset Offset to read from. Will use and advance {@link ByteBuffer#offset} by `2` if omitted.
   * @returns {number} Value read
   * @throws {TypeError} If `offset` is not a valid number
   * @throws {RangeError} If `offset` is out of bounds
   * @expose
   */
  ByteBufferPrototype.readInt16 = function (offset) {
    var relative = typeof offset === 'undefined';
    if (relative) offset = this.offset;
    if (!this.noAssert) {
      if (typeof offset !== 'number' || offset % 1 !== 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
      offset >>>= 0;
      if (offset < 0 || offset + 2 > this.buffer.length) throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 2 + ") <= " + this.buffer.length);
    }
    var value = 0;
    if (this.littleEndian) {
      value = this.buffer[offset];
      value |= this.buffer[offset + 1] << 8;
    } else {
      value = this.buffer[offset] << 8;
      value |= this.buffer[offset + 1];
    }
    if ((value & 0x8000) === 0x8000) value = -(0xFFFF - value + 1); // Cast to signed
    if (relative) this.offset += 2;
    return value;
  };

  /**
   * Reads a 16bit signed integer. This is an alias of {@link ByteBuffer#readInt16}.
   * @function
   * @param {number=} offset Offset to read from. Will use and advance {@link ByteBuffer#offset} by `2` if omitted.
   * @returns {number} Value read
   * @throws {TypeError} If `offset` is not a valid number
   * @throws {RangeError} If `offset` is out of bounds
   * @expose
   */
  ByteBufferPrototype.readShort = ByteBufferPrototype.readInt16;

  /**
   * Writes a 16bit unsigned integer.
   * @param {number} value Value to write
   * @param {number=} offset Offset to write to. Will use and advance {@link ByteBuffer#offset} by `2` if omitted.
   * @throws {TypeError} If `offset` or `value` is not a valid number
   * @throws {RangeError} If `offset` is out of bounds
   * @expose
   */
  ByteBufferPrototype.writeUint16 = function (value, offset) {
    var relative = typeof offset === 'undefined';
    if (relative) offset = this.offset;
    if (!this.noAssert) {
      if (typeof value !== 'number' || value % 1 !== 0) throw TypeError("Illegal value: " + value + " (not an integer)");
      value >>>= 0;
      if (typeof offset !== 'number' || offset % 1 !== 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
      offset >>>= 0;
      if (offset < 0 || offset + 0 > this.buffer.length) throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 0 + ") <= " + this.buffer.length);
    }
    offset += 2;
    var capacity3 = this.buffer.length;
    if (offset > capacity3) this.resize((capacity3 *= 2) > offset ? capacity3 : offset);
    offset -= 2;
    if (this.littleEndian) {
      this.buffer[offset + 1] = (value & 0xFF00) >>> 8;
      this.buffer[offset] = value & 0x00FF;
    } else {
      this.buffer[offset] = (value & 0xFF00) >>> 8;
      this.buffer[offset + 1] = value & 0x00FF;
    }
    if (relative) this.offset += 2;
    return this;
  };

  /**
   * Writes a 16bit unsigned integer. This is an alias of {@link ByteBuffer#writeUint16}.
   * @function
   * @param {number} value Value to write
   * @param {number=} offset Offset to write to. Will use and advance {@link ByteBuffer#offset} by `2` if omitted.
   * @throws {TypeError} If `offset` or `value` is not a valid number
   * @throws {RangeError} If `offset` is out of bounds
   * @expose
   */
  ByteBufferPrototype.writeUInt16 = ByteBufferPrototype.writeUint16;

  /**
   * Reads a 16bit unsigned integer.
   * @param {number=} offset Offset to read from. Will use and advance {@link ByteBuffer#offset} by `2` if omitted.
   * @returns {number} Value read
   * @throws {TypeError} If `offset` is not a valid number
   * @throws {RangeError} If `offset` is out of bounds
   * @expose
   */
  ByteBufferPrototype.readUint16 = function (offset) {
    var relative = typeof offset === 'undefined';
    if (relative) offset = this.offset;
    if (!this.noAssert) {
      if (typeof offset !== 'number' || offset % 1 !== 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
      offset >>>= 0;
      if (offset < 0 || offset + 2 > this.buffer.length) throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 2 + ") <= " + this.buffer.length);
    }
    var value = 0;
    if (this.littleEndian) {
      value = this.buffer[offset];
      value |= this.buffer[offset + 1] << 8;
    } else {
      value = this.buffer[offset] << 8;
      value |= this.buffer[offset + 1];
    }
    if (relative) this.offset += 2;
    return value;
  };

  /**
   * Reads a 16bit unsigned integer. This is an alias of {@link ByteBuffer#readUint16}.
   * @function
   * @param {number=} offset Offset to read from. Will use and advance {@link ByteBuffer#offset} by `2` if omitted.
   * @returns {number} Value read
   * @throws {TypeError} If `offset` is not a valid number
   * @throws {RangeError} If `offset` is out of bounds
   * @expose
   */
  ByteBufferPrototype.readUInt16 = ByteBufferPrototype.readUint16;

  // types/ints/int32

  /**
   * Writes a 32bit signed integer.
   * @param {number} value Value to write
   * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by `4` if omitted.
   * @expose
   */
  ByteBufferPrototype.writeInt32 = function (value, offset) {
    var relative = typeof offset === 'undefined';
    if (relative) offset = this.offset;
    if (!this.noAssert) {
      if (typeof value !== 'number' || value % 1 !== 0) throw TypeError("Illegal value: " + value + " (not an integer)");
      value |= 0;
      if (typeof offset !== 'number' || offset % 1 !== 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
      offset >>>= 0;
      if (offset < 0 || offset + 0 > this.buffer.length) throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 0 + ") <= " + this.buffer.length);
    }
    offset += 4;
    var capacity4 = this.buffer.length;
    if (offset > capacity4) this.resize((capacity4 *= 2) > offset ? capacity4 : offset);
    offset -= 4;
    if (this.littleEndian) {
      this.buffer[offset + 3] = value >>> 24 & 0xFF;
      this.buffer[offset + 2] = value >>> 16 & 0xFF;
      this.buffer[offset + 1] = value >>> 8 & 0xFF;
      this.buffer[offset] = value & 0xFF;
    } else {
      this.buffer[offset] = value >>> 24 & 0xFF;
      this.buffer[offset + 1] = value >>> 16 & 0xFF;
      this.buffer[offset + 2] = value >>> 8 & 0xFF;
      this.buffer[offset + 3] = value & 0xFF;
    }
    if (relative) this.offset += 4;
    return this;
  };

  /**
   * Writes a 32bit signed integer. This is an alias of {@link ByteBuffer#writeInt32}.
   * @param {number} value Value to write
   * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by `4` if omitted.
   * @expose
   */
  ByteBufferPrototype.writeInt = ByteBufferPrototype.writeInt32;

  /**
   * Reads a 32bit signed integer.
   * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by `4` if omitted.
   * @returns {number} Value read
   * @expose
   */
  ByteBufferPrototype.readInt32 = function (offset) {
    var relative = typeof offset === 'undefined';
    if (relative) offset = this.offset;
    if (!this.noAssert) {
      if (typeof offset !== 'number' || offset % 1 !== 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
      offset >>>= 0;
      if (offset < 0 || offset + 4 > this.buffer.length) throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 4 + ") <= " + this.buffer.length);
    }
    var value = 0;
    if (this.littleEndian) {
      value = this.buffer[offset + 2] << 16;
      value |= this.buffer[offset + 1] << 8;
      value |= this.buffer[offset];
      value += this.buffer[offset + 3] << 24 >>> 0;
    } else {
      value = this.buffer[offset + 1] << 16;
      value |= this.buffer[offset + 2] << 8;
      value |= this.buffer[offset + 3];
      value += this.buffer[offset] << 24 >>> 0;
    }
    value |= 0; // Cast to signed
    if (relative) this.offset += 4;
    return value;
  };

  /**
   * Reads a 32bit signed integer. This is an alias of {@link ByteBuffer#readInt32}.
   * @param {number=} offset Offset to read from. Will use and advance {@link ByteBuffer#offset} by `4` if omitted.
   * @returns {number} Value read
   * @expose
   */
  ByteBufferPrototype.readInt = ByteBufferPrototype.readInt32;

  /**
   * Writes a 32bit unsigned integer.
   * @param {number} value Value to write
   * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by `4` if omitted.
   * @expose
   */
  ByteBufferPrototype.writeUint32 = function (value, offset) {
    var relative = typeof offset === 'undefined';
    if (relative) offset = this.offset;
    if (!this.noAssert) {
      if (typeof value !== 'number' || value % 1 !== 0) throw TypeError("Illegal value: " + value + " (not an integer)");
      value >>>= 0;
      if (typeof offset !== 'number' || offset % 1 !== 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
      offset >>>= 0;
      if (offset < 0 || offset + 0 > this.buffer.length) throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 0 + ") <= " + this.buffer.length);
    }
    offset += 4;
    var capacity5 = this.buffer.length;
    if (offset > capacity5) this.resize((capacity5 *= 2) > offset ? capacity5 : offset);
    offset -= 4;
    if (this.littleEndian) {
      this.buffer[offset + 3] = value >>> 24 & 0xFF;
      this.buffer[offset + 2] = value >>> 16 & 0xFF;
      this.buffer[offset + 1] = value >>> 8 & 0xFF;
      this.buffer[offset] = value & 0xFF;
    } else {
      this.buffer[offset] = value >>> 24 & 0xFF;
      this.buffer[offset + 1] = value >>> 16 & 0xFF;
      this.buffer[offset + 2] = value >>> 8 & 0xFF;
      this.buffer[offset + 3] = value & 0xFF;
    }
    if (relative) this.offset += 4;
    return this;
  };

  /**
   * Writes a 32bit unsigned integer. This is an alias of {@link ByteBuffer#writeUint32}.
   * @function
   * @param {number} value Value to write
   * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by `4` if omitted.
   * @expose
   */
  ByteBufferPrototype.writeUInt32 = ByteBufferPrototype.writeUint32;

  /**
   * Reads a 32bit unsigned integer.
   * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by `4` if omitted.
   * @returns {number} Value read
   * @expose
   */
  ByteBufferPrototype.readUint32 = function (offset) {
    var relative = typeof offset === 'undefined';
    if (relative) offset = this.offset;
    if (!this.noAssert) {
      if (typeof offset !== 'number' || offset % 1 !== 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
      offset >>>= 0;
      if (offset < 0 || offset + 4 > this.buffer.length) throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 4 + ") <= " + this.buffer.length);
    }
    var value = 0;
    if (this.littleEndian) {
      value = this.buffer[offset + 2] << 16;
      value |= this.buffer[offset + 1] << 8;
      value |= this.buffer[offset];
      value += this.buffer[offset + 3] << 24 >>> 0;
    } else {
      value = this.buffer[offset + 1] << 16;
      value |= this.buffer[offset + 2] << 8;
      value |= this.buffer[offset + 3];
      value += this.buffer[offset] << 24 >>> 0;
    }
    if (relative) this.offset += 4;
    return value;
  };

  /**
   * Reads a 32bit unsigned integer. This is an alias of {@link ByteBuffer#readUint32}.
   * @function
   * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by `4` if omitted.
   * @returns {number} Value read
   * @expose
   */
  ByteBufferPrototype.readUInt32 = ByteBufferPrototype.readUint32;

  // types/ints/int64

  if (Long) {
    /**
     * Writes a 64bit signed integer.
     * @param {number|!Long} value Value to write
     * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by `8` if omitted.
     * @returns {!ByteBuffer} this
     * @expose
     */
    ByteBufferPrototype.writeInt64 = function (value, offset) {
      var relative = typeof offset === 'undefined';
      if (relative) offset = this.offset;
      if (!this.noAssert) {
        if (typeof value === 'number') value = Long.fromNumber(value);else if (typeof value === 'string') value = Long.fromString(value);else if (!(value && value instanceof Long)) throw TypeError("Illegal value: " + value + " (not an integer or Long)");
        if (typeof offset !== 'number' || offset % 1 !== 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
        offset >>>= 0;
        if (offset < 0 || offset + 0 > this.buffer.length) throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 0 + ") <= " + this.buffer.length);
      }
      if (typeof value === 'number') value = Long.fromNumber(value);else if (typeof value === 'string') value = Long.fromString(value);
      offset += 8;
      var capacity6 = this.buffer.length;
      if (offset > capacity6) this.resize((capacity6 *= 2) > offset ? capacity6 : offset);
      offset -= 8;
      var lo = value.low,
        hi = value.high;
      if (this.littleEndian) {
        this.buffer[offset + 3] = lo >>> 24 & 0xFF;
        this.buffer[offset + 2] = lo >>> 16 & 0xFF;
        this.buffer[offset + 1] = lo >>> 8 & 0xFF;
        this.buffer[offset] = lo & 0xFF;
        offset += 4;
        this.buffer[offset + 3] = hi >>> 24 & 0xFF;
        this.buffer[offset + 2] = hi >>> 16 & 0xFF;
        this.buffer[offset + 1] = hi >>> 8 & 0xFF;
        this.buffer[offset] = hi & 0xFF;
      } else {
        this.buffer[offset] = hi >>> 24 & 0xFF;
        this.buffer[offset + 1] = hi >>> 16 & 0xFF;
        this.buffer[offset + 2] = hi >>> 8 & 0xFF;
        this.buffer[offset + 3] = hi & 0xFF;
        offset += 4;
        this.buffer[offset] = lo >>> 24 & 0xFF;
        this.buffer[offset + 1] = lo >>> 16 & 0xFF;
        this.buffer[offset + 2] = lo >>> 8 & 0xFF;
        this.buffer[offset + 3] = lo & 0xFF;
      }
      if (relative) this.offset += 8;
      return this;
    };

    /**
     * Writes a 64bit signed integer. This is an alias of {@link ByteBuffer#writeInt64}.
     * @param {number|!Long} value Value to write
     * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by `8` if omitted.
     * @returns {!ByteBuffer} this
     * @expose
     */
    ByteBufferPrototype.writeLong = ByteBufferPrototype.writeInt64;

    /**
     * Reads a 64bit signed integer.
     * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by `8` if omitted.
     * @returns {!Long}
     * @expose
     */
    ByteBufferPrototype.readInt64 = function (offset) {
      var relative = typeof offset === 'undefined';
      if (relative) offset = this.offset;
      if (!this.noAssert) {
        if (typeof offset !== 'number' || offset % 1 !== 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
        offset >>>= 0;
        if (offset < 0 || offset + 8 > this.buffer.length) throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 8 + ") <= " + this.buffer.length);
      }
      var lo = 0,
        hi = 0;
      if (this.littleEndian) {
        lo = this.buffer[offset + 2] << 16;
        lo |= this.buffer[offset + 1] << 8;
        lo |= this.buffer[offset];
        lo += this.buffer[offset + 3] << 24 >>> 0;
        offset += 4;
        hi = this.buffer[offset + 2] << 16;
        hi |= this.buffer[offset + 1] << 8;
        hi |= this.buffer[offset];
        hi += this.buffer[offset + 3] << 24 >>> 0;
      } else {
        hi = this.buffer[offset + 1] << 16;
        hi |= this.buffer[offset + 2] << 8;
        hi |= this.buffer[offset + 3];
        hi += this.buffer[offset] << 24 >>> 0;
        offset += 4;
        lo = this.buffer[offset + 1] << 16;
        lo |= this.buffer[offset + 2] << 8;
        lo |= this.buffer[offset + 3];
        lo += this.buffer[offset] << 24 >>> 0;
      }
      var value = new Long(lo, hi, false);
      if (relative) this.offset += 8;
      return value;
    };

    /**
     * Reads a 64bit signed integer. This is an alias of {@link ByteBuffer#readInt64}.
     * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by `8` if omitted.
     * @returns {!Long}
     * @expose
     */
    ByteBufferPrototype.readLong = ByteBufferPrototype.readInt64;

    /**
     * Writes a 64bit unsigned integer.
     * @param {number|!Long} value Value to write
     * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by `8` if omitted.
     * @returns {!ByteBuffer} this
     * @expose
     */
    ByteBufferPrototype.writeUint64 = function (value, offset) {
      var relative = typeof offset === 'undefined';
      if (relative) offset = this.offset;
      if (!this.noAssert) {
        if (typeof value === 'number') value = Long.fromNumber(value);else if (typeof value === 'string') value = Long.fromString(value);else if (!(value && value instanceof Long)) throw TypeError("Illegal value: " + value + " (not an integer or Long)");
        if (typeof offset !== 'number' || offset % 1 !== 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
        offset >>>= 0;
        if (offset < 0 || offset + 0 > this.buffer.length) throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 0 + ") <= " + this.buffer.length);
      }
      if (typeof value === 'number') value = Long.fromNumber(value);else if (typeof value === 'string') value = Long.fromString(value);
      offset += 8;
      var capacity7 = this.buffer.length;
      if (offset > capacity7) this.resize((capacity7 *= 2) > offset ? capacity7 : offset);
      offset -= 8;
      var lo = value.low,
        hi = value.high;
      if (this.littleEndian) {
        this.buffer[offset + 3] = lo >>> 24 & 0xFF;
        this.buffer[offset + 2] = lo >>> 16 & 0xFF;
        this.buffer[offset + 1] = lo >>> 8 & 0xFF;
        this.buffer[offset] = lo & 0xFF;
        offset += 4;
        this.buffer[offset + 3] = hi >>> 24 & 0xFF;
        this.buffer[offset + 2] = hi >>> 16 & 0xFF;
        this.buffer[offset + 1] = hi >>> 8 & 0xFF;
        this.buffer[offset] = hi & 0xFF;
      } else {
        this.buffer[offset] = hi >>> 24 & 0xFF;
        this.buffer[offset + 1] = hi >>> 16 & 0xFF;
        this.buffer[offset + 2] = hi >>> 8 & 0xFF;
        this.buffer[offset + 3] = hi & 0xFF;
        offset += 4;
        this.buffer[offset] = lo >>> 24 & 0xFF;
        this.buffer[offset + 1] = lo >>> 16 & 0xFF;
        this.buffer[offset + 2] = lo >>> 8 & 0xFF;
        this.buffer[offset + 3] = lo & 0xFF;
      }
      if (relative) this.offset += 8;
      return this;
    };

    /**
     * Writes a 64bit unsigned integer. This is an alias of {@link ByteBuffer#writeUint64}.
     * @function
     * @param {number|!Long} value Value to write
     * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by `8` if omitted.
     * @returns {!ByteBuffer} this
     * @expose
     */
    ByteBufferPrototype.writeUInt64 = ByteBufferPrototype.writeUint64;

    /**
     * Reads a 64bit unsigned integer.
     * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by `8` if omitted.
     * @returns {!Long}
     * @expose
     */
    ByteBufferPrototype.readUint64 = function (offset) {
      var relative = typeof offset === 'undefined';
      if (relative) offset = this.offset;
      if (!this.noAssert) {
        if (typeof offset !== 'number' || offset % 1 !== 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
        offset >>>= 0;
        if (offset < 0 || offset + 8 > this.buffer.length) throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 8 + ") <= " + this.buffer.length);
      }
      var lo = 0,
        hi = 0;
      if (this.littleEndian) {
        lo = this.buffer[offset + 2] << 16;
        lo |= this.buffer[offset + 1] << 8;
        lo |= this.buffer[offset];
        lo += this.buffer[offset + 3] << 24 >>> 0;
        offset += 4;
        hi = this.buffer[offset + 2] << 16;
        hi |= this.buffer[offset + 1] << 8;
        hi |= this.buffer[offset];
        hi += this.buffer[offset + 3] << 24 >>> 0;
      } else {
        hi = this.buffer[offset + 1] << 16;
        hi |= this.buffer[offset + 2] << 8;
        hi |= this.buffer[offset + 3];
        hi += this.buffer[offset] << 24 >>> 0;
        offset += 4;
        lo = this.buffer[offset + 1] << 16;
        lo |= this.buffer[offset + 2] << 8;
        lo |= this.buffer[offset + 3];
        lo += this.buffer[offset] << 24 >>> 0;
      }
      var value = new Long(lo, hi, true);
      if (relative) this.offset += 8;
      return value;
    };

    /**
     * Reads a 64bit unsigned integer. This is an alias of {@link ByteBuffer#readUint64}.
     * @function
     * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by `8` if omitted.
     * @returns {!Long}
     * @expose
     */
    ByteBufferPrototype.readUInt64 = ByteBufferPrototype.readUint64;
  } // Long

  // types/floats/float32

  /**
   * Writes a 32bit float.
   * @param {number} value Value to write
   * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by `4` if omitted.
   * @returns {!ByteBuffer} this
   * @expose
   */
  ByteBufferPrototype.writeFloat32 = function (value, offset) {
    var relative = typeof offset === 'undefined';
    if (relative) offset = this.offset;
    if (!this.noAssert) {
      if (typeof value !== 'number') throw TypeError("Illegal value: " + value + " (not a number)");
      if (typeof offset !== 'number' || offset % 1 !== 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
      offset >>>= 0;
      if (offset < 0 || offset + 0 > this.buffer.length) throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 0 + ") <= " + this.buffer.length);
    }
    offset += 4;
    var capacity8 = this.buffer.length;
    if (offset > capacity8) this.resize((capacity8 *= 2) > offset ? capacity8 : offset);
    offset -= 4;
    this.littleEndian ? this.buffer.writeFloatLE(value, offset, true) : this.buffer.writeFloatBE(value, offset, true);
    if (relative) this.offset += 4;
    return this;
  };

  /**
   * Writes a 32bit float. This is an alias of {@link ByteBuffer#writeFloat32}.
   * @function
   * @param {number} value Value to write
   * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by `4` if omitted.
   * @returns {!ByteBuffer} this
   * @expose
   */
  ByteBufferPrototype.writeFloat = ByteBufferPrototype.writeFloat32;

  /**
   * Reads a 32bit float.
   * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by `4` if omitted.
   * @returns {number}
   * @expose
   */
  ByteBufferPrototype.readFloat32 = function (offset) {
    var relative = typeof offset === 'undefined';
    if (relative) offset = this.offset;
    if (!this.noAssert) {
      if (typeof offset !== 'number' || offset % 1 !== 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
      offset >>>= 0;
      if (offset < 0 || offset + 4 > this.buffer.length) throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 4 + ") <= " + this.buffer.length);
    }
    var value = this.littleEndian ? this.buffer.readFloatLE(offset, true) : this.buffer.readFloatBE(offset, true);
    if (relative) this.offset += 4;
    return value;
  };

  /**
   * Reads a 32bit float. This is an alias of {@link ByteBuffer#readFloat32}.
   * @function
   * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by `4` if omitted.
   * @returns {number}
   * @expose
   */
  ByteBufferPrototype.readFloat = ByteBufferPrototype.readFloat32;

  // types/floats/float64

  /**
   * Writes a 64bit float.
   * @param {number} value Value to write
   * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by `8` if omitted.
   * @returns {!ByteBuffer} this
   * @expose
   */
  ByteBufferPrototype.writeFloat64 = function (value, offset) {
    var relative = typeof offset === 'undefined';
    if (relative) offset = this.offset;
    if (!this.noAssert) {
      if (typeof value !== 'number') throw TypeError("Illegal value: " + value + " (not a number)");
      if (typeof offset !== 'number' || offset % 1 !== 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
      offset >>>= 0;
      if (offset < 0 || offset + 0 > this.buffer.length) throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 0 + ") <= " + this.buffer.length);
    }
    offset += 8;
    var capacity9 = this.buffer.length;
    if (offset > capacity9) this.resize((capacity9 *= 2) > offset ? capacity9 : offset);
    offset -= 8;
    this.littleEndian ? this.buffer.writeDoubleLE(value, offset, true) : this.buffer.writeDoubleBE(value, offset, true);
    if (relative) this.offset += 8;
    return this;
  };

  /**
   * Writes a 64bit float. This is an alias of {@link ByteBuffer#writeFloat64}.
   * @function
   * @param {number} value Value to write
   * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by `8` if omitted.
   * @returns {!ByteBuffer} this
   * @expose
   */
  ByteBufferPrototype.writeDouble = ByteBufferPrototype.writeFloat64;

  /**
   * Reads a 64bit float.
   * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by `8` if omitted.
   * @returns {number}
   * @expose
   */
  ByteBufferPrototype.readFloat64 = function (offset) {
    var relative = typeof offset === 'undefined';
    if (relative) offset = this.offset;
    if (!this.noAssert) {
      if (typeof offset !== 'number' || offset % 1 !== 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
      offset >>>= 0;
      if (offset < 0 || offset + 8 > this.buffer.length) throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 8 + ") <= " + this.buffer.length);
    }
    var value = this.littleEndian ? this.buffer.readDoubleLE(offset, true) : this.buffer.readDoubleBE(offset, true);
    if (relative) this.offset += 8;
    return value;
  };

  /**
   * Reads a 64bit float. This is an alias of {@link ByteBuffer#readFloat64}.
   * @function
   * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by `8` if omitted.
   * @returns {number}
   * @expose
   */
  ByteBufferPrototype.readDouble = ByteBufferPrototype.readFloat64;

  // types/varints/varint32

  /**
   * Maximum number of bytes required to store a 32bit base 128 variable-length integer.
   * @type {number}
   * @const
   * @expose
   */
  ByteBuffer.MAX_VARINT32_BYTES = 5;

  /**
   * Calculates the actual number of bytes required to store a 32bit base 128 variable-length integer.
   * @param {number} value Value to encode
   * @returns {number} Number of bytes required. Capped to {@link ByteBuffer.MAX_VARINT32_BYTES}
   * @expose
   */
  ByteBuffer.calculateVarint32 = function (value) {
    // ref: src/google/protobuf/io/coded_stream.cc
    value = value >>> 0;
    if (value < 1 << 7) return 1;else if (value < 1 << 14) return 2;else if (value < 1 << 21) return 3;else if (value < 1 << 28) return 4;else return 5;
  };

  /**
   * Zigzag encodes a signed 32bit integer so that it can be effectively used with varint encoding.
   * @param {number} n Signed 32bit integer
   * @returns {number} Unsigned zigzag encoded 32bit integer
   * @expose
   */
  ByteBuffer.zigZagEncode32 = function (n) {
    return ((n |= 0) << 1 ^ n >> 31) >>> 0; // ref: src/google/protobuf/wire_format_lite.h
  };

  /**
   * Decodes a zigzag encoded signed 32bit integer.
   * @param {number} n Unsigned zigzag encoded 32bit integer
   * @returns {number} Signed 32bit integer
   * @expose
   */
  ByteBuffer.zigZagDecode32 = function (n) {
    return n >>> 1 ^ -(n & 1) | 0; // // ref: src/google/protobuf/wire_format_lite.h
  };

  /**
   * Writes a 32bit base 128 variable-length integer.
   * @param {number} value Value to write
   * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by the number of bytes
   *  written if omitted.
   * @returns {!ByteBuffer|number} this if `offset` is omitted, else the actual number of bytes written
   * @expose
   */
  ByteBufferPrototype.writeVarint32 = function (value, offset) {
    var relative = typeof offset === 'undefined';
    if (relative) offset = this.offset;
    if (!this.noAssert) {
      if (typeof value !== 'number' || value % 1 !== 0) throw TypeError("Illegal value: " + value + " (not an integer)");
      value |= 0;
      if (typeof offset !== 'number' || offset % 1 !== 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
      offset >>>= 0;
      if (offset < 0 || offset + 0 > this.buffer.length) throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 0 + ") <= " + this.buffer.length);
    }
    var size = ByteBuffer.calculateVarint32(value),
      b;
    offset += size;
    var capacity10 = this.buffer.length;
    if (offset > capacity10) this.resize((capacity10 *= 2) > offset ? capacity10 : offset);
    offset -= size;
    value >>>= 0;
    while (value >= 0x80) {
      b = value & 0x7f | 0x80;
      this.buffer[offset++] = b;
      value >>>= 7;
    }
    this.buffer[offset++] = value;
    if (relative) {
      this.offset = offset;
      return this;
    }
    return size;
  };

  /**
   * Writes a zig-zag encoded (signed) 32bit base 128 variable-length integer.
   * @param {number} value Value to write
   * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by the number of bytes
   *  written if omitted.
   * @returns {!ByteBuffer|number} this if `offset` is omitted, else the actual number of bytes written
   * @expose
   */
  ByteBufferPrototype.writeVarint32ZigZag = function (value, offset) {
    return this.writeVarint32(ByteBuffer.zigZagEncode32(value), offset);
  };

  /**
   * Reads a 32bit base 128 variable-length integer.
   * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by the number of bytes
   *  written if omitted.
   * @returns {number|!{value: number, length: number}} The value read if offset is omitted, else the value read
   *  and the actual number of bytes read.
   * @throws {Error} If it's not a valid varint. Has a property `truncated = true` if there is not enough data available
   *  to fully decode the varint.
   * @expose
   */
  ByteBufferPrototype.readVarint32 = function (offset) {
    var relative = typeof offset === 'undefined';
    if (relative) offset = this.offset;
    if (!this.noAssert) {
      if (typeof offset !== 'number' || offset % 1 !== 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
      offset >>>= 0;
      if (offset < 0 || offset + 1 > this.buffer.length) throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 1 + ") <= " + this.buffer.length);
    }
    var c = 0,
      value = 0 >>> 0,
      b;
    do {
      if (!this.noAssert && offset > this.limit) {
        var err = Error("Truncated");
        err['truncated'] = true;
        throw err;
      }
      b = this.buffer[offset++];
      if (c < 5) value |= (b & 0x7f) << 7 * c;
      ++c;
    } while ((b & 0x80) !== 0);
    value |= 0;
    if (relative) {
      this.offset = offset;
      return value;
    }
    return {
      "value": value,
      "length": c
    };
  };

  /**
   * Reads a zig-zag encoded (signed) 32bit base 128 variable-length integer.
   * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by the number of bytes
   *  written if omitted.
   * @returns {number|!{value: number, length: number}} The value read if offset is omitted, else the value read
   *  and the actual number of bytes read.
   * @throws {Error} If it's not a valid varint
   * @expose
   */
  ByteBufferPrototype.readVarint32ZigZag = function (offset) {
    var val = this.readVarint32(offset);
    if (_typeof(val) === 'object') val["value"] = ByteBuffer.zigZagDecode32(val["value"]);else val = ByteBuffer.zigZagDecode32(val);
    return val;
  };

  // types/varints/varint64

  if (Long) {
    /**
     * Maximum number of bytes required to store a 64bit base 128 variable-length integer.
     * @type {number}
     * @const
     * @expose
     */
    ByteBuffer.MAX_VARINT64_BYTES = 10;

    /**
     * Calculates the actual number of bytes required to store a 64bit base 128 variable-length integer.
     * @param {number|!Long} value Value to encode
     * @returns {number} Number of bytes required. Capped to {@link ByteBuffer.MAX_VARINT64_BYTES}
     * @expose
     */
    ByteBuffer.calculateVarint64 = function (value) {
      if (typeof value === 'number') value = Long.fromNumber(value);else if (typeof value === 'string') value = Long.fromString(value);
      // ref: src/google/protobuf/io/coded_stream.cc
      var part0 = value.toInt() >>> 0,
        part1 = value.shiftRightUnsigned(28).toInt() >>> 0,
        part2 = value.shiftRightUnsigned(56).toInt() >>> 0;
      if (part2 == 0) {
        if (part1 == 0) {
          if (part0 < 1 << 14) return part0 < 1 << 7 ? 1 : 2;else return part0 < 1 << 21 ? 3 : 4;
        } else {
          if (part1 < 1 << 14) return part1 < 1 << 7 ? 5 : 6;else return part1 < 1 << 21 ? 7 : 8;
        }
      } else return part2 < 1 << 7 ? 9 : 10;
    };

    /**
     * Zigzag encodes a signed 64bit integer so that it can be effectively used with varint encoding.
     * @param {number|!Long} value Signed long
     * @returns {!Long} Unsigned zigzag encoded long
     * @expose
     */
    ByteBuffer.zigZagEncode64 = function (value) {
      if (typeof value === 'number') value = Long.fromNumber(value, false);else if (typeof value === 'string') value = Long.fromString(value, false);else if (value.unsigned !== false) value = value.toSigned();
      // ref: src/google/protobuf/wire_format_lite.h
      return value.shiftLeft(1).xor(value.shiftRight(63)).toUnsigned();
    };

    /**
     * Decodes a zigzag encoded signed 64bit integer.
     * @param {!Long|number} value Unsigned zigzag encoded long or JavaScript number
     * @returns {!Long} Signed long
     * @expose
     */
    ByteBuffer.zigZagDecode64 = function (value) {
      if (typeof value === 'number') value = Long.fromNumber(value, false);else if (typeof value === 'string') value = Long.fromString(value, false);else if (value.unsigned !== false) value = value.toSigned();
      // ref: src/google/protobuf/wire_format_lite.h
      return value.shiftRightUnsigned(1).xor(value.and(Long.ONE).toSigned().negate()).toSigned();
    };

    /**
     * Writes a 64bit base 128 variable-length integer.
     * @param {number|Long} value Value to write
     * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by the number of bytes
     *  written if omitted.
     * @returns {!ByteBuffer|number} `this` if offset is omitted, else the actual number of bytes written.
     * @expose
     */
    ByteBufferPrototype.writeVarint64 = function (value, offset) {
      var relative = typeof offset === 'undefined';
      if (relative) offset = this.offset;
      if (!this.noAssert) {
        if (typeof value === 'number') value = Long.fromNumber(value);else if (typeof value === 'string') value = Long.fromString(value);else if (!(value && value instanceof Long)) throw TypeError("Illegal value: " + value + " (not an integer or Long)");
        if (typeof offset !== 'number' || offset % 1 !== 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
        offset >>>= 0;
        if (offset < 0 || offset + 0 > this.buffer.length) throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 0 + ") <= " + this.buffer.length);
      }
      if (typeof value === 'number') value = Long.fromNumber(value, false);else if (typeof value === 'string') value = Long.fromString(value, false);else if (value.unsigned !== false) value = value.toSigned();
      var size = ByteBuffer.calculateVarint64(value),
        part0 = value.toInt() >>> 0,
        part1 = value.shiftRightUnsigned(28).toInt() >>> 0,
        part2 = value.shiftRightUnsigned(56).toInt() >>> 0;
      offset += size;
      var capacity11 = this.buffer.length;
      if (offset > capacity11) this.resize((capacity11 *= 2) > offset ? capacity11 : offset);
      offset -= size;
      switch (size) {
        case 10:
          this.buffer[offset + 9] = part2 >>> 7 & 0x01;
        case 9:
          this.buffer[offset + 8] = size !== 9 ? part2 | 0x80 : part2 & 0x7F;
        case 8:
          this.buffer[offset + 7] = size !== 8 ? part1 >>> 21 | 0x80 : part1 >>> 21 & 0x7F;
        case 7:
          this.buffer[offset + 6] = size !== 7 ? part1 >>> 14 | 0x80 : part1 >>> 14 & 0x7F;
        case 6:
          this.buffer[offset + 5] = size !== 6 ? part1 >>> 7 | 0x80 : part1 >>> 7 & 0x7F;
        case 5:
          this.buffer[offset + 4] = size !== 5 ? part1 | 0x80 : part1 & 0x7F;
        case 4:
          this.buffer[offset + 3] = size !== 4 ? part0 >>> 21 | 0x80 : part0 >>> 21 & 0x7F;
        case 3:
          this.buffer[offset + 2] = size !== 3 ? part0 >>> 14 | 0x80 : part0 >>> 14 & 0x7F;
        case 2:
          this.buffer[offset + 1] = size !== 2 ? part0 >>> 7 | 0x80 : part0 >>> 7 & 0x7F;
        case 1:
          this.buffer[offset] = size !== 1 ? part0 | 0x80 : part0 & 0x7F;
      }
      if (relative) {
        this.offset += size;
        return this;
      } else {
        return size;
      }
    };

    /**
     * Writes a zig-zag encoded 64bit base 128 variable-length integer.
     * @param {number|Long} value Value to write
     * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by the number of bytes
     *  written if omitted.
     * @returns {!ByteBuffer|number} `this` if offset is omitted, else the actual number of bytes written.
     * @expose
     */
    ByteBufferPrototype.writeVarint64ZigZag = function (value, offset) {
      return this.writeVarint64(ByteBuffer.zigZagEncode64(value), offset);
    };

    /**
     * Reads a 64bit base 128 variable-length integer. Requires Long.js.
     * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by the number of bytes
     *  read if omitted.
     * @returns {!Long|!{value: Long, length: number}} The value read if offset is omitted, else the value read and
     *  the actual number of bytes read.
     * @throws {Error} If it's not a valid varint
     * @expose
     */
    ByteBufferPrototype.readVarint64 = function (offset) {
      var relative = typeof offset === 'undefined';
      if (relative) offset = this.offset;
      if (!this.noAssert) {
        if (typeof offset !== 'number' || offset % 1 !== 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
        offset >>>= 0;
        if (offset < 0 || offset + 1 > this.buffer.length) throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 1 + ") <= " + this.buffer.length);
      }
      // ref: src/google/protobuf/io/coded_stream.cc
      var start = offset,
        part0 = 0,
        part1 = 0,
        part2 = 0,
        b = 0;
      b = this.buffer[offset++];
      part0 = b & 0x7F;
      if (b & 0x80) {
        b = this.buffer[offset++];
        part0 |= (b & 0x7F) << 7;
        if (b & 0x80 || this.noAssert && typeof b === 'undefined') {
          b = this.buffer[offset++];
          part0 |= (b & 0x7F) << 14;
          if (b & 0x80 || this.noAssert && typeof b === 'undefined') {
            b = this.buffer[offset++];
            part0 |= (b & 0x7F) << 21;
            if (b & 0x80 || this.noAssert && typeof b === 'undefined') {
              b = this.buffer[offset++];
              part1 = b & 0x7F;
              if (b & 0x80 || this.noAssert && typeof b === 'undefined') {
                b = this.buffer[offset++];
                part1 |= (b & 0x7F) << 7;
                if (b & 0x80 || this.noAssert && typeof b === 'undefined') {
                  b = this.buffer[offset++];
                  part1 |= (b & 0x7F) << 14;
                  if (b & 0x80 || this.noAssert && typeof b === 'undefined') {
                    b = this.buffer[offset++];
                    part1 |= (b & 0x7F) << 21;
                    if (b & 0x80 || this.noAssert && typeof b === 'undefined') {
                      b = this.buffer[offset++];
                      part2 = b & 0x7F;
                      if (b & 0x80 || this.noAssert && typeof b === 'undefined') {
                        b = this.buffer[offset++];
                        part2 |= (b & 0x7F) << 7;
                        if (b & 0x80 || this.noAssert && typeof b === 'undefined') {
                          throw Error("Buffer overrun");
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
      var value = Long.fromBits(part0 | part1 << 28, part1 >>> 4 | part2 << 24, false);
      if (relative) {
        this.offset = offset;
        return value;
      } else {
        return {
          'value': value,
          'length': offset - start
        };
      }
    };

    /**
     * Reads a zig-zag encoded 64bit base 128 variable-length integer. Requires Long.js.
     * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by the number of bytes
     *  read if omitted.
     * @returns {!Long|!{value: Long, length: number}} The value read if offset is omitted, else the value read and
     *  the actual number of bytes read.
     * @throws {Error} If it's not a valid varint
     * @expose
     */
    ByteBufferPrototype.readVarint64ZigZag = function (offset) {
      var val = this.readVarint64(offset);
      if (val && val['value'] instanceof Long) val["value"] = ByteBuffer.zigZagDecode64(val["value"]);else val = ByteBuffer.zigZagDecode64(val);
      return val;
    };
  } // Long

  // types/strings/cstring

  /**
   * Writes a NULL-terminated UTF8 encoded string. For this to work the specified string must not contain any NULL
   *  characters itself.
   * @param {string} str String to write
   * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by the number of bytes
   *  contained in `str` + 1 if omitted.
   * @returns {!ByteBuffer|number} this if offset is omitted, else the actual number of bytes written
   * @expose
   */
  ByteBufferPrototype.writeCString = function (str, offset) {
    var relative = typeof offset === 'undefined';
    if (relative) offset = this.offset;
    var i,
      k = str.length;
    if (!this.noAssert) {
      if (typeof str !== 'string') throw TypeError("Illegal str: Not a string");
      for (i = 0; i < k; ++i) {
        if (str.charCodeAt(i) === 0) throw RangeError("Illegal str: Contains NULL-characters");
      }
      if (typeof offset !== 'number' || offset % 1 !== 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
      offset >>>= 0;
      if (offset < 0 || offset + 0 > this.buffer.length) throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 0 + ") <= " + this.buffer.length);
    }
    // UTF8 strings do not contain zero bytes in between except for the zero character, so:
    k = Buffer.byteLength(str, "utf8");
    offset += k + 1;
    var capacity12 = this.buffer.length;
    if (offset > capacity12) this.resize((capacity12 *= 2) > offset ? capacity12 : offset);
    offset -= k + 1;
    offset += this.buffer.write(str, offset, k, "utf8");
    this.buffer[offset++] = 0;
    if (relative) {
      this.offset = offset;
      return this;
    }
    return k;
  };

  /**
   * Reads a NULL-terminated UTF8 encoded string. For this to work the string read must not contain any NULL characters
   *  itself.
   * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by the number of bytes
   *  read if omitted.
   * @returns {string|!{string: string, length: number}} The string read if offset is omitted, else the string
   *  read and the actual number of bytes read.
   * @expose
   */
  ByteBufferPrototype.readCString = function (offset) {
    var relative = typeof offset === 'undefined';
    if (relative) offset = this.offset;
    if (!this.noAssert) {
      if (typeof offset !== 'number' || offset % 1 !== 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
      offset >>>= 0;
      if (offset < 0 || offset + 1 > this.buffer.length) throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 1 + ") <= " + this.buffer.length);
    }
    var start = offset,
      temp;
    // UTF8 strings do not contain zero bytes in between except for the zero character itself, so:
    do {
      if (offset >= this.buffer.length) throw RangeError("Index out of range: " + offset + " <= " + this.buffer.length);
      temp = this.buffer[offset++];
    } while (temp !== 0);
    var str = this.buffer.toString("utf8", start, offset - 1);
    if (relative) {
      this.offset = offset;
      return str;
    } else {
      return {
        "string": str,
        "length": offset - start
      };
    }
  };

  // types/strings/istring

  /**
   * Writes a length as uint32 prefixed UTF8 encoded string.
   * @param {string} str String to write
   * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by the number of bytes
   *  written if omitted.
   * @returns {!ByteBuffer|number} `this` if `offset` is omitted, else the actual number of bytes written
   * @expose
   * @see ByteBuffer#writeVarint32
   */
  ByteBufferPrototype.writeIString = function (str, offset) {
    var relative = typeof offset === 'undefined';
    if (relative) offset = this.offset;
    if (!this.noAssert) {
      if (typeof str !== 'string') throw TypeError("Illegal str: Not a string");
      if (typeof offset !== 'number' || offset % 1 !== 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
      offset >>>= 0;
      if (offset < 0 || offset + 0 > this.buffer.length) throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 0 + ") <= " + this.buffer.length);
    }
    var start = offset,
      k;
    k = Buffer.byteLength(str, "utf8");
    offset += 4 + k;
    var capacity13 = this.buffer.length;
    if (offset > capacity13) this.resize((capacity13 *= 2) > offset ? capacity13 : offset);
    offset -= 4 + k;
    if (this.littleEndian) {
      this.buffer[offset + 3] = k >>> 24 & 0xFF;
      this.buffer[offset + 2] = k >>> 16 & 0xFF;
      this.buffer[offset + 1] = k >>> 8 & 0xFF;
      this.buffer[offset] = k & 0xFF;
    } else {
      this.buffer[offset] = k >>> 24 & 0xFF;
      this.buffer[offset + 1] = k >>> 16 & 0xFF;
      this.buffer[offset + 2] = k >>> 8 & 0xFF;
      this.buffer[offset + 3] = k & 0xFF;
    }
    offset += 4;
    offset += this.buffer.write(str, offset, k, "utf8");
    if (relative) {
      this.offset = offset;
      return this;
    }
    return offset - start;
  };

  /**
   * Reads a length as uint32 prefixed UTF8 encoded string.
   * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by the number of bytes
   *  read if omitted.
   * @returns {string|!{string: string, length: number}} The string read if offset is omitted, else the string
   *  read and the actual number of bytes read.
   * @expose
   * @see ByteBuffer#readVarint32
   */
  ByteBufferPrototype.readIString = function (offset) {
    var relative = typeof offset === 'undefined';
    if (relative) offset = this.offset;
    if (!this.noAssert) {
      if (typeof offset !== 'number' || offset % 1 !== 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
      offset >>>= 0;
      if (offset < 0 || offset + 4 > this.buffer.length) throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 4 + ") <= " + this.buffer.length);
    }
    var start = offset;
    var len = this.readUint32(offset);
    var str = this.readUTF8String(len, ByteBuffer.METRICS_BYTES, offset += 4);
    offset += str['length'];
    if (relative) {
      this.offset = offset;
      return str['string'];
    } else {
      return {
        'string': str['string'],
        'length': offset - start
      };
    }
  };

  // types/strings/utf8string

  /**
   * Metrics representing number of UTF8 characters. Evaluates to `c`.
   * @type {string}
   * @const
   * @expose
   */
  ByteBuffer.METRICS_CHARS = 'c';

  /**
   * Metrics representing number of bytes. Evaluates to `b`.
   * @type {string}
   * @const
   * @expose
   */
  ByteBuffer.METRICS_BYTES = 'b';

  /**
   * Writes an UTF8 encoded string.
   * @param {string} str String to write
   * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} if omitted.
   * @returns {!ByteBuffer|number} this if offset is omitted, else the actual number of bytes written.
   * @expose
   */
  ByteBufferPrototype.writeUTF8String = function (str, offset) {
    var relative = typeof offset === 'undefined';
    if (relative) offset = this.offset;
    if (!this.noAssert) {
      if (typeof offset !== 'number' || offset % 1 !== 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
      offset >>>= 0;
      if (offset < 0 || offset + 0 > this.buffer.length) throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 0 + ") <= " + this.buffer.length);
    }
    var k;
    k = Buffer.byteLength(str, "utf8");
    offset += k;
    var capacity14 = this.buffer.length;
    if (offset > capacity14) this.resize((capacity14 *= 2) > offset ? capacity14 : offset);
    offset -= k;
    offset += this.buffer.write(str, offset, k, "utf8");
    if (relative) {
      this.offset = offset;
      return this;
    }
    return k;
  };

  /**
   * Writes an UTF8 encoded string. This is an alias of {@link ByteBuffer#writeUTF8String}.
   * @function
   * @param {string} str String to write
   * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} if omitted.
   * @returns {!ByteBuffer|number} this if offset is omitted, else the actual number of bytes written.
   * @expose
   */
  ByteBufferPrototype.writeString = ByteBufferPrototype.writeUTF8String;

  /**
   * Calculates the number of UTF8 characters of a string. JavaScript itself uses UTF-16, so that a string's
   *  `length` property does not reflect its actual UTF8 size if it contains code points larger than 0xFFFF.
   * @param {string} str String to calculate
   * @returns {number} Number of UTF8 characters
   * @expose
   */
  ByteBuffer.calculateUTF8Chars = function (str) {
    return utfx.calculateUTF16asUTF8(stringSource(str))[0];
  };

  /**
   * Calculates the number of UTF8 bytes of a string.
   * @param {string} str String to calculate
   * @returns {number} Number of UTF8 bytes
   * @expose
   */
  ByteBuffer.calculateUTF8Bytes = function (str) {
    if (typeof str !== 'string') throw TypeError("Illegal argument: " + _typeof(str));
    return Buffer.byteLength(str, "utf8");
  };

  /**
   * Calculates the number of UTF8 bytes of a string. This is an alias of {@link ByteBuffer.calculateUTF8Bytes}.
   * @function
   * @param {string} str String to calculate
   * @returns {number} Number of UTF8 bytes
   * @expose
   */
  ByteBuffer.calculateString = ByteBuffer.calculateUTF8Bytes;

  /**
   * Reads an UTF8 encoded string.
   * @param {number} length Number of characters or bytes to read.
   * @param {string=} metrics Metrics specifying what `length` is meant to count. Defaults to
   *  {@link ByteBuffer.METRICS_CHARS}.
   * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by the number of bytes
   *  read if omitted.
   * @returns {string|!{string: string, length: number}} The string read if offset is omitted, else the string
   *  read and the actual number of bytes read.
   * @expose
   */
  ByteBufferPrototype.readUTF8String = function (length, metrics, offset) {
    if (typeof metrics === 'number') {
      offset = metrics;
      metrics = undefined;
    }
    var relative = typeof offset === 'undefined';
    if (relative) offset = this.offset;
    if (typeof metrics === 'undefined') metrics = ByteBuffer.METRICS_CHARS;
    if (!this.noAssert) {
      if (typeof length !== 'number' || length % 1 !== 0) throw TypeError("Illegal length: " + length + " (not an integer)");
      length |= 0;
      if (typeof offset !== 'number' || offset % 1 !== 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
      offset >>>= 0;
      if (offset < 0 || offset + 0 > this.buffer.length) throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 0 + ") <= " + this.buffer.length);
    }
    var i = 0,
      start = offset,
      temp,
      sd;
    if (metrics === ByteBuffer.METRICS_CHARS) {
      // The same for node and the browser
      sd = stringDestination();
      utfx.decodeUTF8(function () {
        return i < length && offset < this.limit ? this.buffer[offset++] : null;
      }.bind(this), function (cp) {
        ++i;
        utfx.UTF8toUTF16(cp, sd);
      });
      if (i !== length) throw RangeError("Illegal range: Truncated data, " + i + " == " + length);
      if (relative) {
        this.offset = offset;
        return sd();
      } else {
        return {
          "string": sd(),
          "length": offset - start
        };
      }
    } else if (metrics === ByteBuffer.METRICS_BYTES) {
      if (!this.noAssert) {
        if (typeof offset !== 'number' || offset % 1 !== 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
        offset >>>= 0;
        if (offset < 0 || offset + length > this.buffer.length) throw RangeError("Illegal offset: 0 <= " + offset + " (+" + length + ") <= " + this.buffer.length);
      }
      temp = this.buffer.toString("utf8", offset, offset + length);
      if (relative) {
        this.offset += length;
        return temp;
      } else {
        return {
          'string': temp,
          'length': length
        };
      }
    } else throw TypeError("Unsupported metrics: " + metrics);
  };

  /**
   * Reads an UTF8 encoded string. This is an alias of {@link ByteBuffer#readUTF8String}.
   * @function
   * @param {number} length Number of characters or bytes to read
   * @param {number=} metrics Metrics specifying what `n` is meant to count. Defaults to
   *  {@link ByteBuffer.METRICS_CHARS}.
   * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by the number of bytes
   *  read if omitted.
   * @returns {string|!{string: string, length: number}} The string read if offset is omitted, else the string
   *  read and the actual number of bytes read.
   * @expose
   */
  ByteBufferPrototype.readString = ByteBufferPrototype.readUTF8String;

  // types/strings/vstring

  /**
   * Writes a length as varint32 prefixed UTF8 encoded string.
   * @param {string} str String to write
   * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by the number of bytes
   *  written if omitted.
   * @returns {!ByteBuffer|number} `this` if `offset` is omitted, else the actual number of bytes written
   * @expose
   * @see ByteBuffer#writeVarint32
   */
  ByteBufferPrototype.writeVString = function (str, offset) {
    var relative = typeof offset === 'undefined';
    if (relative) offset = this.offset;
    if (!this.noAssert) {
      if (typeof str !== 'string') throw TypeError("Illegal str: Not a string");
      if (typeof offset !== 'number' || offset % 1 !== 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
      offset >>>= 0;
      if (offset < 0 || offset + 0 > this.buffer.length) throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 0 + ") <= " + this.buffer.length);
    }
    var start = offset,
      k,
      l;
    k = Buffer.byteLength(str, "utf8");
    l = ByteBuffer.calculateVarint32(k);
    offset += l + k;
    var capacity15 = this.buffer.length;
    if (offset > capacity15) this.resize((capacity15 *= 2) > offset ? capacity15 : offset);
    offset -= l + k;
    offset += this.writeVarint32(k, offset);
    offset += this.buffer.write(str, offset, k, "utf8");
    if (relative) {
      this.offset = offset;
      return this;
    }
    return offset - start;
  };

  /**
   * Reads a length as varint32 prefixed UTF8 encoded string.
   * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by the number of bytes
   *  read if omitted.
   * @returns {string|!{string: string, length: number}} The string read if offset is omitted, else the string
   *  read and the actual number of bytes read.
   * @expose
   * @see ByteBuffer#readVarint32
   */
  ByteBufferPrototype.readVString = function (offset) {
    var relative = typeof offset === 'undefined';
    if (relative) offset = this.offset;
    if (!this.noAssert) {
      if (typeof offset !== 'number' || offset % 1 !== 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
      offset >>>= 0;
      if (offset < 0 || offset + 1 > this.buffer.length) throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 1 + ") <= " + this.buffer.length);
    }
    var start = offset;
    var len = this.readVarint32(offset);
    var str = this.readUTF8String(len['value'], ByteBuffer.METRICS_BYTES, offset += len['length']);
    offset += str['length'];
    if (relative) {
      this.offset = offset;
      return str['string'];
    } else {
      return {
        'string': str['string'],
        'length': offset - start
      };
    }
  };

  /**
   * Appends some data to this ByteBuffer. This will overwrite any contents behind the specified offset up to the appended
   *  data's length.
   * @param {!ByteBuffer|!Buffer|!ArrayBuffer|!Uint8Array|string} source Data to append. If `source` is a ByteBuffer, its
   * offsets will be modified according to the performed read operation.
   * @param {(string|number)=} encoding Encoding if `data` is a string ("base64", "hex", "binary", defaults to "utf8")
   * @param {number=} offset Offset to append at. Will use and increase {@link ByteBuffer#offset} by the number of bytes
   *  written if omitted.
   * @returns {!ByteBuffer} this
   * @expose
   * @example A relative `<01 02>03.append(<04 05>)` will result in `<01 02 04 05>, 04 05|`
   * @example An absolute `<01 02>03.append(04 05>, 1)` will result in `<01 04>05, 04 05|`
   */
  ByteBufferPrototype.append = function (source, encoding, offset) {
    if (typeof encoding === 'number' || typeof encoding !== 'string') {
      offset = encoding;
      encoding = undefined;
    }
    var relative = typeof offset === 'undefined';
    if (relative) offset = this.offset;
    if (!this.noAssert) {
      if (typeof offset !== 'number' || offset % 1 !== 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
      offset >>>= 0;
      if (offset < 0 || offset + 0 > this.buffer.length) throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 0 + ") <= " + this.buffer.length);
    }
    if (!(source instanceof ByteBuffer)) source = ByteBuffer.wrap(source, encoding);
    var length = source.limit - source.offset;
    if (length <= 0) return this; // Nothing to append
    offset += length;
    var capacity16 = this.buffer.length;
    if (offset > capacity16) this.resize((capacity16 *= 2) > offset ? capacity16 : offset);
    offset -= length;
    source.buffer.copy(this.buffer, offset, source.offset, source.limit);
    source.offset += length;
    if (relative) this.offset += length;
    return this;
  };

  /**
   * Appends this ByteBuffer's contents to another ByteBuffer. This will overwrite any contents at and after the
      specified offset up to the length of this ByteBuffer's data.
   * @param {!ByteBuffer} target Target ByteBuffer
   * @param {number=} offset Offset to append to. Will use and increase {@link ByteBuffer#offset} by the number of bytes
   *  read if omitted.
   * @returns {!ByteBuffer} this
   * @expose
   * @see ByteBuffer#append
   */
  ByteBufferPrototype.appendTo = function (target, offset) {
    target.append(this, offset);
    return this;
  };

  /**
   * Enables or disables assertions of argument types and offsets. Assertions are enabled by default but you can opt to
   *  disable them if your code already makes sure that everything is valid.
   * @param {boolean} assert `true` to enable assertions, otherwise `false`
   * @returns {!ByteBuffer} this
   * @expose
   */
  ByteBufferPrototype.assert = function (assert) {
    this.noAssert = !assert;
    return this;
  };

  /**
   * Gets the capacity of this ByteBuffer's backing buffer.
   * @returns {number} Capacity of the backing buffer
   * @expose
   */
  ByteBufferPrototype.capacity = function () {
    return this.buffer.length;
  };
  /**
   * Clears this ByteBuffer's offsets by setting {@link ByteBuffer#offset} to `0` and {@link ByteBuffer#limit} to the
   *  backing buffer's capacity. Discards {@link ByteBuffer#markedOffset}.
   * @returns {!ByteBuffer} this
   * @expose
   */
  ByteBufferPrototype.clear = function () {
    this.offset = 0;
    this.limit = this.buffer.length;
    this.markedOffset = -1;
    return this;
  };

  /**
   * Creates a cloned instance of this ByteBuffer, preset with this ByteBuffer's values for {@link ByteBuffer#offset},
   *  {@link ByteBuffer#markedOffset} and {@link ByteBuffer#limit}.
   * @param {boolean=} copy Whether to copy the backing buffer or to return another view on the same, defaults to `false`
   * @returns {!ByteBuffer} Cloned instance
   * @expose
   */
  ByteBufferPrototype.clone = function (copy) {
    var bb = new ByteBuffer(0, this.littleEndian, this.noAssert);
    if (copy) {
      var buffer = new Buffer(this.buffer.length);
      this.buffer.copy(buffer);
      bb.buffer = buffer;
    } else {
      bb.buffer = this.buffer;
    }
    bb.offset = this.offset;
    bb.markedOffset = this.markedOffset;
    bb.limit = this.limit;
    return bb;
  };

  /**
   * Compacts this ByteBuffer to be backed by a {@link ByteBuffer#buffer} of its contents' length. Contents are the bytes
   *  between {@link ByteBuffer#offset} and {@link ByteBuffer#limit}. Will set `offset = 0` and `limit = capacity` and
   *  adapt {@link ByteBuffer#markedOffset} to the same relative position if set.
   * @param {number=} begin Offset to start at, defaults to {@link ByteBuffer#offset}
   * @param {number=} end Offset to end at, defaults to {@link ByteBuffer#limit}
   * @returns {!ByteBuffer} this
   * @expose
   */
  ByteBufferPrototype.compact = function (begin, end) {
    if (typeof begin === 'undefined') begin = this.offset;
    if (typeof end === 'undefined') end = this.limit;
    if (!this.noAssert) {
      if (typeof begin !== 'number' || begin % 1 !== 0) throw TypeError("Illegal begin: Not an integer");
      begin >>>= 0;
      if (typeof end !== 'number' || end % 1 !== 0) throw TypeError("Illegal end: Not an integer");
      end >>>= 0;
      if (begin < 0 || begin > end || end > this.buffer.length) throw RangeError("Illegal range: 0 <= " + begin + " <= " + end + " <= " + this.buffer.length);
    }
    if (begin === 0 && end === this.buffer.length) return this; // Already compacted
    var len = end - begin;
    if (len === 0) {
      this.buffer = EMPTY_BUFFER;
      if (this.markedOffset >= 0) this.markedOffset -= begin;
      this.offset = 0;
      this.limit = 0;
      return this;
    }
    var buffer = new Buffer(len);
    this.buffer.copy(buffer, 0, begin, end);
    this.buffer = buffer;
    if (this.markedOffset >= 0) this.markedOffset -= begin;
    this.offset = 0;
    this.limit = len;
    return this;
  };

  /**
   * Creates a copy of this ByteBuffer's contents. Contents are the bytes between {@link ByteBuffer#offset} and
   *  {@link ByteBuffer#limit}.
   * @param {number=} begin Begin offset, defaults to {@link ByteBuffer#offset}.
   * @param {number=} end End offset, defaults to {@link ByteBuffer#limit}.
   * @returns {!ByteBuffer} Copy
   * @expose
   */
  ByteBufferPrototype.copy = function (begin, end) {
    if (typeof begin === 'undefined') begin = this.offset;
    if (typeof end === 'undefined') end = this.limit;
    if (!this.noAssert) {
      if (typeof begin !== 'number' || begin % 1 !== 0) throw TypeError("Illegal begin: Not an integer");
      begin >>>= 0;
      if (typeof end !== 'number' || end % 1 !== 0) throw TypeError("Illegal end: Not an integer");
      end >>>= 0;
      if (begin < 0 || begin > end || end > this.buffer.length) throw RangeError("Illegal range: 0 <= " + begin + " <= " + end + " <= " + this.buffer.length);
    }
    if (begin === end) return new ByteBuffer(0, this.littleEndian, this.noAssert);
    var capacity = end - begin,
      bb = new ByteBuffer(capacity, this.littleEndian, this.noAssert);
    bb.offset = 0;
    bb.limit = capacity;
    if (bb.markedOffset >= 0) bb.markedOffset -= begin;
    this.copyTo(bb, 0, begin, end);
    return bb;
  };

  /**
   * Copies this ByteBuffer's contents to another ByteBuffer. Contents are the bytes between {@link ByteBuffer#offset} and
   *  {@link ByteBuffer#limit}.
   * @param {!ByteBuffer} target Target ByteBuffer
   * @param {number=} targetOffset Offset to copy to. Will use and increase the target's {@link ByteBuffer#offset}
   *  by the number of bytes copied if omitted.
   * @param {number=} sourceOffset Offset to start copying from. Will use and increase {@link ByteBuffer#offset} by the
   *  number of bytes copied if omitted.
   * @param {number=} sourceLimit Offset to end copying from, defaults to {@link ByteBuffer#limit}
   * @returns {!ByteBuffer} this
   * @expose
   */
  ByteBufferPrototype.copyTo = function (target, targetOffset, sourceOffset, sourceLimit) {
    var relative, targetRelative;
    if (!this.noAssert) {
      if (!ByteBuffer.isByteBuffer(target)) throw TypeError("Illegal target: Not a ByteBuffer");
    }
    targetOffset = (targetRelative = typeof targetOffset === 'undefined') ? target.offset : targetOffset | 0;
    sourceOffset = (relative = typeof sourceOffset === 'undefined') ? this.offset : sourceOffset | 0;
    sourceLimit = typeof sourceLimit === 'undefined' ? this.limit : sourceLimit | 0;
    if (targetOffset < 0 || targetOffset > target.buffer.length) throw RangeError("Illegal target range: 0 <= " + targetOffset + " <= " + target.buffer.length);
    if (sourceOffset < 0 || sourceLimit > this.buffer.length) throw RangeError("Illegal source range: 0 <= " + sourceOffset + " <= " + this.buffer.length);
    var len = sourceLimit - sourceOffset;
    if (len === 0) return target; // Nothing to copy

    target.ensureCapacity(targetOffset + len);
    this.buffer.copy(target.buffer, targetOffset, sourceOffset, sourceLimit);
    if (relative) this.offset += len;
    if (targetRelative) target.offset += len;
    return this;
  };

  /**
   * Makes sure that this ByteBuffer is backed by a {@link ByteBuffer#buffer} of at least the specified capacity. If the
   *  current capacity is exceeded, it will be doubled. If double the current capacity is less than the required capacity,
   *  the required capacity will be used instead.
   * @param {number} capacity Required capacity
   * @returns {!ByteBuffer} this
   * @expose
   */
  ByteBufferPrototype.ensureCapacity = function (capacity) {
    var current = this.buffer.length;
    if (current < capacity) return this.resize((current *= 2) > capacity ? current : capacity);
    return this;
  };

  /**
   * Overwrites this ByteBuffer's contents with the specified value. Contents are the bytes between
   *  {@link ByteBuffer#offset} and {@link ByteBuffer#limit}.
   * @param {number|string} value Byte value to fill with. If given as a string, the first character is used.
   * @param {number=} begin Begin offset. Will use and increase {@link ByteBuffer#offset} by the number of bytes
   *  written if omitted. defaults to {@link ByteBuffer#offset}.
   * @param {number=} end End offset, defaults to {@link ByteBuffer#limit}.
   * @returns {!ByteBuffer} this
   * @expose
   * @example `someByteBuffer.clear().fill(0)` fills the entire backing buffer with zeroes
   */
  ByteBufferPrototype.fill = function (value, begin, end) {
    var relative = typeof begin === 'undefined';
    if (relative) begin = this.offset;
    if (typeof value === 'string' && value.length > 0) value = value.charCodeAt(0);
    if (typeof begin === 'undefined') begin = this.offset;
    if (typeof end === 'undefined') end = this.limit;
    if (!this.noAssert) {
      if (typeof value !== 'number' || value % 1 !== 0) throw TypeError("Illegal value: " + value + " (not an integer)");
      value |= 0;
      if (typeof begin !== 'number' || begin % 1 !== 0) throw TypeError("Illegal begin: Not an integer");
      begin >>>= 0;
      if (typeof end !== 'number' || end % 1 !== 0) throw TypeError("Illegal end: Not an integer");
      end >>>= 0;
      if (begin < 0 || begin > end || end > this.buffer.length) throw RangeError("Illegal range: 0 <= " + begin + " <= " + end + " <= " + this.buffer.length);
    }
    if (begin >= end) return this; // Nothing to fill
    this.buffer.fill(value, begin, end);
    begin = end;
    if (relative) this.offset = begin;
    return this;
  };

  /**
   * Makes this ByteBuffer ready for a new sequence of write or relative read operations. Sets `limit = offset` and
   *  `offset = 0`. Make sure always to flip a ByteBuffer when all relative read or write operations are complete.
   * @returns {!ByteBuffer} this
   * @expose
   */
  ByteBufferPrototype.flip = function () {
    this.limit = this.offset;
    this.offset = 0;
    return this;
  };
  /**
   * Marks an offset on this ByteBuffer to be used later.
   * @param {number=} offset Offset to mark. Defaults to {@link ByteBuffer#offset}.
   * @returns {!ByteBuffer} this
   * @throws {TypeError} If `offset` is not a valid number
   * @throws {RangeError} If `offset` is out of bounds
   * @see ByteBuffer#reset
   * @expose
   */
  ByteBufferPrototype.mark = function (offset) {
    offset = typeof offset === 'undefined' ? this.offset : offset;
    if (!this.noAssert) {
      if (typeof offset !== 'number' || offset % 1 !== 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
      offset >>>= 0;
      if (offset < 0 || offset + 0 > this.buffer.length) throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 0 + ") <= " + this.buffer.length);
    }
    this.markedOffset = offset;
    return this;
  };
  /**
   * Sets the byte order.
   * @param {boolean} littleEndian `true` for little endian byte order, `false` for big endian
   * @returns {!ByteBuffer} this
   * @expose
   */
  ByteBufferPrototype.order = function (littleEndian) {
    if (!this.noAssert) {
      if (typeof littleEndian !== 'boolean') throw TypeError("Illegal littleEndian: Not a boolean");
    }
    this.littleEndian = !!littleEndian;
    return this;
  };

  /**
   * Switches (to) little endian byte order.
   * @param {boolean=} littleEndian Defaults to `true`, otherwise uses big endian
   * @returns {!ByteBuffer} this
   * @expose
   */
  ByteBufferPrototype.LE = function (littleEndian) {
    this.littleEndian = typeof littleEndian !== 'undefined' ? !!littleEndian : true;
    return this;
  };

  /**
   * Switches (to) big endian byte order.
   * @param {boolean=} bigEndian Defaults to `true`, otherwise uses little endian
   * @returns {!ByteBuffer} this
   * @expose
   */
  ByteBufferPrototype.BE = function (bigEndian) {
    this.littleEndian = typeof bigEndian !== 'undefined' ? !bigEndian : false;
    return this;
  };
  /**
   * Prepends some data to this ByteBuffer. This will overwrite any contents before the specified offset up to the
   *  prepended data's length. If there is not enough space available before the specified `offset`, the backing buffer
   *  will be resized and its contents moved accordingly.
   * @param {!ByteBuffer|string||!Buffer} source Data to prepend. If `source` is a ByteBuffer, its offset will be modified
   *  according to the performed read operation.
   * @param {(string|number)=} encoding Encoding if `data` is a string ("base64", "hex", "binary", defaults to "utf8")
   * @param {number=} offset Offset to prepend at. Will use and decrease {@link ByteBuffer#offset} by the number of bytes
   *  prepended if omitted.
   * @returns {!ByteBuffer} this
   * @expose
   * @example A relative `00<01 02 03>.prepend(<04 05>)` results in `<04 05 01 02 03>, 04 05|`
   * @example An absolute `00<01 02 03>.prepend(<04 05>, 2)` results in `04<05 02 03>, 04 05|`
   */
  ByteBufferPrototype.prepend = function (source, encoding, offset) {
    if (typeof encoding === 'number' || typeof encoding !== 'string') {
      offset = encoding;
      encoding = undefined;
    }
    var relative = typeof offset === 'undefined';
    if (relative) offset = this.offset;
    if (!this.noAssert) {
      if (typeof offset !== 'number' || offset % 1 !== 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
      offset >>>= 0;
      if (offset < 0 || offset + 0 > this.buffer.length) throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 0 + ") <= " + this.buffer.length);
    }
    if (!(source instanceof ByteBuffer)) source = ByteBuffer.wrap(source, encoding);
    var len = source.limit - source.offset;
    if (len <= 0) return this; // Nothing to prepend
    var diff = len - offset;
    if (diff > 0) {
      // Not enough space before offset, so resize + move
      var buffer = new Buffer(this.buffer.length + diff);
      this.buffer.copy(buffer, len, offset, this.buffer.length);
      this.buffer = buffer;
      this.offset += diff;
      if (this.markedOffset >= 0) this.markedOffset += diff;
      this.limit += diff;
      offset += diff;
    }
    source.buffer.copy(this.buffer, offset - len, source.offset, source.limit);
    source.offset = source.limit;
    if (relative) this.offset -= len;
    return this;
  };

  /**
   * Prepends this ByteBuffer to another ByteBuffer. This will overwrite any contents before the specified offset up to the
   *  prepended data's length. If there is not enough space available before the specified `offset`, the backing buffer
   *  will be resized and its contents moved accordingly.
   * @param {!ByteBuffer} target Target ByteBuffer
   * @param {number=} offset Offset to prepend at. Will use and decrease {@link ByteBuffer#offset} by the number of bytes
   *  prepended if omitted.
   * @returns {!ByteBuffer} this
   * @expose
   * @see ByteBuffer#prepend
   */
  ByteBufferPrototype.prependTo = function (target, offset) {
    target.prepend(this, offset);
    return this;
  };
  /**
   * Prints debug information about this ByteBuffer's contents.
   * @param {function(string)=} out Output function to call, defaults to console.log
   * @expose
   */
  ByteBufferPrototype.printDebug = function (out) {
    if (typeof out !== 'function') out = console.log.bind(console);
    out(this.toString() + "\n" + "-------------------------------------------------------------------\n" + this.toDebug( /* columns */true));
  };

  /**
   * Gets the number of remaining readable bytes. Contents are the bytes between {@link ByteBuffer#offset} and
   *  {@link ByteBuffer#limit}, so this returns `limit - offset`.
   * @returns {number} Remaining readable bytes. May be negative if `offset > limit`.
   * @expose
   */
  ByteBufferPrototype.remaining = function () {
    return this.limit - this.offset;
  };
  /**
   * Resets this ByteBuffer's {@link ByteBuffer#offset}. If an offset has been marked through {@link ByteBuffer#mark}
   *  before, `offset` will be set to {@link ByteBuffer#markedOffset}, which will then be discarded. If no offset has been
   *  marked, sets `offset = 0`.
   * @returns {!ByteBuffer} this
   * @see ByteBuffer#mark
   * @expose
   */
  ByteBufferPrototype.reset = function () {
    if (this.markedOffset >= 0) {
      this.offset = this.markedOffset;
      this.markedOffset = -1;
    } else {
      this.offset = 0;
    }
    return this;
  };
  /**
   * Resizes this ByteBuffer to be backed by a buffer of at least the given capacity. Will do nothing if already that
   *  large or larger.
   * @param {number} capacity Capacity required
   * @returns {!ByteBuffer} this
   * @throws {TypeError} If `capacity` is not a number
   * @throws {RangeError} If `capacity < 0`
   * @expose
   */
  ByteBufferPrototype.resize = function (capacity) {
    if (!this.noAssert) {
      if (typeof capacity !== 'number' || capacity % 1 !== 0) throw TypeError("Illegal capacity: " + capacity + " (not an integer)");
      capacity |= 0;
      if (capacity < 0) throw RangeError("Illegal capacity: 0 <= " + capacity);
    }
    if (this.buffer.length < capacity) {
      var buffer = new Buffer(capacity);
      this.buffer.copy(buffer);
      this.buffer = buffer;
    }
    return this;
  };
  /**
   * Reverses this ByteBuffer's contents.
   * @param {number=} begin Offset to start at, defaults to {@link ByteBuffer#offset}
   * @param {number=} end Offset to end at, defaults to {@link ByteBuffer#limit}
   * @returns {!ByteBuffer} this
   * @expose
   */
  ByteBufferPrototype.reverse = function (begin, end) {
    if (typeof begin === 'undefined') begin = this.offset;
    if (typeof end === 'undefined') end = this.limit;
    if (!this.noAssert) {
      if (typeof begin !== 'number' || begin % 1 !== 0) throw TypeError("Illegal begin: Not an integer");
      begin >>>= 0;
      if (typeof end !== 'number' || end % 1 !== 0) throw TypeError("Illegal end: Not an integer");
      end >>>= 0;
      if (begin < 0 || begin > end || end > this.buffer.length) throw RangeError("Illegal range: 0 <= " + begin + " <= " + end + " <= " + this.buffer.length);
    }
    if (begin === end) return this; // Nothing to reverse
    Array.prototype.reverse.call(this.buffer.slice(begin, end));
    return this;
  };
  /**
   * Skips the next `length` bytes. This will just advance
   * @param {number} length Number of bytes to skip. May also be negative to move the offset back.
   * @returns {!ByteBuffer} this
   * @expose
   */
  ByteBufferPrototype.skip = function (length) {
    if (!this.noAssert) {
      if (typeof length !== 'number' || length % 1 !== 0) throw TypeError("Illegal length: " + length + " (not an integer)");
      length |= 0;
    }
    var offset = this.offset + length;
    if (!this.noAssert) {
      if (offset < 0 || offset > this.buffer.length) throw RangeError("Illegal length: 0 <= " + this.offset + " + " + length + " <= " + this.buffer.length);
    }
    this.offset = offset;
    return this;
  };

  /**
   * Slices this ByteBuffer by creating a cloned instance with `offset = begin` and `limit = end`.
   * @param {number=} begin Begin offset, defaults to {@link ByteBuffer#offset}.
   * @param {number=} end End offset, defaults to {@link ByteBuffer#limit}.
   * @returns {!ByteBuffer} Clone of this ByteBuffer with slicing applied, backed by the same {@link ByteBuffer#buffer}
   * @expose
   */
  ByteBufferPrototype.slice = function (begin, end) {
    if (typeof begin === 'undefined') begin = this.offset;
    if (typeof end === 'undefined') end = this.limit;
    if (!this.noAssert) {
      if (typeof begin !== 'number' || begin % 1 !== 0) throw TypeError("Illegal begin: Not an integer");
      begin >>>= 0;
      if (typeof end !== 'number' || end % 1 !== 0) throw TypeError("Illegal end: Not an integer");
      end >>>= 0;
      if (begin < 0 || begin > end || end > this.buffer.length) throw RangeError("Illegal range: 0 <= " + begin + " <= " + end + " <= " + this.buffer.length);
    }
    var bb = this.clone();
    bb.offset = begin;
    bb.limit = end;
    return bb;
  };
  /**
   * Returns a copy of the backing buffer that contains this ByteBuffer's contents. Contents are the bytes between
   *  {@link ByteBuffer#offset} and {@link ByteBuffer#limit}.
   * @param {boolean=} forceCopy If `true` returns a copy, otherwise returns a view referencing the same memory if
   *  possible. Defaults to `false`
   * @returns {!Buffer} Contents as a Buffer
   * @expose
   */
  ByteBufferPrototype.toBuffer = function (forceCopy) {
    var offset = this.offset,
      limit = this.limit;
    if (!this.noAssert) {
      if (typeof offset !== 'number' || offset % 1 !== 0) throw TypeError("Illegal offset: Not an integer");
      offset >>>= 0;
      if (typeof limit !== 'number' || limit % 1 !== 0) throw TypeError("Illegal limit: Not an integer");
      limit >>>= 0;
      if (offset < 0 || offset > limit || limit > this.buffer.length) throw RangeError("Illegal range: 0 <= " + offset + " <= " + limit + " <= " + this.buffer.length);
    }
    if (forceCopy) {
      var buffer = new Buffer(limit - offset);
      this.buffer.copy(buffer, 0, offset, limit);
      return buffer;
    } else {
      if (offset === 0 && limit === this.buffer.length) return this.buffer;else return this.buffer.slice(offset, limit);
    }
  };

  /**
   * Returns a copy of the backing buffer compacted to contain this ByteBuffer's contents. Contents are the bytes between
   *  {@link ByteBuffer#offset} and {@link ByteBuffer#limit}.
   * @returns {!ArrayBuffer} Contents as an ArrayBuffer
   */
  ByteBufferPrototype.toArrayBuffer = function () {
    var offset = this.offset,
      limit = this.limit;
    if (!this.noAssert) {
      if (typeof offset !== 'number' || offset % 1 !== 0) throw TypeError("Illegal offset: Not an integer");
      offset >>>= 0;
      if (typeof limit !== 'number' || limit % 1 !== 0) throw TypeError("Illegal limit: Not an integer");
      limit >>>= 0;
      if (offset < 0 || offset > limit || limit > this.buffer.length) throw RangeError("Illegal range: 0 <= " + offset + " <= " + limit + " <= " + this.buffer.length);
    }
    var ab = new ArrayBuffer(limit - offset);
    if (memcpy) {
      // Fast
      memcpy(ab, 0, this.buffer, offset, limit);
    } else {
      // Slow
      var dst = new Uint8Array(ab);
      for (var i = offset; i < limit; ++i) dst[i - offset] = this.buffer[i];
    }
    return ab;
  };

  /**
   * Converts the ByteBuffer's contents to a string.
   * @param {string=} encoding Output encoding. Returns an informative string representation if omitted but also allows
   *  direct conversion to "utf8", "hex", "base64" and "binary" encoding. "debug" returns a hex representation with
   *  highlighted offsets.
   * @param {number=} begin Offset to begin at, defaults to {@link ByteBuffer#offset}
   * @param {number=} end Offset to end at, defaults to {@link ByteBuffer#limit}
   * @returns {string} String representation
   * @throws {Error} If `encoding` is invalid
   * @expose
   */
  ByteBufferPrototype.toString = function (encoding, begin, end) {
    if (typeof encoding === 'undefined') return "ByteBufferNB(offset=" + this.offset + ",markedOffset=" + this.markedOffset + ",limit=" + this.limit + ",capacity=" + this.capacity() + ")";
    if (typeof encoding === 'number') encoding = "utf8", begin = encoding, end = begin;
    switch (encoding) {
      case "utf8":
        return this.toUTF8(begin, end);
      case "base64":
        return this.toBase64(begin, end);
      case "hex":
        return this.toHex(begin, end);
      case "binary":
        return this.toBinary(begin, end);
      case "debug":
        return this.toDebug();
      case "columns":
        return this.toColumns();
      default:
        throw Error("Unsupported encoding: " + encoding);
    }
  };

  // encodings/base64

  /**
   * Encodes this ByteBuffer's contents to a base64 encoded string.
   * @param {number=} begin Offset to begin at, defaults to {@link ByteBuffer#offset}.
   * @param {number=} end Offset to end at, defaults to {@link ByteBuffer#limit}.
   * @returns {string} Base64 encoded string
   * @throws {RangeError} If `begin` or `end` is out of bounds
   * @expose
   */
  ByteBufferPrototype.toBase64 = function (begin, end) {
    if (typeof begin === 'undefined') begin = this.offset;
    if (typeof end === 'undefined') end = this.limit;
    begin = begin | 0;
    end = end | 0;
    if (begin < 0 || end > this.capacity || begin > end) throw RangeError("begin, end");
    return this.buffer.toString("base64", begin, end);
  };

  /**
   * Decodes a base64 encoded string to a ByteBuffer.
   * @param {string} str String to decode
   * @param {boolean=} littleEndian Whether to use little or big endian byte order. Defaults to
   *  {@link ByteBuffer.DEFAULT_ENDIAN}.
   * @returns {!ByteBuffer} ByteBuffer
   * @expose
   */
  ByteBuffer.fromBase64 = function (str, littleEndian) {
    return ByteBuffer.wrap(new Buffer(str, "base64"), littleEndian);
  };

  /**
   * Encodes a binary string to base64 like `window.btoa` does.
   * @param {string} str Binary string
   * @returns {string} Base64 encoded string
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Window.btoa
   * @expose
   */
  ByteBuffer.btoa = function (str) {
    return ByteBuffer.fromBinary(str).toBase64();
  };

  /**
   * Decodes a base64 encoded string to binary like `window.atob` does.
   * @param {string} b64 Base64 encoded string
   * @returns {string} Binary string
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Window.atob
   * @expose
   */
  ByteBuffer.atob = function (b64) {
    return ByteBuffer.fromBase64(b64).toBinary();
  };

  // encodings/binary

  /**
   * Encodes this ByteBuffer to a binary encoded string, that is using only characters 0x00-0xFF as bytes.
   * @param {number=} begin Offset to begin at. Defaults to {@link ByteBuffer#offset}.
   * @param {number=} end Offset to end at. Defaults to {@link ByteBuffer#limit}.
   * @returns {string} Binary encoded string
   * @throws {RangeError} If `offset > limit`
   * @expose
   */
  ByteBufferPrototype.toBinary = function (begin, end) {
    if (typeof begin === 'undefined') begin = this.offset;
    if (typeof end === 'undefined') end = this.limit;
    begin |= 0;
    end |= 0;
    if (begin < 0 || end > this.capacity() || begin > end) throw RangeError("begin, end");
    return this.buffer.toString("binary", begin, end);
  };

  /**
   * Decodes a binary encoded string, that is using only characters 0x00-0xFF as bytes, to a ByteBuffer.
   * @param {string} str String to decode
   * @param {boolean=} littleEndian Whether to use little or big endian byte order. Defaults to
   *  {@link ByteBuffer.DEFAULT_ENDIAN}.
   * @returns {!ByteBuffer} ByteBuffer
   * @expose
   */
  ByteBuffer.fromBinary = function (str, littleEndian) {
    return ByteBuffer.wrap(new Buffer(str, "binary"), littleEndian);
  };

  // encodings/debug

  /**
   * Encodes this ByteBuffer to a hex encoded string with marked offsets. Offset symbols are:
   * * `<` : offset,
   * * `'` : markedOffset,
   * * `>` : limit,
   * * `|` : offset and limit,
   * * `[` : offset and markedOffset,
   * * `]` : markedOffset and limit,
   * * `!` : offset, markedOffset and limit
   * @param {boolean=} columns If `true` returns two columns hex + ascii, defaults to `false`
   * @returns {string|!Array.<string>} Debug string or array of lines if `asArray = true`
   * @expose
   * @example `>00'01 02<03` contains four bytes with `limit=0, markedOffset=1, offset=3`
   * @example `00[01 02 03>` contains four bytes with `offset=markedOffset=1, limit=4`
   * @example `00|01 02 03` contains four bytes with `offset=limit=1, markedOffset=-1`
   * @example `|` contains zero bytes with `offset=limit=0, markedOffset=-1`
   */
  ByteBufferPrototype.toDebug = function (columns) {
    var i = -1,
      k = this.buffer.length,
      b,
      hex = "",
      asc = "",
      out = "";
    while (i < k) {
      if (i !== -1) {
        b = this.buffer[i];
        if (b < 0x10) hex += "0" + b.toString(16).toUpperCase();else hex += b.toString(16).toUpperCase();
        if (columns) asc += b > 32 && b < 127 ? String.fromCharCode(b) : '.';
      }
      ++i;
      if (columns) {
        if (i > 0 && i % 16 === 0 && i !== k) {
          while (hex.length < 3 * 16 + 3) hex += " ";
          out += hex + asc + "\n";
          hex = asc = "";
        }
      }
      if (i === this.offset && i === this.limit) hex += i === this.markedOffset ? "!" : "|";else if (i === this.offset) hex += i === this.markedOffset ? "[" : "<";else if (i === this.limit) hex += i === this.markedOffset ? "]" : ">";else hex += i === this.markedOffset ? "'" : columns || i !== 0 && i !== k ? " " : "";
    }
    if (columns && hex !== " ") {
      while (hex.length < 3 * 16 + 3) hex += " ";
      out += hex + asc + "\n";
    }
    return columns ? out : hex;
  };

  /**
   * Decodes a hex encoded string with marked offsets to a ByteBuffer.
   * @param {string} str Debug string to decode (not be generated with `columns = true`)
   * @param {boolean=} littleEndian Whether to use little or big endian byte order. Defaults to
   *  {@link ByteBuffer.DEFAULT_ENDIAN}.
   * @param {boolean=} noAssert Whether to skip assertions of offsets and values. Defaults to
   *  {@link ByteBuffer.DEFAULT_NOASSERT}.
   * @returns {!ByteBuffer} ByteBuffer
   * @expose
   * @see ByteBuffer#toDebug
   */
  ByteBuffer.fromDebug = function (str, littleEndian, noAssert) {
    var k = str.length,
      bb = new ByteBuffer((k + 1) / 3 | 0, littleEndian, noAssert);
    var i = 0,
      j = 0,
      ch,
      b,
      rs = false,
      // Require symbol next
      ho = false,
      hm = false,
      hl = false,
      // Already has offset (ho), markedOffset (hm), limit (hl)?
      fail = false;
    while (i < k) {
      switch (ch = str.charAt(i++)) {
        case '!':
          if (!noAssert) {
            if (ho || hm || hl) {
              fail = true;
              break;
            }
            ho = hm = hl = true;
          }
          bb.offset = bb.markedOffset = bb.limit = j;
          rs = false;
          break;
        case '|':
          if (!noAssert) {
            if (ho || hl) {
              fail = true;
              break;
            }
            ho = hl = true;
          }
          bb.offset = bb.limit = j;
          rs = false;
          break;
        case '[':
          if (!noAssert) {
            if (ho || hm) {
              fail = true;
              break;
            }
            ho = hm = true;
          }
          bb.offset = bb.markedOffset = j;
          rs = false;
          break;
        case '<':
          if (!noAssert) {
            if (ho) {
              fail = true;
              break;
            }
            ho = true;
          }
          bb.offset = j;
          rs = false;
          break;
        case ']':
          if (!noAssert) {
            if (hl || hm) {
              fail = true;
              break;
            }
            hl = hm = true;
          }
          bb.limit = bb.markedOffset = j;
          rs = false;
          break;
        case '>':
          if (!noAssert) {
            if (hl) {
              fail = true;
              break;
            }
            hl = true;
          }
          bb.limit = j;
          rs = false;
          break;
        case "'":
          if (!noAssert) {
            if (hm) {
              fail = true;
              break;
            }
            hm = true;
          }
          bb.markedOffset = j;
          rs = false;
          break;
        case ' ':
          rs = false;
          break;
        default:
          if (!noAssert) {
            if (rs) {
              fail = true;
              break;
            }
          }
          b = parseInt(ch + str.charAt(i++), 16);
          if (!noAssert) {
            if (isNaN(b) || b < 0 || b > 255) throw TypeError("Illegal str: Not a debug encoded string");
          }
          bb.buffer[j++] = b;
          rs = true;
      }
      if (fail) throw TypeError("Illegal str: Invalid symbol at " + i);
    }
    if (!noAssert) {
      if (!ho || !hl) throw TypeError("Illegal str: Missing offset or limit");
      if (j < bb.buffer.length) throw TypeError("Illegal str: Not a debug encoded string (is it hex?) " + j + " < " + k);
    }
    return bb;
  };

  // encodings/hex

  /**
   * Encodes this ByteBuffer's contents to a hex encoded string.
   * @param {number=} begin Offset to begin at. Defaults to {@link ByteBuffer#offset}.
   * @param {number=} end Offset to end at. Defaults to {@link ByteBuffer#limit}.
   * @returns {string} Hex encoded string
   * @expose
   */
  ByteBufferPrototype.toHex = function (begin, end) {
    begin = typeof begin === 'undefined' ? this.offset : begin;
    end = typeof end === 'undefined' ? this.limit : end;
    if (!this.noAssert) {
      if (typeof begin !== 'number' || begin % 1 !== 0) throw TypeError("Illegal begin: Not an integer");
      begin >>>= 0;
      if (typeof end !== 'number' || end % 1 !== 0) throw TypeError("Illegal end: Not an integer");
      end >>>= 0;
      if (begin < 0 || begin > end || end > this.buffer.length) throw RangeError("Illegal range: 0 <= " + begin + " <= " + end + " <= " + this.buffer.length);
    }
    return this.buffer.toString("hex", begin, end);
  };

  /**
   * Decodes a hex encoded string to a ByteBuffer.
   * @param {string} str String to decode
   * @param {boolean=} littleEndian Whether to use little or big endian byte order. Defaults to
   *  {@link ByteBuffer.DEFAULT_ENDIAN}.
   * @param {boolean=} noAssert Whether to skip assertions of offsets and values. Defaults to
   *  {@link ByteBuffer.DEFAULT_NOASSERT}.
   * @returns {!ByteBuffer} ByteBuffer
   * @expose
   */
  ByteBuffer.fromHex = function (str, littleEndian, noAssert) {
    if (!noAssert) {
      if (typeof str !== 'string') throw TypeError("Illegal str: Not a string");
      if (str.length % 2 !== 0) throw TypeError("Illegal str: Length not a multiple of 2");
    }
    var bb = new ByteBuffer(0, littleEndian, true);
    bb.buffer = new Buffer(str, "hex");
    bb.limit = bb.buffer.length;
    return bb;
  };

  // utfx-embeddable

  /**
   * utfx-embeddable (c) 2014 Daniel Wirtz <dcode@dcode.io>
   * Released under the Apache License, Version 2.0
   * see: https://github.com/dcodeIO/utfx for details
   */
  var utfx = function () {

    /**
     * utfx namespace.
     * @inner
     * @type {!Object.<string,*>}
     */
    var utfx = {};

    /**
     * Maximum valid code point.
     * @type {number}
     * @const
     */
    utfx.MAX_CODEPOINT = 0x10FFFF;

    /**
     * Encodes UTF8 code points to UTF8 bytes.
     * @param {(!function():number|null) | number} src Code points source, either as a function returning the next code point
     *  respectively `null` if there are no more code points left or a single numeric code point.
     * @param {!function(number)} dst Bytes destination as a function successively called with the next byte
     */
    utfx.encodeUTF8 = function (src, dst) {
      var cp = null;
      if (typeof src === 'number') cp = src, src = function src() {
        return null;
      };
      while (cp !== null || (cp = src()) !== null) {
        if (cp < 0x80) dst(cp & 0x7F);else if (cp < 0x800) dst(cp >> 6 & 0x1F | 0xC0), dst(cp & 0x3F | 0x80);else if (cp < 0x10000) dst(cp >> 12 & 0x0F | 0xE0), dst(cp >> 6 & 0x3F | 0x80), dst(cp & 0x3F | 0x80);else dst(cp >> 18 & 0x07 | 0xF0), dst(cp >> 12 & 0x3F | 0x80), dst(cp >> 6 & 0x3F | 0x80), dst(cp & 0x3F | 0x80);
        cp = null;
      }
    };

    /**
     * Decodes UTF8 bytes to UTF8 code points.
     * @param {!function():number|null} src Bytes source as a function returning the next byte respectively `null` if there
     *  are no more bytes left.
     * @param {!function(number)} dst Code points destination as a function successively called with each decoded code point.
     * @throws {RangeError} If a starting byte is invalid in UTF8
     * @throws {Error} If the last sequence is truncated. Has an array property `bytes` holding the
     *  remaining bytes.
     */
    utfx.decodeUTF8 = function (src, dst) {
      var a,
        b,
        c,
        d,
        fail = function fail(b) {
          b = b.slice(0, b.indexOf(null));
          var err = Error(b.toString());
          err.name = "TruncatedError";
          err['bytes'] = b;
          throw err;
        };
      while ((a = src()) !== null) {
        if ((a & 0x80) === 0) dst(a);else if ((a & 0xE0) === 0xC0) (b = src()) === null && fail([a, b]), dst((a & 0x1F) << 6 | b & 0x3F);else if ((a & 0xF0) === 0xE0) ((b = src()) === null || (c = src()) === null) && fail([a, b, c]), dst((a & 0x0F) << 12 | (b & 0x3F) << 6 | c & 0x3F);else if ((a & 0xF8) === 0xF0) ((b = src()) === null || (c = src()) === null || (d = src()) === null) && fail([a, b, c, d]), dst((a & 0x07) << 18 | (b & 0x3F) << 12 | (c & 0x3F) << 6 | d & 0x3F);else throw RangeError("Illegal starting byte: " + a);
      }
    };

    /**
     * Converts UTF16 characters to UTF8 code points.
     * @param {!function():number|null} src Characters source as a function returning the next char code respectively
     *  `null` if there are no more characters left.
     * @param {!function(number)} dst Code points destination as a function successively called with each converted code
     *  point.
     */
    utfx.UTF16toUTF8 = function (src, dst) {
      var c1,
        c2 = null;
      while (true) {
        if ((c1 = c2 !== null ? c2 : src()) === null) break;
        if (c1 >= 0xD800 && c1 <= 0xDFFF) {
          if ((c2 = src()) !== null) {
            if (c2 >= 0xDC00 && c2 <= 0xDFFF) {
              dst((c1 - 0xD800) * 0x400 + c2 - 0xDC00 + 0x10000);
              c2 = null;
              continue;
            }
          }
        }
        dst(c1);
      }
      if (c2 !== null) dst(c2);
    };

    /**
     * Converts UTF8 code points to UTF16 characters.
     * @param {(!function():number|null) | number} src Code points source, either as a function returning the next code point
     *  respectively `null` if there are no more code points left or a single numeric code point.
     * @param {!function(number)} dst Characters destination as a function successively called with each converted char code.
     * @throws {RangeError} If a code point is out of range
     */
    utfx.UTF8toUTF16 = function (src, dst) {
      var cp = null;
      if (typeof src === 'number') cp = src, src = function src() {
        return null;
      };
      while (cp !== null || (cp = src()) !== null) {
        if (cp <= 0xFFFF) dst(cp);else cp -= 0x10000, dst((cp >> 10) + 0xD800), dst(cp % 0x400 + 0xDC00);
        cp = null;
      }
    };

    /**
     * Converts and encodes UTF16 characters to UTF8 bytes.
     * @param {!function():number|null} src Characters source as a function returning the next char code respectively `null`
     *  if there are no more characters left.
     * @param {!function(number)} dst Bytes destination as a function successively called with the next byte.
     */
    utfx.encodeUTF16toUTF8 = function (src, dst) {
      utfx.UTF16toUTF8(src, function (cp) {
        utfx.encodeUTF8(cp, dst);
      });
    };

    /**
     * Decodes and converts UTF8 bytes to UTF16 characters.
     * @param {!function():number|null} src Bytes source as a function returning the next byte respectively `null` if there
     *  are no more bytes left.
     * @param {!function(number)} dst Characters destination as a function successively called with each converted char code.
     * @throws {RangeError} If a starting byte is invalid in UTF8
     * @throws {Error} If the last sequence is truncated. Has an array property `bytes` holding the remaining bytes.
     */
    utfx.decodeUTF8toUTF16 = function (src, dst) {
      utfx.decodeUTF8(src, function (cp) {
        utfx.UTF8toUTF16(cp, dst);
      });
    };

    /**
     * Calculates the byte length of an UTF8 code point.
     * @param {number} cp UTF8 code point
     * @returns {number} Byte length
     */
    utfx.calculateCodePoint = function (cp) {
      return cp < 0x80 ? 1 : cp < 0x800 ? 2 : cp < 0x10000 ? 3 : 4;
    };

    /**
     * Calculates the number of UTF8 bytes required to store UTF8 code points.
     * @param {(!function():number|null)} src Code points source as a function returning the next code point respectively
     *  `null` if there are no more code points left.
     * @returns {number} The number of UTF8 bytes required
     */
    utfx.calculateUTF8 = function (src) {
      var cp,
        l = 0;
      while ((cp = src()) !== null) l += cp < 0x80 ? 1 : cp < 0x800 ? 2 : cp < 0x10000 ? 3 : 4;
      return l;
    };

    /**
     * Calculates the number of UTF8 code points respectively UTF8 bytes required to store UTF16 char codes.
     * @param {(!function():number|null)} src Characters source as a function returning the next char code respectively
     *  `null` if there are no more characters left.
     * @returns {!Array.<number>} The number of UTF8 code points at index 0 and the number of UTF8 bytes required at index 1.
     */
    utfx.calculateUTF16asUTF8 = function (src) {
      var n = 0,
        l = 0;
      utfx.UTF16toUTF8(src, function (cp) {
        ++n;
        l += cp < 0x80 ? 1 : cp < 0x800 ? 2 : cp < 0x10000 ? 3 : 4;
      });
      return [n, l];
    };
    return utfx;
  }();

  // encodings/utf8

  /**
   * Encodes this ByteBuffer's contents between {@link ByteBuffer#offset} and {@link ByteBuffer#limit} to an UTF8 encoded
   *  string.
   * @returns {string} Hex encoded string
   * @throws {RangeError} If `offset > limit`
   * @expose
   */
  ByteBufferPrototype.toUTF8 = function (begin, end) {
    if (typeof begin === 'undefined') begin = this.offset;
    if (typeof end === 'undefined') end = this.limit;
    if (!this.noAssert) {
      if (typeof begin !== 'number' || begin % 1 !== 0) throw TypeError("Illegal begin: Not an integer");
      begin >>>= 0;
      if (typeof end !== 'number' || end % 1 !== 0) throw TypeError("Illegal end: Not an integer");
      end >>>= 0;
      if (begin < 0 || begin > end || end > this.buffer.length) throw RangeError("Illegal range: 0 <= " + begin + " <= " + end + " <= " + this.buffer.length);
    }
    return this.buffer.toString("utf8", begin, end);
  };

  /**
   * Decodes an UTF8 encoded string to a ByteBuffer.
   * @param {string} str String to decode
   * @param {boolean=} littleEndian Whether to use little or big endian byte order. Defaults to
   *  {@link ByteBuffer.DEFAULT_ENDIAN}.
   * @param {boolean=} noAssert Whether to skip assertions of offsets and values. Defaults to
   *  {@link ByteBuffer.DEFAULT_NOASSERT}.
   * @returns {!ByteBuffer} ByteBuffer
   * @expose
   */
  ByteBuffer.fromUTF8 = function (str, littleEndian, noAssert) {
    if (!noAssert) if (typeof str !== 'string') throw TypeError("Illegal str: Not a string");
    var bb = new ByteBuffer(0, littleEndian, noAssert);
    bb.buffer = new Buffer(str, "utf8");
    bb.limit = bb.buffer.length;
    return bb;
  };

  /**
   * node-memcpy. This is an optional binding dependency and may not be present.
   * @function
   * @param {!(Buffer|ArrayBuffer|Uint8Array)} target Destination
   * @param {number|!(Buffer|ArrayBuffer)} targetStart Destination start, defaults to 0.
   * @param {(!(Buffer|ArrayBuffer|Uint8Array)|number)=} source Source
   * @param {number=} sourceStart Source start, defaults to 0.
   * @param {number=} sourceEnd Source end, defaults to capacity.
   * @returns {number} Number of bytes copied
   * @throws {Error} If any index is out of bounds
   * @expose
   */
  ByteBuffer.memcpy = memcpy;
  return ByteBuffer;
}();
var ByteBuffer = /*@__PURE__*/getDefaultExportFromCjs(bytebufferNode);

var Packer = /*#__PURE__*/function () {
  function Packer(options) {
    _classCallCheck(this, Packer);
    _defineProperty(this, "options", void 0);
    _defineProperty(this, "buffer", void 0);
    _defineProperty(this, "unpacker", void 0);
    this.options = options === undefined ? {
      seqBytesLen: 2,
      routeBytesLen: 2
    } : options;
    var littleEndian = this.options.byteOrder !== undefined && this.options.byteOrder === 'little';
    this.buffer = new ByteBuffer(ByteBuffer.DEFAULT_CAPACITY, littleEndian, ByteBuffer.DEFAULT_NOASSERT);
    this.unpacker = new ByteBuffer(ByteBuffer.DEFAULT_CAPACITY, littleEndian, ByteBuffer.DEFAULT_NOASSERT);
  }
  _createClass(Packer, [{
    key: "pack",
    value: function pack(message) {
      var buffer = this.buffer.clone();
      var seq = message.seq || 0;
      var route = message.route || 0;
      switch (this.options.seqBytesLen) {
        case 1:
          buffer.writeInt8(seq);
          break;
        case 2:
          buffer.writeInt16(seq);
          break;
        case 4:
          buffer.writeInt32(seq);
          break;
      }
      switch (this.options.routeBytesLen) {
        case 1:
          buffer.writeInt8(route);
          break;
        case 2:
          buffer.writeInt16(route);
          break;
        case 4:
          buffer.writeInt32(route);
          break;
      }
      message.buffer && buffer.append(message.buffer);
      return buffer.flip().toArrayBuffer();
    }
  }, {
    key: "unpack",
    value: function unpack(data) {
      var buffer = this.buffer.clone().append(data, 'binary').flip();
      var message = {
        seq: 0,
        route: 0,
        buffer: undefined
      };
      var len = buffer.remaining();
      if (this.options.seqBytesLen) {
        if (this.options.seqBytesLen > buffer.remaining()) {
          return;
        }
        switch (this.options.seqBytesLen) {
          case 1:
            message.seq = buffer.readInt8();
            break;
          case 2:
            message.seq = buffer.readInt16();
            break;
          case 4:
            message.seq = buffer.readInt32();
            break;
        }
        len -= this.options.seqBytesLen;
      }
      if (this.options.routeBytesLen) {
        if (this.options.routeBytesLen > buffer.remaining()) {
          return;
        }
        switch (this.options.routeBytesLen) {
          case 1:
            message.route = buffer.readInt8();
            break;
          case 2:
            message.route = buffer.readInt16();
            break;
          case 4:
            message.route = buffer.readInt32();
            break;
        }
        len -= this.options.routeBytesLen;
      }
      if (len > 0) {
        message.buffer = buffer.readBytes(len);
      }
      return message;
    }
  }, {
    key: "append",
    value: function append(data) {
      this.unpacker.append(data);
      return this;
    }
  }, {
    key: "read",
    value: function read() {
      return {
        seq: 0,
        route: 1,
        buffer: ''
      };
    }
  }]);
  return Packer;
}();

var Client = /*#__PURE__*/function () {
  function Client(opts) {
    _classCallCheck(this, Client);
    _defineProperty(this, "connectHandler", void 0);
    _defineProperty(this, "disconnectHandler", void 0);
    _defineProperty(this, "receiveHandler", void 0);
    _defineProperty(this, "opts", void 0);
    _defineProperty(this, "websocket", void 0);
    _defineProperty(this, "packer", void 0);
    _defineProperty(this, "waitgroup", void 0);
    this.opts = opts;
    this.websocket = undefined;
    this.packer = new Packer({
      byteOrder: opts.byteOrder,
      seqBytesLen: opts.seqBytesLen,
      routeBytesLen: opts.routeBytesLen
    });
    this.waitgroup = new Map();
  }
  _createClass(Client, [{
    key: "connect",
    value: function connect() {
      var _this = this;
      try {
        this.websocket = new WebSocket(this.opts.url);
        this.websocket.binaryType = 'arraybuffer';
        this.websocket.onopen = function (ev) {
          _this.connectHandler && _this.connectHandler();
        };
        this.websocket.onclose = function (ev) {
          _this.disconnectHandler && _this.disconnectHandler();
        };
        this.websocket.onerror = function (ev) {};
        this.websocket.onmessage = function (e) {
          if (e.data.byteLength == 0) {
            return;
          }
          console.log(e.data);
          var message = _this.packer.unpack(e.data);
          console.log(message);
          message && (_this.invoke(message) || _this.receiveHandler && _this.receiveHandler(message));
        };
        return true;
      } catch (error) {
        console.log(error);
        return false;
      }
    }
  }, {
    key: "disconnect",
    value: function disconnect() {
      if (!this.websocket) {
        return;
      }
      var websocket = this.websocket;
      this.websocket = undefined;
      websocket.onclose;
      var onempty = function onempty() {};
      websocket.onopen = onempty;
      websocket.onmessage = onempty;
      websocket.onclose = onempty;
      websocket.onerror = onempty;
      websocket.close();
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
      if (this.isConnected()) {
        var data = this.packer.pack(message);
        console.log(data);
        this.websocket && this.websocket.send(data);
        return true;
      }
      return false;
    }
  }, {
    key: "request",
    value: function request(route, buffer, timeout) {
      var _this2 = this;
      return new Promise(function (resolve, reject) {
        if (_this2.isConnected()) {
          var group = _this2.waitgroup.get(route);
          if (group === undefined) {
            group = {
              seq: 0,
              callback: new Map()
            };
            _this2.waitgroup.set(route, group);
          }
          var seq = ++group.seq;
          group.callback.set(seq, function (message) {
            resolve(message);
          });
          _this2.send({
            seq: seq,
            route: route,
            buffer: buffer
          });
          timeout && timeout > 0 && setTimeout(function () {
            reject();
          }, timeout);
        } else {
          reject();
        }
      });
    }
  }, {
    key: "invoke",
    value: function invoke(message) {
      if (message.seq == 0) {
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

export { Client };
