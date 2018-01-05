"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var cmd_1 = require("./cmd");
exports.Cmd = cmd_1.default;
var utils_1 = require("./utils");
exports.noop = utils_1.noop;
/**
 * run action and return a normalized result ([State, CmdType<>]),
 * this is useful to write High-Order-Action, which take an action and return a wrapped action.
 * @param result result of `action(msg: Data)`
 * @param state
 * @param actions
 */
function runAction(result, state, actions) {
    var _result = result;
    utils_1.isFn(_result) && (_result = _result(state, actions)) &&
        utils_1.isFn(_result) && (_result = _result(actions));
    // action can be a function that return a promise or undefined(callback)
    if (_result === undefined ||
        (_result.then && utils_1.isFn(_result.then))) {
        return [state, cmd_1.default.none];
    }
    if (_result instanceof Array) {
        return _result;
    }
    return [_result, cmd_1.default.none];
}
exports.runAction = runAction;
function app(props) {
    // const appEvents = props.events || {}
    var appActions = {};
    var appSubscribe = props.subscribe || (function (_) { return cmd_1.default.none; });
    var render = props.onRender || utils_1.noop;
    // const appMiddlewares = props.middlewares || []
    var _a = runAction(props.init(), void 0, appActions), appState = _a[0], cmd = _a[1];
    init(appState, appActions, props.actions, []);
    cmd.forEach(function (sub) { return sub(appActions); });
    appRender(appState);
    appSubscribe(appState).forEach(function (sub) { return sub(appActions); });
    return tslib_1.__assign({}, props, { actions: appActions, getState: function () { return appState; }, render: appRender });
    function appRender(state) {
        if (state === void 0) { state = appState; }
        if (state !== appState) {
            appState = state;
        }
        var view;
        if (utils_1.isFn(view = props.view(appState, appActions))) {
            view = view(appActions);
        }
        return render(view);
    }
    function init(state, actions, from, path) {
        var _loop_1 = function (key) {
            if (/^_/.test(key)) {
                return "continue";
            }
            var subFrom = from[key];
            if (utils_1.isFn(subFrom)) {
                actions[key] = function () {
                    var msgData = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        msgData[_i] = arguments[_i];
                    }
                    state = utils_1.get(path, appState);
                    // action = appMiddlewares.reduce((action, fn) => fn(action, key, path), action)
                    var nextState = state;
                    var nextAppState = appState;
                    var cmd = cmd_1.default.none;
                    _a = runAction(subFrom.apply(from, msgData), state, actions), nextState = _a[0], cmd = _a[1];
                    if (props.onUpdate) {
                        nextAppState = utils_1.setDeep(path, utils_1.merge(state, nextState), appState);
                        props.onUpdate({
                            prevAppState: appState,
                            nextAppState: nextAppState,
                            msgData: msgData,
                            action: path.concat(key).join('.')
                        });
                    }
                    if (nextState !== state) {
                        appState = nextAppState !== appState
                            ? nextAppState
                            : utils_1.setDeep(path, utils_1.merge(state, nextState), appState);
                        appRender(appState);
                    }
                    cmd.forEach(function (sub) { return sub(actions); });
                    var _a;
                };
            }
            else if (typeof subFrom === 'object' && subFrom) {
                init(state[key] || (state[key] = {}), (actions[key] = utils_1.clone(subFrom)), subFrom, path.concat(key));
            }
        };
        for (var key in from) {
            _loop_1(key);
        }
    }
}
exports.default = app;
//# sourceMappingURL=index.js.map