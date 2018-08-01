/**
 * @author whis admin@wwhis.com
 * @Created 10/27/17
 */
let log4js = require('log4js');

//  日志配置
log4js.configure({
    appenders: {
        out: { type: 'stdout' },
    },
    categories: {
        default: { appenders: [ 'out' ], level: 'debug' }
    }
});

let logger = log4js.getLogger();

module.exports = logger;