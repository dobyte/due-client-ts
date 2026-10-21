# due-client-ts 

### 1.介绍

due是一款基于Go语言开发的轻量级、高性能分布式游戏服务器框架。
其中，模块设计方面借鉴了[kratos](https://github.com/go-kratos/kratos)的模块设计思路，旨在为游戏服务器开发提供完善、高效、标准化的解决方案。
框架自创建至今已在多个企业级游戏项目中上线实践过，稳定性有充分的保障。

### 2.优势

* 💡 简单性：架构简单，源码简洁易理解。
* 🚠 便捷性：仅暴露必要的调用接口，减轻开发者的心智负担。
* 🚀 高性能：框架原生实现集群通信方案，普通机器单线程也能轻松实现20W的TPS。
* 🧊 标准化：框架原生提供标准化的开发规范，无论多么复杂的项目也能轻松应对。
* ✈️ 高效性：框架原生提供tcp、kcp、ws等协议的服务器，方便开发者快速构建各种类型的网关服务器。
* ⚖️ 稳定性：所有发布的正式版本均已通过内部真实业务的严格测试，具备较高的稳定性。
* 🎟️ 扩展性：采用良好的接口设计，方便开发者设计实现自有功能。
* 🔑 平滑性：引入信号量，通过控制服务注册中心来实现优雅地滚动更新。
* 🔩 扩容性：通过优雅的路由分发机制，理论上可实现无限扩容。
* 🔧 易调试：框架原生提供了tcp、kcp、ws等协议的客户端，方便开发者进行独立的调试全流程调试。
* 🧰 可管理：提供完善的后台管理接口，方便开发者快速实现自定义的后台管理功能。

### 3.功能

* 网关：支持tcp、kcp、ws等协议的网关服务器。
* 日志：支持std、zap、logrus、aliyun、tencent等多种日志组件。
* 注册：支持consul、etcd、nacos等多种服务注册中心。
* 协议：支持json、protobuf、msgpack等多种通信协议。
* 配置：支持consul、etcd、nacos等多种配置中心；并支持json、yaml、toml、xml等多种文件格式。
* 通信：支持grpc、rpcx等多种高性能通信方案。
* 重启：支持服务器的平滑重启。
* 事件：支持redis、nats、kafka、rabbitMQ等事件总线实现方案。
* 加密：支持rsa、ecc等多种加密方案。
* 服务：支持grpc、rpcx等多种微服务解决方案。
* 灵活：支持单体、分布式等多种架构方案。
* 管理：提供master后台管理服相关接口支持。
* Web：提供http协议的fiber服务器及swagger文档解决方案。
* 工具：提供[due-cli](https://github.com/dobyte/due-cli)脚手架工具箱，可快速构建集群项目。
* Actor：提供完善actor模型解决方案。

### 4.安装

npm安装

```bash
$ npm install due-client
```

yarn安装

```bash
$ yarn add due-client
```

### 5.使用

```js
import { Client, Packer } from 'due-client';

// 请求数据包
const buffer = (new TextEncoder).encode(JSON.stringify({
    message: 'hello server'
}));

// 创建客户端
const client = new Client({
    url: 'ws://127.0.0.1:3553',
    heartbeat: 10000,
    packer: new Packer({
        byteOrder: 'big',
        seqBytes: 0,
        routeBytes: 4,
        bufferBytes: 5000
    })
});

// 发送请求响应
const request = (c) => {
    let counter = 0;

    let i = setInterval(() => {
        if (counter >= 10) {
            // 清理定时器
            clearInterval(i);
            // 关闭连接
            c.disconnect();
        }

        // 发送消息
        try {
            c.request(1, buffer, 2000).then((message) => {
                console.log('response message: ', (new TextDecoder).decode(message.buffer));
            }).catch(() => {
                console.log('reject');
            });

            counter++;
        } catch (error) {
            console.log(error);
        }
    }, 1000);
}

// 发送异步消息
const send = (c) => {
    let counter = 0;

    let i = setInterval(() => {
        if (counter >= 10) {
            // 清理定时器
            clearInterval(i);
            // 关闭连接
            c.disconnect();
        }

        // 发送消息
        try {
            c.send({
                route: 1,
                buffer: buffer
            });

            counter++;
        } catch (error) {
            console.log(error);
        }
    }, 1000);
}

// 监听连接
client.onConnect((c) => {
    console.log('connect success');

    // 发送同步请求，需要客户端和服务器同时开启seq配置
    request(c);

    // 发送异步消息
    // send(c);
});

// 监听连接断开
client.onDisconnect((c) => {
    console.log('disconnect success');

    // 重新连接
    c.connect();
});

// 监听接收到消息
client.onReceive((c, message) => {
    console.log('receive message: ', (new TextDecoder).decode(message.buffer));
});

// 监听接受服务器的心跳附带的服务器时间
client.onHeartbeat((c, millisecond) => {
    millisecond && console.log("server heartbeat timestamp: ", millisecond);
});

// 建立连接
client.connect();
```

### 6.会话安全（security）

客户端支持与 due 网关进行会话安全握手，握手完成后业务消息自动加解密。协议与 due 服务端 `core/security/handshake` 保持一致：

1. 客户端发送 `ClientHello`：random(32) | X25519 公钥(32) | 套件数量(1) | 套件列表
2. 服务端回复 `ServerHello`：套件(1) | random(32) | X25519 公钥(32) | 签名长度(2) | 签名 | MAC(32)
3. 客户端校验签名与 MAC 后发送 `Finished`，握手完成

会话数据使用 AEAD 加密，封包格式为 `epoch(1) | counter(8) | ciphertext | tag`，AAD 绑定 version、direction、epoch、route 与 seq。

#### 6.1 启用方式

```js
import { Client, Packer, Verifier, DEFAULT_SUITES } from 'due-client';

const client = new Client({
    url: 'ws://127.0.0.1:3553',
    heartbeat: 10000,
    packer: new Packer({
        byteOrder: 'big',
        seqBytes: 4,
        routeBytes: 4,
        bufferBytes: 5000
    }),
    security: {
        // 服务端签名校验器
        verifier: Verifier.ecdsa(publicKey, 'sha256', ' '),
        // 可选，默认 [AES-256-GCM, ChaCha20-Poly1305]
        suites: DEFAULT_SUITES,
        // 可选，握手超时时间（毫秒），默认 5000，小于等于 0 表示不限制
        handshakeTimeout: 5000
    }
});

// 握手成功后才触发 onConnect
client.onConnect((c) => {
    // 此处收发的业务消息已自动加解密
});

// 签名校验失败、握手超时等会触发 onError，并关闭连接
client.onError(() => {
    console.log('connect error');
});

client.connect();
```

未配置 `security` 时保持原有明文通信行为。

#### 6.2 签名校验器

签名校验器与服务端 `[crypto.ecc.signer]` / `[crypto.rsa.signer]` 配置对应，公钥支持 PEM、base64 或 DER：

```js
// ECDSA，支持 P-256 / P-384 / P-521；签名格式为 “r<分隔符>s” 的十进制文本
Verifier.ecdsa(publicKey, 'sha256', ' ');

// RSA，默认 PSS 填充；pss 为 false 时使用 PKCS#1 v1.5
Verifier.rsa(publicKey, 'sha256', true);
```

注意：

- `hash` 必须与服务端 `[crypto.ecc.signer] hash` / `[crypto.rsa.signer] hash` 一致
- `delimiter` 必须与服务端 `delimiter` 一致（默认空格）
- 服务端未开启会话安全时不要配置 `security`，否则握手会失败

#### 6.3 参数说明

| 参数 | 必填 | 说明 |
| --- | --- | --- |
| `verifier` | 是 | 服务端签名校验器，由 `Verifier.ecdsa` / `Verifier.rsa` 创建 |
| `suites` | 否 | 允许协商的 AEAD 套件，默认 `DEFAULT_SUITES` |
| `handshakeTimeout` | 否 | 握手超时时间（毫秒），默认 5000，小于等于 0 表示不限制 |
| `random` | 否 | 随机字节源 `(length) => Uint8Array`；运行环境无 `crypto.getRandomValues` 时需注入 |

#### 6.4 打包器与容量

- `byteOrder`、`routeBytes`、`seqBytes`、`bufferBytes` 必须与网关的 `[packet]` 配置一致
- 使用 `request()` 或依赖回包匹配时应开启 seq（`seqBytes > 0`）
- 启用 security 时，业务明文上限为 `bufferBytes - 25`（epoch 1 + counter 8 + tag 16），超限会触发 `message too large`

#### 6.5 导出的安全能力

```js
export {
    HandshakeClient,      // 握手客户端
    SecureSession,        // 安全会话，seal/open 业务载荷
    Direction,            // 消息方向
    makeAAD,              // AAD 构造
    Verifier,             // 内置签名校验器
    parsePublicKey,       // PEM/base64/DER 公钥解析
    DEFAULT_SUITES,
    SUITE_AES_GCM,
    SUITE_CHACHA20_POLY1305
};
```

## License

[MIT](https://tldrlegal.com/license/mit-license)