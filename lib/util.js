/**
 * @author whis admin@wwhis.com
 * @Created 3/2/17
 */

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

function time() {
    return parseInt(new Date().getTime() / 1000, 10);
}

function validateObjectKey(object, keys) {
    if (!object) {
        return;
    }
    if (!object instanceof Object) {
        return;
    }
    for (var i in keys) {
        if (keys.hasOwnProperty(i)) {
            var key = keys[i];
            if (object[key] === undefined) {
                Log.error(Util.sprintf('invalid object, %s', object));
                Log.error(Util.sprintf('key [%s] undefined', key));
                return false;
            }
        }
    }
    return true;
}

function parseJson(json) {
    try {
        return JSON.parse(json);
    }
    catch (e) {
    }
    return null;
}

let Util = {
    sprintf: require('locutus/php/strings/sprintf'),
    rand: require('locutus/php/math/rand'),

    time: time,
    validateObjectKey: validateObjectKey,
    parseJson: parseJson
};

module.exports = Util;