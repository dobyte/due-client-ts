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

var BIG_ENDIAN = 'big';
var DEFAULT_BYTE_ORDER = BIG_ENDIAN;
var DEFAULT_SIZE_BYTES = 4;
var DEFAULT_HEADER_BYTES = 1;
var DEFAULT_ROUTE_BYTES = 2;
var DEFAULT_SEQ_BYTES = 2;
var DEFAULT_TIMESTAMP_BYTES = 8;
var Packer = /*#__PURE__*/function () {
  function Packer(opts) {
    _classCallCheck(this, Packer);
    _defineProperty(this, "opts", void 0);
    _defineProperty(this, "heartbeat", void 0);
    this.opts = opts || {
      byteOrder: DEFAULT_BYTE_ORDER,
      routeBytes: DEFAULT_ROUTE_BYTES,
      seqBytes: DEFAULT_SEQ_BYTES
    };
    this.opts.byteOrder = this.opts.byteOrder !== undefined ? this.opts.byteOrder : DEFAULT_BYTE_ORDER;
    this.opts.routeBytes = this.opts.routeBytes !== undefined ? this.opts.routeBytes : DEFAULT_ROUTE_BYTES;
    this.opts.seqBytes = this.opts.seqBytes !== undefined ? this.opts.seqBytes : DEFAULT_SEQ_BYTES;
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
      dataView.setUint32(offset, DEFAULT_HEADER_BYTES);
      offset += DEFAULT_SIZE_BYTES;
      dataView.setUint8(offset, 1 << 7);
      offset += DEFAULT_HEADER_BYTES;
      return arrayBuffer;
    }
  }, {
    key: "packMessage",
    value: function packMessage(message) {
      var seq = message.seq || 0;
      var route = message.route || 0;
      var offset = 0;
      var size = DEFAULT_HEADER_BYTES + (this.opts.routeBytes || 0) + (this.opts.seqBytes || 0) + (message.buffer ? message.buffer.length : 0);
      var arrayBuffer = new ArrayBuffer(DEFAULT_SIZE_BYTES + size);
      var dataView = new DataView(arrayBuffer);
      dataView.setUint32(offset, size);
      offset += DEFAULT_SIZE_BYTES;
      dataView.setUint8(offset, 0);
      offset += DEFAULT_HEADER_BYTES;
      switch (this.opts.routeBytes) {
        case 1:
          dataView.setInt8(offset, route);
          break;
        case 2:
          dataView.setInt16(offset, route);
          break;
        case 4:
          dataView.setInt32(offset, route);
          break;
      }
      offset += this.opts.routeBytes || 0;
      switch (this.opts.seqBytes) {
        case 1:
          dataView.setInt8(offset, seq);
          break;
        case 2:
          dataView.setInt16(offset, seq);
          break;
        case 4:
          dataView.setInt32(offset, seq);
          break;
      }
      offset += this.opts.seqBytes || 0;
      if (message.buffer) {
        for (var i = 0; i < message.buffer.length; i++) {
          dataView.setUint8(offset, message.buffer[i]);
          offset += 1;
        }
      }
      return arrayBuffer;
    }
  }, {
    key: "unpack",
    value: function unpack(data) {
      var offset = 0;
      var dataView = new DataView(data);
      var size = dataView.getUint32(offset);
      offset += DEFAULT_SIZE_BYTES;
      var header = dataView.getUint8(offset);
      offset += DEFAULT_HEADER_BYTES;
      var isHeartbeat = header >> 7 == 1;
      if (isHeartbeat) {
        if (size + DEFAULT_SIZE_BYTES > offset) {
          var millisecond = Number(dataView.getBigUint64(offset).toString());
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
        if (this.opts.routeBytes) {
          switch (this.opts.routeBytes) {
            case 1:
              message.route = dataView.getInt8(offset);
              break;
            case 2:
              message.route = dataView.getInt16(offset);
              break;
            case 4:
              message.route = dataView.getInt32(offset);
              break;
          }
        }
        offset += this.opts.routeBytes || 0;
        switch (this.opts.seqBytes) {
          case 1:
            message.seq = dataView.getInt8(offset);
            break;
          case 2:
            message.seq = dataView.getInt16(offset);
            break;
          case 4:
            message.seq = dataView.getInt32(offset);
            break;
        }
        offset += this.opts.seqBytes || 0;
        if (size + DEFAULT_SIZE_BYTES > offset) {
          message.buffer = new Uint8Array(data, offset);
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
    _defineProperty(this, "buffer", void 0);
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
        this.websocket = new WebSocket(this.opts.url);
        this.websocket.binaryType = 'arraybuffer';
        this.websocket.onopen = function (ev) {
          _this.heartbeat();
          _this.connectHandler && _this.connectHandler();
        };
        this.websocket.onclose = function (ev) {
          _this.disconnectHandler && _this.disconnectHandler();
        };
        this.websocket.onerror = function (ev) {
          _this.errorHandler && _this.errorHandler();
        };
        this.websocket.onmessage = function (e) {
          if (e.data.byteLength == 0) {
            return;
          }
          var packet = _this.packer.unpack(e.data);
          if (packet.isHeartbeat) {
            _this.heartbeatHandler && _this.heartbeatHandler(packet.millisecond);
          } else {
            if (packet.message) {
              if (!_this.invoke(packet.message)) {
                _this.receiveHandler && _this.receiveHandler(packet.message);
              } else {}
            }
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
      this.intervalId && clearInterval(this.intervalId);
      this.intervalId = null;
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
        if (_this3.isConnected()) {
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
          if (timeout && timeout > 0) {
            timeoutId = setTimeout(function () {
              reject();
            }, timeout);
          }
          group.callback.set(seq, function (message) {
            timeoutId && clearTimeout(timeoutId);
            resolve(message);
          });
          _this3.send({
            seq: seq,
            route: route,
            buffer: buffer
          });
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

export { Client, Packer };
