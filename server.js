/**
 * @author whis admin@wwhis.com
 * @Created 3/2/17
 */
const request = require('request');
const engine = require('engine.io');
const Q = require('q');
const Redis = require('ioredis');

const Const = require('./lib/const');
const Config = require('./lib/config');
const Util = require('./lib/util');
let Log = require('./lib/log');


let http = require('http').createServer().listen(Config.PORT);
let server = engine.attach(http, {path: '/whis-message'});


/**
 * message {
 *      type,
 *      data,
 *      time
 * }
 *
 * type 1: 客户端登录
 *
 * type 2: 服务端事件
 *      data:
 *          event 1 更新
 *          target_id
 *          target_type
 *          data
 *
 */
let Context = {};
Context.socket_list = {};
Context.user_socket_list = {};

let Message = {
    Const: {
        TYPE_LOGIN: 1,
        TYPE_DATA: 2,
    },

    create: (type, data) => {
        return JSON.stringify({
            type: type,
            data: data,
            time: Util.time()
        });
    },

    makeDataMessage: (data) => {
        return Message.create(Message.Const.TYPE_DATA, data);
    },

    validate: (message) => {
        return Util.validateObjectKey(message, ['type', 'data', 'time']);
    }
};

let ServerUtil = {
    // 此处做验证
    getUserFromToken: function (token) {
        let deferred = Q.defer();
        if (token) {
            let response = {
                user_id: Util.rand(1, 100),
                name: "whis",
                user_type: 1,
            };

            deferred.resolve(response);
        } else {
            let error = {
                code: -1,
                message: "token not set"
            };

            deferred.reject(error);
        }
        return deferred.promise;
    }
};

let CoreMessage = {
    processLogin: (socket, message) => {
        let data = message.data;
        if (Util.validateObjectKey(data, ['token'])) {
            let token = data.token;

            ServerUtil.getUserFromToken(token).then(
                data => {
                    let user_id = data.user_id;
                    let user_type = data.user_type;
                    let user_key = getUserKey(user_id, user_type);
                    let socket_id = socket.id;

                    socket[Const.SOCKET_KEY_USER_KEY] = user_key;

                    if (!Context.user_socket_list.hasOwnProperty(user_key)) {
                        Context.user_socket_list[user_key] = {};
                    }

                    Context.user_socket_list[user_key][socket_id] = socket_id;

                    Log.debug(`socket ${socket.id} - user ${user_key} added`);
                }
            )
        } else {
            CoreSocket.remove(socket);
        }
    }
};

let CoreSocket = {
    setup: (socket) => {
        Context.socket_list[socket.id] = socket;
    },

    debugStatus: () => {
        Log.debug(Context.socket_list);
        Log.debug(Context.user_socket_list);
    },

    remove: (socket) => {
        let socket_id = socket.id;
        let user_key = socket[Const.SOCKET_KEY_USER_KEY];
        Context.socket_list[socket_id] = null;
        delete Context.socket_list[socket_id];

        if (Context.user_socket_list.hasOwnProperty(user_key)) {
            let user_socket = Context.user_socket_list[user_key];
            if (user_socket instanceof Object) {
                if (user_socket.hasOwnProperty(socket_id)) {
                    delete user_socket[socket_id];
                    Context.user_socket_list[user_key] = user_socket;
                }
            }
        }

        if (socket.readyState !== 'closing' && socket.readyState !== 'closed') {
            socket.close();
        }

        socket = null;
    },

    writeToUserSocket: (user_key, data) => {

        if (Context.user_socket_list.hasOwnProperty(user_key)) {
            let socket_id_list = Context.user_socket_list[user_key];

            if (socket_id_list instanceof Object) {
                for (let key in socket_id_list) {
                    if (socket_id_list.hasOwnProperty(key) && Context.socket_list.hasOwnProperty(key)) {
                        let socket = Context.socket_list[key];
                        Log.debug(`write data to socket: ${key}`);
                        socket.send(Message.makeDataMessage(data));
                    }
                }
            }
        }
    },

    writeToAllUserSocket: (data) => {
          let socket_user_list = Context.user_socket_list;
          for (let user_key in socket_user_list) {
              CoreSocket.writeToUserSocket(user_key, data);
          }
    },

    onMessage: (socket, data) => {
        let message = Util.parseJson(data);
        if (Message.validate(message)) {
            let type = message.type;
            switch (type) {
                case Message.Const.TYPE_LOGIN:
                    CoreMessage.processLogin(socket, message);
                    break;
            }
        }
        else {
            CoreSocket.remove(socket);
        }
    },

    onClose: function (socket) {
        CoreSocket.remove(socket);
    }
};


server.on("connection", (socket) => {
    CoreSocket.setup(socket);

    socket.on("message", (data) => {
        CoreSocket.onMessage(socket, data);
    });

    socket.on("close", () => {
        CoreSocket.onClose(socket);
    })
});


let redis = new Redis(Config.REDIS_PORT, Config.REDIS_HOST, {password: Config.REDIS_PASS});

redis.subscribe(Const.Redis.KEY_SMARTWORK_WEBSOCKET_MESSAGE, (err, count) => {
    Log.info(`server: subscribe, err: ${err}, count: ${count}`);
});

redis.on("message", (channel, rawMessage) => {
    Log.info(`server: receive message: ${rawMessage} from channel: ${channel}`);
    CoreRedis.processMessage(channel, rawMessage);
});

let CoreRedis = {
    processMessage: (channel, rawMessage) => {

        let message = Util.parseJson(rawMessage);

        if (Util.validateObjectKey(message, ['event', 'user_id', 'user_type', 'data', 'time'])) {
            // 推送给指定id的用户
            // let user_type = message.user_type;
            //
            // let user_id = message.user_id;
            // if (typeof user_id != 'string') {
            //     user_id = user_id.toString();
            // }
            // let user_id_list = user_id.split(',');
            // for (let i in user_id_list) {
            //     let user_id = user_id_list[i];
            //     let user_key = getUserKey(user_id, user_type);
            //     if (Context.user_socket_list.hasOwnProperty(user_key)) {
            //         CoreSocket.writeToUserSocket(user_key, message);
            //     } else {
            //         Log.info('user key not exists');
            //     }
            // }

            // 推送给已经注册socket的用户
            CoreSocket.writeToAllUserSocket(message);
        }
    }
};

function getUserKey(user_id, user_type) {
    return `${user_type}:${user_id}`;
}