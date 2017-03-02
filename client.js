/**
 * @author whis admin@wwhis.com
 * @Created 3/2/17
 */
const Redis = require('ioredis');
const Const = require('./lib/const.js');
const Config = require('./lib/config.js');
const Util = require('./lib/util.js');

let net = require('net');

const log4js = require('log4js');

//  日志配置
log4js.configure({
    appenders: [{
        type: 'console',
        layout: {
            pattern: '[%r] [%p][%c] - %m%n'
        }
    }]
});
let Log = log4js.getLogger();

let redis = new Redis(Config.REDIS_PORT, Config.REDIS_HOST);

let sys = require("sys");
let stdin = process.openStdin();

stdin.addListener("data", (d) => {
    let s = d.toString().trim();
    switch (s) {
        case "1":
            redis.publish(Const.Redis.KEY_SMARTWORK_WEBSOCKET_MESSAGE, JSON.stringify({
                event: 1,
                user_id: '1,2,3',
                user_type: 1,
                target_id: 2,
                target_type: 3,
                data: {
                    message: 'whis'
                },
                time: Util.time()
            }));

            Log.info('publish');
            break;
    }
});

