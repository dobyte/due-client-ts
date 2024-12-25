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
                document.write('response message: ', (new TextDecoder).decode(message.buffer), '<br/>');
            }).catch(() => {
                document.write('reject', '<br/>');
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
    document.write('connect success', '<br/>');

    // 发送同步请求，需要客户端和服务器同时开启seq配置
    request(c);

    // 发送异步消息
    // send(c);
});

// 监听连接断开
client.onDisconnect((c) => {
    document.write('disconnect success', '<br/>');

    // 重新连接
    c.connect();
});

// 监听接收到消息
client.onReceive((c, message) => {
    document.write('receive message: ', (new TextDecoder).decode(message.buffer), '<br/>');
});

// 监听接受服务器的心跳附带的服务器时间
client.onHeartbeat((c, millisecond) => {
    millisecond && document.write("server heartbeat timestamp: ", millisecond, '<br/>');
});

// 建立连接
client.connect();
```

## License

[MIT](https://tldrlegal.com/license/mit-license)