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
      dataView.setUint8(offset, 1 << 7);
      offset += DEFAULT_HEADER_BYTES;
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
      var header = dataView.getUint8(offset);
      offset += DEFAULT_HEADER_BYTES;
      var isHeartbeat = header >> 7 == 1;
      if (isHeartbeat) {
        if (size + DEFAULT_SIZE_BYTES > offset) {
          var millisecond = Number(dataView.getBigUint64(offset, isLittleEndian).toString());
          offset += DEFAULT_TIMESTAMP_BYTES;
          return {
            isHeartbeat: isHeartbeat,
            millisecond: millisecond
          };
        } else {
          return {
            isHeartbeat: isHeartbeat
          };
        }
      } else {
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
          message: message
        };
      }
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
    _defineProperty(this, "errorHandler", void 0);
    _defineProperty(this, "heartbeatHandler", void 0);
    _defineProperty(this, "opts", void 0);
    _defineProperty(this, "websocket", void 0);
    _defineProperty(this, "intervalId", void 0);
    _defineProperty(this, "packer", void 0);
    _defineProperty(this, "waitgroup", void 0);
    this.opts = opts;
    this.websocket = undefined;
    this.packer = opts.packer || new Packer(opts.packer);
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
          _this.heartbeat();
          _this.connectHandler && _this.connectHandler(_this);
        };
        websocket.onclose = function () {
          if (_this.websocket !== websocket) {
            return;
          }
          _this.stopHeartbeat();
          _this.disconnectHandler && _this.disconnectHandler(_this);
        };
        websocket.onerror = function () {
          _this.errorHandler && _this.errorHandler(_this);
        };
        websocket.onmessage = function (e) {
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
          if (packet.isHeartbeat) {
            _this.heartbeatHandler && _this.heartbeatHandler(_this, packet.millisecond);
          } else {
            packet.message && (_this.invoke(packet.message) || _this.receiveHandler && _this.receiveHandler(_this, packet.message));
          }
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
      var _this2 = this;
      if (!this.opts.heartbeat || this.opts.heartbeat <= 0) {
        return;
      }
      var data = this.packer.packHeartbeat();
      this.intervalId = setInterval(function () {
        _this2.isConnected() && _this2.websocket && _this2.websocket.send(data);
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
      if (this.isConnected()) {
        var data = this.packer.packMessage(message);
        this.websocket && this.websocket.send(data);
        return true;
      }
      return false;
    }
  }, {
    key: "request",
    value: function request(route, buffer, timeout) {
      var _this3 = this;
      return new Promise(function (resolve, reject) {
        if (!_this3.isConnected()) {
          reject(new Error('client not connected'));
          return;
        }
        var group = _this3.waitgroup.get(route);
        if (group === undefined) {
          group = {
            seq: 0,
            callback: new Map()
          };
          _this3.waitgroup.set(route, group);
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
          if (!_this3.send({
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
exports.Packer = Packer;
