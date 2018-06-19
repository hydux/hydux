"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var cmd_1 = require("./cmd");
exports.Cmd = cmd_1.default;
var utils_1 = require("./utils");
exports.isFn = utils_1.isFn;
exports.noop = utils_1.noop;
exports.isPojo = utils_1.isPojo;
var helpers_1 = require("./helpers");
tslib_1.__exportStar(require("./helpers"), exports);
function isObjReturn(res) {
    if (!res)
        return false;
    var keys = Object.keys(res).sort().join('|');
    return ['', 'state', 'cmd', 'cmd|state', '0|1|cmd|state'].indexOf(keys) >= 0;
}
function isCmdType(res) {
    return res.length === 0 || utils_1.isFn(res[0]);
}
function normalize(initResult, state) {
    if (state === void 0) { state = {}; }
    var ret = {};
    if (!initResult) {
        return { state: state, cmd: cmd_1.default.none };
    }
    if (initResult instanceof Array) {
        if (isCmdType(initResult)) {
            ret = {
                state: state,
                cmd: initResult,
            };
        }
        else {
            ret = {
                state: initResult[0],
                cmd: initResult[1] || cmd_1.default.none
            };
        }
    }
    else if (isObjReturn(initResult)) {
        ret = {
            state: initResult.state || state,
            cmd: initResult.cmd || cmd_1.default.none,
        };
    }
    else {
        ret = {
            state: initResult,
            cmd: cmd_1.default.none
        };
    }
    ret[0] = ret.state;
    ret[1] = ret.cmd;
    return ret;
}
exports.normalize = normalize;
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
    var _a = normalize(props.init()), appState = _a.state, cmd = _a.cmd;
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
            var _a = normalize(comp.init()), state = _a.state, cmd = _a.cmd;
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
                    var parentState;
                    var parentActions;
                    var prevAppState = appState;
                    var actionResult = subFrom.apply(void 0, msgData);
                    if (utils_1.isFn(actionResult) && actionResult.length > 2) {
                        var pLen = path.length - 1;
                        parentActions = utils_1.get(path, appActions, pLen);
                        parentState = utils_1.get(path, appState, pLen);
                    }
                    var _a = helpers_1.runAction(actionResult, state, actions, parentState, parentActions), nextState = _a.state, cmd = _a.cmd;
                    var actionName = path.join('.') + '.' + key;
                    if (props.onUpdateStart) {
                        props.onUpdateStart({
                            action: actionName,
                        });
                    }
                    if (props.mutable) {
                        appState = utils_1.setDeepMutable(path, state !== nextState
                            ? utils_1.set(state, nextState)
                            : state, appState);
                        appRender(appState);
                    }
                    else if (nextState !== state) {
                        appState = utils_1.setDeep(path, utils_1.merge(state, nextState), appState);
                        appRender(appState);
                    }
                    if (props.onUpdated) {
                        props.onUpdated({
                            prevAppState: prevAppState,
                            nextAppState: appState,
                            msgData: subFrom.length ? msgData : [],
                            action: actionName,
                        });
                    }
                    return runCmd(cmd, actions);
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