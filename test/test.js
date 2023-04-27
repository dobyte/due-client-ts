const { Client } = require('../dist/index.js')

// console.log(Packer);



// const packer = new Packer({
//     byteOrder: 'little',
//     seqBytesLen: 2,
//     routeBytesLen: 2,
// })

// const buf = packer.pack({
//     seq: 10,
//     route: 1,
//     buffer: 'acb'
// });

// console.log(buf)

const client = new Client({
    url: 'ws://127.0.0.1:3553',
    byteOrder: 'little',
    seqBytesLen: 2,
    routeBytesLen: 2,
});

// 监听连接
client.onConnect(() => {
    console.log('connect');
})

client.connect();

console.log(client);