"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var remotedev_1 = require("remotedev");
var cmd_1 = require("../cmd");
function withDevtools(options) {
    options = __assign({ remote: false, hostname: 'remotedev.io', port: 443, secure: true, getActionType: function (f) { return f; }, debounce: 10 }, options);
    var connection = remotedev_1.connectViaExtension(options);
    var timer;
    return function (app) { return function (props) {
        var ctx = app(__assign({}, props, { init: function () {
                var result = props.init();
                var state = (result instanceof Array) ? result[0] : result;
                connection.init(state);
                return result;
            }, onUpdate: function (data) {
                props.onUpdate && props.onUpdate(data);
                var send = function () { return connection.send({
                    type: 'update',
                    msg: { data: data.msgData, type: data.action },
                }, data.nextAppState); };
                timer && clearTimeout(timer);
                timer = setTimeout(send, options.debounce);
            }, subscribe: function (model) {
                function sub(actions) {
                    connection.subscribe(function (msg) {
                        console.log('msg', msg);
                        if (msg.type === 'DISPATCH') {
                            switch (msg.payload.type) {
                                case 'JUMP_TO_ACTION':
                                case 'JUMP_TO_STATE':
                                    ctx.render(remotedev_1.extractState(msg));
                                    break;
                                case 'IMPORT_STATE':
                                    var states = msg.payload.nextLiftedState.computedStates;
                                    var state = states[states.length - 1];
                                    console.log('state', state, msg);
                                    ctx.render(state.state);
                                    connection.send(null, msg.payload.nextLiftedState);
                            }
                        }
                    });
                }
                return props.subscribe
                    ? cmd_1.default.batch([sub], props.subscribe(model))
                    : [sub];
            }, onError: function (err) {
                props.onError && props.onError(err);
                connection.error(err.message);
            } }));
        return ctx;
    }; };
}
exports.default = withDevtools;
//# sourceMappingURL=devtools.js.map