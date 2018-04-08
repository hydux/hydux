"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var cmd_1 = require("./cmd");
exports.Cmd = cmd_1.default;
var utils_1 = require("./utils");
exports.isFn = utils_1.isFn;
exports.noop = utils_1.noop;
exports.isPojo = utils_1.isPojo;
tslib_1.__exportStar(require("./helpers"), exports);
/**
 * run action and return a normalized result ([State, CmdType<>]),
 * this is useful to write High-Order-Action, which take an action and return a wrapped action.
 * @param result result of `action(msg: Data)`
 * @param state
 * @param actions
 */
function runAction(result, state, actions, parentState, parentActions) {
    var rst = result;
    utils_1.isFn(rst)
        && (rst = rst(state, actions, parentState, parentActions))
        && utils_1.isFn(rst)
        && (rst = rst(actions));
    // action can be a function that return a promise or undefined(callback)
    if (rst === undefined ||
        (rst.then && utils_1.isFn(rst.then))) {
        return [state, cmd_1.default.none];
    }
    if (rst instanceof Array) {
        return [rst[0] || state, rst[1] || cmd_1.default.none];
    }
    return [rst, cmd_1.default.none];
}
exports.runAction = runAction;
/**
 * Wrap a child action with parentState, parentActions.
 * @param action The action to be wrapped
 * @param wrapper
 * @param parentState
 * @param parentActions
 */
function withParents(action, wrapper, parentState, parentActions) {
    if (!wrapper) {
        return action;
    }
    var wrapped = function (state, actions, parentState, parentActions) {
        var nactions = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return runAction(action.apply(void 0, args), state, actions);
        };
        return wrapper(nactions, parentState, parentActions, state, actions);
    };
    return wrapped;
}
exports.withParents = withParents;
/**
 * @deprecated Deprecated for `withParents`
 */
exports.wrapActions = withParents;
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
    return tslib_1.__assign({ 
        // getter should before spread operator,
        // otherwise it would be copied and becomes normal property
        get state() {
            return appState;
        } }, props, { actions: appActions, render: appRender });
    function appRender(state) {
        if (state === void 0) { state = appState; }
        if (state !== appState) {
            appState = state;
        }
        var view = props.view(appState, appActions);
        if (utils_1.isFn(view)) {
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
                    var _a = [state, appState], nextState = _a[0], nextAppState = _a[1];
                    var cmd = cmd_1.default.none;
                    var _b = [undefined, undefined], parentState = _b[0], parentActions = _b[1];
                    var actionResult = subFrom.apply(void 0, msgData);
                    if (utils_1.isFn(actionResult) && actionResult.length > 2) {
                        var pPath = path.slice(0, -1);
                        parentActions = utils_1.get(pPath, appActions);
                        parentState = utils_1.get(pPath, appState);
                    }
                    _c = runAction(actionResult, state, actions, parentState, parentActions), nextState = _c[0], cmd = _c[1];
                    if (props.onUpdate) {
                        nextAppState = utils_1.setDeep(path, utils_1.merge(state, nextState), appState);
                        props.onUpdate({
                            prevAppState: appState,
                            nextAppState: nextAppState,
                            msgData: subFrom.length ? msgData : [],
                            action: path.concat(key).join('.'),
                        });
                    }
                    if (nextState !== state) {
                        appState =
                            nextAppState !== appState
                                ? nextAppState
                                : utils_1.setDeep(path, utils_1.merge(state, nextState), appState);
                        appRender(appState);
                    }
                    cmd.forEach(function (sub) { return sub(actions); });
                    var _c;
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
exports.app = app;
exports.default = app;
//# sourceMappingURL=index.js.map