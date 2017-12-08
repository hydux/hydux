var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
import Cmd from './cmd';
import { merge, setDeep, get, isFunction, noop } from './utils';
function normalizeActionResult(result, state) {
    if (isFunction(result)) {
        result = result(state);
    }
    if (result instanceof Array) {
        return result;
    }
    return [result, Cmd.none];
}
export default function app(props) {
    // const appEvents = props.events || {}
    var appActions = {};
    var appSubscribe = props.subscribe || (function (_) { return Cmd.none; });
    var render = props.render || console.log;
    var onError = props.onError || noop;
    // const appMiddlewares = props.middlewares || []
    var _a = normalizeActionResult(props.init(), void 0), appState = _a[0], cmd = _a[1];
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
        if (isFunction(view = props.view(appState))) {
            view = view(appActions);
        }
        try {
            render(view);
        }
        catch (err) {
            console.error(err);
            onError(err);
        }
    }
    function init(state, actions, from, path) {
        for (var key in from) {
            isFunction(from[key])
                ? (function (key, action) {
                    actions[key] = function (msgData) {
                        state = get(path, appState);
                        // action = appMiddlewares.reduce((action, fn) => fn(action, key, path), action)
                        var nextState = state;
                        var nextAppState = appState;
                        var cmd = Cmd.none;
                        try {
                            _a = normalizeActionResult(action(msgData), state), nextState = _a[0], cmd = _a[1];
                        }
                        catch (error) {
                            console.error(error);
                            onError(error);
                        }
                        if (props.onUpdate) {
                            nextAppState = setDeep(path, merge(state, nextState), appState);
                            props.onUpdate({ prevAppState: appState, nextAppState: nextAppState, msgData: msgData, action: path.concat(key).join('.') });
                        }
                        if (nextState !== state) {
                            appState = nextAppState !== appState
                                ? nextAppState
                                : setDeep(path, merge(state, nextState), appState);
                            appRender(appState);
                            cmd.forEach(function (sub) { return sub(appActions); });
                        }
                        return msgData;
                        var _a;
                    };
                })(key, from[key])
                : init(state[key] || (state[key] = {}), (actions[key] = {}), from[key], path.concat(key));
        }
    }
}
//# sourceMappingURL=index.js.map