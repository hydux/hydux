import * as tslib_1 from "tslib";
import Cmd from './cmd';
import { merge, setDeep, get, isFn, noop, isPojo, clone } from './utils';
export * from './helpers';
export { Cmd, noop, isFn, isPojo };
/**
 * run action and return a normalized result ([State, CmdType<>]),
 * this is useful to write High-Order-Action, which take an action and return a wrapped action.
 * @param result result of `action(msg: Data)`
 * @param state
 * @param actions
 */
export function runAction(result, state, actions, parentState, parentActions) {
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
export function app(props) {
    // const appEvents = props.events || {}
    var appActions = {};
    var appSubscribe = props.subscribe || (function (_) { return Cmd.none; });
    var render = props.onRender || noop;
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
                    var _a = [state, appState], nextState = _a[0], nextAppState = _a[1];
                    var cmd = Cmd.none;
                    var _b = [undefined, undefined], parentState = _b[0], parentActions = _b[1];
                    var actionResult = subFrom.apply(void 0, msgData);
                    if (isFn(actionResult) && actionResult.length > 2) {
                        var pPath = path.slice(0, -1);
                        parentActions = get(pPath, appActions);
                        parentState = get(pPath, appState);
                    }
                    _c = runAction(actionResult, state, actions, parentState, parentActions), nextState = _c[0], cmd = _c[1];
                    if (props.onUpdate) {
                        nextAppState = setDeep(path, merge(state, nextState), appState);
                        props.onUpdate({
                            prevAppState: appState,
                            nextAppState: nextAppState,
                            msgData: msgData,
                            action: path.concat(key).join('.'),
                        });
                    }
                    if (nextState !== state) {
                        appState =
                            nextAppState !== appState
                                ? nextAppState
                                : setDeep(path, merge(state, nextState), appState);
                        appRender(appState);
                    }
                    cmd.forEach(function (sub) { return sub(actions); });
                    var _c;
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