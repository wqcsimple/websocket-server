/**
 * @author whis admin@wwhis.com
 * @Created 5/14/17
 */
const Util = require('../../lib/util');
const log4js = require('log4js');
const Redis = require('ioredis');
const Const = require('../../lib/const');
const Config = require('../../lib/config');

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

let redis = new Redis(Config.REDIS_PORT, Config.REDIS_HOST, {password: Config.REDIS_PASS});

redis.psubscribe('__key*__:*', function (err, count) {
    Log.info(`server: subscribe, err: ${err}, count: ${count}`);
});
redis.on('pmessage', function (pattern, channel, rawMessage) {
    Log.info(`server: receive message: ${rawMessage} from channel: ${channel}`);
    CoreRedis.processMessage(channel, rawMessage);
});
redis.on('pmessageBuffer', function (pattern, channel, message) {
    // console.log('p message buffer')
    // console.log(message);
});


let CoreRedis = {
    processMessage: (channel, rawMessage) => {
        // let message = Util.parseJson(rawMessage);

        if (channel === '__keyevent@0__:expired')
        {
            Log.debug(rawMessage);
        }

    }
};