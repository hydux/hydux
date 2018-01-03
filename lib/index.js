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
var cmd_1 = require("./cmd");
exports.Cmd = cmd_1.default;
var utils_1 = require("./utils");
exports.noop = utils_1.noop;
/**
 * run action and return a normalized result ([State, CmdType<>]),
 * this is useful to write High-Order-Action, which take an action and return a wrapped action.
 * @param action
 * @param msg
 * @param state
 * @param actions
 */
function runAction(action, msg, state, actions) {
    var result = action(msg);
    utils_1.isFn(result) && (result = result(state, actions)) &&
        utils_1.isFn(result) && (result = result(actions));
    // action can be a function that return a promise or undefined(callback)
    if (result === undefined ||
        (result.then && utils_1.isFn(result.then))) {
        return [state, cmd_1.default.none];
    }
    if (result instanceof Array) {
        return result;
    }
    return [result, cmd_1.default.none];
}
exports.runAction = runAction;
function app(props) {
    // const appEvents = props.events || {}
    var appActions = {};
    var appSubscribe = props.subscribe || (function (_) { return cmd_1.default.none; });
    var render = props.onRender || utils_1.noop;
    var onError = props.onError || utils_1.noop;
    // const appMiddlewares = props.middlewares || []
    var _a = runAction(props.init, void 0, void 0, appActions), appState = _a[0], cmd = _a[1];
    init(appState, appActions, props.actions, []);
    cmd.forEach(function (sub) { return sub(appActions); });
    appRender(appState);
    appSubscribe(appState).forEach(function (sub) { return sub(appActions); });
    return __assign({}, props, { actions: appActions, getState: function () { return appState; }, render: appRender });
    function appRender(state) {
        if (state === void 0) { state = appState; }
        if (state !== appState) {
            appState = state;
        }
        var view;
        if (utils_1.isFn(view = props.view(appState, appActions))) {
            view = view(appActions);
        }
        try {
            return render(view);
        }
        catch (err) {
            console.error(err);
            onError(err);
        }
    }
    function init(state, actions, from, path) {
        for (var key in from) {
            utils_1.isFn(from[key])
                ? (function (key, action) {
                    actions[key] = function (msgData) {
                        state = utils_1.get(path, appState);
                        // action = appMiddlewares.reduce((action, fn) => fn(action, key, path), action)
                        var nextState = state;
                        var nextAppState = appState;
                        var cmd = cmd_1.default.none;
                        try {
                            _a = runAction(action, msgData, state, actions), nextState = _a[0], cmd = _a[1];
                        }
                        catch (error) {
                            console.error(error);
                            onError(error);
                        }
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
                })(key, from[key])
                : init(state[key] || (state[key] = {}), (actions[key] = {}), from[key], path.concat(key));
        }
    }
}
exports.default = app;
//# sourceMappingURL=index.js.map