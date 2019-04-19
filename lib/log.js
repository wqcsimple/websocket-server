/**
 * @author whis admin@wwhis.com
 * @Created 10/27/17
 */
const CONFIG = require('./config');
const log4js = require('log4js');
//  日志配置
if (CONFIG.LOG_OUT === 'stdout') {
    log4js.configure({
        appenders: {
            out: {
                type: 'stdout', layout: {
                    type: 'pattern',
                    pattern: '%[[%d{yyyy-MM-dd hh:mm:ss}] [%p][%c] - %m%n'
                }
            }
        },
        categories: {default: {appenders: ['out'], level: CONFIG.LOG_LEVEL}}
    });
} else {
    log4js.configure({
        appenders: {
            all: {
                type: 'file', filename: 'log/stdout.log', maxLogSize: 10485760, backups: 5, compress: true,
                layout: {
                    type: 'pattern',
                    pattern: '[%d{yyyy-MM-dd hh:mm:ss}] [%p][%c] - %m%n'
                }
            }
        },
        categories: {default: {appenders: ['all'], level: CONFIG.LOG_LEVEL}}
    });
}

let logger = log4js.getLogger();

module.exports = logger;
