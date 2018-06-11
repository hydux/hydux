import * as tslib_1 from "tslib";
import { connectViaExtension, extractState } from 'remotedev';
import Cmd from '../cmd';
import { normalizeInit } from './../index';
export default function withDevtools(_options) {
    if (_options === void 0) { _options = {}; }
    var options = tslib_1.__assign({ remote: false, hostname: 'remotedev.io', port: 443, secure: true, getActionType: function (f) { return f; }, debounce: 10, filter: function (_) { return true; }, jsonToState: function (f) { return f; }, stateToJson: function (f) { return f; } }, _options);
    var jsonToState = options.jsonToState, stateToJson = options.stateToJson;
    var connection = connectViaExtension(options);
    var timer;
    return function (app) { return function (props) {
        var ctx = app(tslib_1.__assign({}, props, { init: function () {
                var result = normalizeInit(props.init());
                connection.init(stateToJson(result.state));
                return result;
            }, onUpdate: function (data) {
                props.onUpdate && props.onUpdate(data);
                if (!options.filter(data.action)) {
                    return;
                }
                var send = function () { return connection.send({
                    type: 'update',
                    msg: { data: data.msgData, type: data.action },
                }, stateToJson(data.nextAppState)); };
                timer && clearTimeout(timer);
                timer = setTimeout(send, options.debounce);
            }, subscribe: function (model) {
                function sub(actions) {
                    connection.subscribe(function (msg) {
                        if (msg.type === 'DISPATCH') {
                            switch (msg.payload.type) {
                                case 'JUMP_TO_ACTION':
                                case 'JUMP_TO_STATE':
                                    ctx.render(jsonToState(extractState(msg)));
                                    break;
                                case 'IMPORT_STATE':
                                    var states = msg.payload.nextLiftedState.computedStates;
                                    var state = states[states.length - 1];
                                    ctx.render(jsonToState(state.state));
                                    connection.send(null, msg.payload.nextLiftedState);
                            }
                        }
                    });
                }
                return props.subscribe
                    ? Cmd.batch([sub], props.subscribe(model))
                    : [sub];
            } }));
        return ctx;
    }; };
}
//# sourceMappingURL=devtools.js.map