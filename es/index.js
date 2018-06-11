import * as tslib_1 from "tslib";
import Cmd from './cmd';
import { set, merge, setDeep, setDeepMutable, get, isFn, noop, isPojo, clone } from './utils';
export * from './helpers';
export { Cmd, noop, isFn, isPojo };
/**
 * run action and return a normalized result ([State, CmdType<>]),
 * this is useful to write High-Order-Action, which take an action and return a wrapped action.
 * @param result result of `action(msg: Data)`
 * @param state
 * @param actions
 */
export function runAction(result, state, actions, parentState, parentActions, appContext) {
    var rst = result;
    isFn(rst)
        && (rst = rst(state, actions, parentState, parentActions))
        && isFn(rst)
        && (rst = rst(actions));
    // action can be a function that return a promise or undefined(callback)
    if (rst === undefined ||
        (rst.then && isFn(rst.then))) {
        return [state, Cmd.none];
    }
    if (rst instanceof Array) {
        return [rst[0] || state, rst[1] || Cmd.none];
    }
    return [rst, Cmd.none];
}
/**
 * Wrap a child action with parentState, parentActions.
 * @param action The action to be wrapped
 * @param wrapper
 * @param parentState
 * @param parentActions
 */
export function withParents(action, wrapper, parentState, parentActions) {
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
/**
 * @deprecated Deprecated for `withParents`
 */
export var wrapActions = withParents;
function isInitObj(res) {
    var keys = Object.keys(res).join('|');
    return keys === 'state' || keys === 'state|cmd';
}
export function normalizeInit(initResult) {
    if (initResult instanceof Array) {
        return {
            state: initResult[0],
            cmd: initResult[1]
        };
    }
    if (isInitObj(initResult)) {
        return {
            state: initResult.state,
            cmd: initResult.cmd || Cmd.none,
        };
    }
    return {
        state: initResult,
        cmd: Cmd.none
    };
}
export function runCmd(cmd, actions) {
    return cmd.map(function (sub) { return sub(actions); });
}
export function app(props) {
    // const appEvents = props.events || {}
    var appActions = {};
    var appSubscribe = props.subscribe || (function (_) { return Cmd.none; });
    var render = props.onRender || noop;
    // const appMiddlewares = props.middlewares || []
    var _a = normalizeInit(props.init()), appState = _a.state, cmd = _a.cmd;
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
            var _a = normalizeInit(comp.init()), state = _a.state, cmd = _a.cmd;
            var actions = appActions[path];
            if (!actions) {
                actions = appActions[path] = {};
                init(state, actions, comp.actions, [path]);
            }
            if (!reuseState) {
                appState = setDeep([path], state, appState);
            }
            appState = setDeep(['lazyComps', path], comp, appState);
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
        if (isFn(view)) {
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
            if (isFn(subFrom)) {
                actions[key] = function () {
                    var msgData = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        msgData[_i] = arguments[_i];
                    }
                    state = get(path, appState);
                    // action = appMiddlewares.reduce((action, fn) => fn(action, key, path), action)
                    var nextState = state;
                    var nextAppState = appState;
                    var cmd = Cmd.none;
                    var parentState;
                    var parentActions;
                    var actionResult = subFrom.apply(void 0, msgData);
                    if (isFn(actionResult) && actionResult.length > 2) {
                        var pLen = path.length - 1;
                        parentActions = get(path, appActions, pLen);
                        parentState = get(path, appState, pLen);
                    }
                    _a = runAction(actionResult, state, actions, parentState, parentActions), nextState = _a[0], cmd = _a[1];
                    if (props.onUpdate) {
                        if (props.mutable) {
                            nextAppState = setDeepMutable(path, state !== nextState
                                ? set(state, nextState)
                                : state, appState);
                        }
                        else {
                            nextAppState = setDeep(path, merge(state, nextState), appState);
                        }
                        props.onUpdate({
                            prevAppState: appState,
                            nextAppState: nextAppState,
                            msgData: subFrom.length ? msgData : [],
                            action: path.join('.') + '.' + key,
                        });
                    }
                    if (props.mutable) {
                        appState = setDeepMutable(path, state !== nextState
                            ? set(state, nextState)
                            : state, appState);
                        appRender(appState);
                    }
                    else if (nextState !== state) {
                        if (props.onUpdate) {
                            appState = nextAppState;
                        }
                        else {
                            appState = setDeep(path, merge(state, nextState), appState);
                        }
                        appRender(appState);
                    }
                    return runCmd(cmd, actions);
                    var _a;
                };
            }
            else if (typeof subFrom === 'object' && subFrom) {
                init(state[key] || (state[key] = {}), (actions[key] = clone(subFrom)), subFrom, path.concat(key));
            }
        };
        for (var key in from) {
            _loop_1(key);
        }
    }
}
export default app;
//# sourceMappingURL=index.js.map