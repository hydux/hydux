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
function normalizeActionResult(result, state, actions) {
    utils_1.isFunction(result) && (result = result(state));
    utils_1.isFunction(result) && (result = result(actions));
    if (result instanceof Array) {
        return result;
    }
    return [result, cmd_1.default.none];
}
function app(props) {
    // const appEvents = props.events || {}
    var appActions = {};
    var appSubscribe = props.subscribe || (function (_) { return cmd_1.default.none; });
    var render = props.render || console.log;
    var onError = props.onError || utils_1.noop;
    // const appMiddlewares = props.middlewares || []
    var _a = normalizeActionResult(props.init(), void 0, appActions), appState = _a[0], cmd = _a[1];
    init(appState, appActions, props.actions, []);
    cmd.forEach(function (sub) { return sub(appActions); });
    appRender(appState);
    appSubscribe(appState).forEach(function (sub) { return sub(appActions); });
    return __assign({}, props, { actions: appActions, getState: function () { return appState; }, render: appRender });
    function appRender(state) {
        if (state !== appState) {
            appState = state;
        }
        var view;
        if (utils_1.isFunction(view = props.view(appState))) {
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
            utils_1.isFunction(from[key])
                ? (function (key, action) {
                    actions[key] = function (msgData) {
                        state = utils_1.get(path, appState);
                        // action = appMiddlewares.reduce((action, fn) => fn(action, key, path), action)
                        var nextState = state;
                        var nextAppState = appState;
                        var cmd = cmd_1.default.none;
                        try {
                            _a = normalizeActionResult(action(msgData), state, actions), nextState = _a[0], cmd = _a[1];
                        }
                        catch (error) {
                            console.error(error);
                            onError(error);
                        }
                        if (props.onUpdate) {
                            nextAppState = utils_1.setDeep(path, utils_1.merge(state, nextState), appState);
                            props.onUpdate({ prevAppState: appState, nextAppState: nextAppState, msgData: msgData, action: path.concat(key).join('.') });
                        }
                        if (nextState !== state) {
                            appState = nextAppState !== appState
                                ? nextAppState
                                : utils_1.setDeep(path, utils_1.merge(state, nextState), appState);
                            appRender(appState);
                        }
                        cmd.forEach(function (sub) { return sub(appActions); });
                        return msgData;
                        var _a;
                    };
                })(key, from[key])
                : init(state[key] || (state[key] = {}), (actions[key] = {}), from[key], path.concat(key));
        }
    }
}
exports.default = app;
//# sourceMappingURL=index.js.map