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
function runAction(result, state, actions, parentState, parentActions, appContext) {
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
function normalizeInit(initResult) {
    if (initResult instanceof Array) {
        return initResult;
    }
    return [initResult, cmd_1.default.none];
}
exports.normalizeInit = normalizeInit;
function runCmd(cmd, actions) {
    return cmd.map(function (sub) { return sub(actions); });
}
exports.runCmd = runCmd;
function app(props) {
    // const appEvents = props.events || {}
    var appActions = {};
    var appSubscribe = props.subscribe || (function (_) { return cmd_1.default.none; });
    var render = props.onRender || utils_1.noop;
    // const appMiddlewares = props.middlewares || []
    var _a = normalizeInit(props.init()), appState = _a[0], cmd = _a[1];
    init(appState, appActions, props.actions, []);
    runCmd(cmd, appActions);
    appRender(appState);
    appSubscribe(appState).forEach(function (sub) { return sub(appActions); });
    var appContext = tslib_1.__assign({ 
        // getter should before spread operator,
        // otherwise it would be copied and becomes normal property
        get state() {
            return appState;
        } }, props, { actions: appActions, render: appRender, patch: function (path, comp, reuseState) {
            if (reuseState === void 0) { reuseState = false; }
            reuseState = reuseState && appState[path];
            var _a = normalizeInit(comp.init()), state = _a[0], cmd = _a[1];
            var actions = appActions[path];
            if (!actions) {
                actions = appActions[path] = {};
                init(state, actions, comp.actions, [path]);
            }
            if (!reuseState) {
                appState = utils_1.setDeep([path], state, appState);
            }
            appState = utils_1.setDeep(['lazyComps', path], comp, appState);
            appRender(appState);
            return reuseState
                ? Promise.resolve()
                : Promise.all(runCmd(cmd, actions));
        } });
    return appContext;
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
                    var nextState = state;
                    var nextAppState = appState;
                    var cmd = cmd_1.default.none;
                    var parentState;
                    var parentActions;
                    var actionResult = subFrom.apply(void 0, msgData);
                    if (utils_1.isFn(actionResult) && actionResult.length > 2) {
                        var pLen = path.length - 1;
                        parentActions = utils_1.get(path, appActions, pLen);
                        parentState = utils_1.get(path, appState, pLen);
                    }
                    _a = runAction(actionResult, state, actions, parentState, parentActions), nextState = _a[0], cmd = _a[1];
                    if (props.onUpdate) {
                        if (props.mutable) {
                            if (state !== nextState) {
                                utils_1.set(state, nextState);
                            }
                            nextAppState = utils_1.setDeepMutable(path, state !== nextState
                                ? utils_1.set(state, nextState)
                                : state, appState);
                        }
                        else {
                            nextAppState = utils_1.setDeep(path, utils_1.merge(state, nextState), appState);
                        }
                        props.onUpdate({
                            prevAppState: appState,
                            nextAppState: nextAppState,
                            msgData: subFrom.length ? msgData : [],
                            action: path.join('.') + '.' + key,
                        });
                    }
                    if (props.mutable) {
                        appState = utils_1.setDeepMutable(path, state !== nextState
                            ? utils_1.set(state, nextState)
                            : state, appState);
                        appRender(appState);
                    }
                    else if (nextState !== state) {
                        if (props.onUpdate) {
                            appState = nextAppState;
                        }
                        else {
                            appState = utils_1.setDeep(path, utils_1.merge(state, nextState), appState);
                        }
                        appRender(appState);
                    }
                    return runCmd(cmd, actions);
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
exports.app = app;
exports.default = app;
//# sourceMappingURL=index.js.map