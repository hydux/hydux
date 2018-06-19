import * as tslib_1 from "tslib";
import * as Cmd from '../cmd';
import { normalize } from '../index';
export * from './hash';
export * from './memoize';
import { isFn } from '../utils';
/**
 * ADT Helper for TS
 * e.g.
 * ```ts
 * type Msg =
 * | Dt<'fetchBook', number>
 * | Dt<'updateBook', Book>
 *
 * let msg = dt('fetchBook', 1)
 * switch(msg.tag) {
 *   case 'fetchBook':
 *      //...
 *      break
 *   case 'updateBook':
 *      //...
 *      break
 *   default:
 *      never(msg.tag) // incomplete check from TS
 *      break
 * }
 * ```
 */
export function dt(tag, data) {
    if (data === void 0) { data = null; }
    return { tag: tag, data: data };
}
export var never = function (f) { return f; };
export function mkInit(state, cmd) {
    if (cmd === void 0) { cmd = Cmd.none; }
    return { state: state, cmd: cmd };
}
export function compose() {
    var fns = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        fns[_i] = arguments[_i];
    }
    return function (arg) {
        return fns.reduce(function (arg, fn) { return fn(arg); }, arg);
    };
}
export function combineInit(arg) {
    var state = {};
    var cmd = Cmd.none;
    var _loop_1 = function (key) {
        var init = normalize(arg[key]);
        state[key] = init.state;
        cmd = Cmd.batch(cmd, Cmd.map(function (_) { return _[key]; }, init.cmd));
    };
    for (var key in arg) {
        _loop_1(key);
    }
    return { state: state, cmd: cmd };
}
/**
 * run action and return a normalized result ([State, CmdType<>]),
 * this is useful to write High-Order-Action, which take an action and return a wrapped action.
 * @param result result of `action(msg: Data)`
 * @param state
 * @param actions
 */
export function runAction(result, state, actions, parentState, parentActions) {
    var res = result;
    isFn(res)
        && (res = res(state, actions, parentState, parentActions))
        && isFn(res)
        && (res = res(actions));
    // action can be a function that return a promise or undefined(callback)
    if (res === undefined ||
        (res.then && isFn(res.then))) {
        return { state: state, cmd: Cmd.none };
    }
    var ret2 = normalize(res, state);
    return {
        state: ret2.state || state,
        cmd: ret2.cmd,
    };
}
/**
 * Wrap a child action with parentState, parentActions.
 * @deprecated Deprecated for `watchActions`
 * @param action The action to be wrapped
 * @param wrapper
 * @param parentState
 * @param parentActions
 */
export function withParents(action, wrapper) {
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
/**
 * Wrap a child action with parentState, parentActions.
 * @param action The action to be wrapped
 * @param wrapper
 * @param parentState
 * @param parentActions
 */
export function overrideAction(parentActions, getter, wrapper) {
    if (!wrapper) {
        return parentActions;
    }
    var action = getter(parentActions);
    var wrapped = function (state, actions, parentState, parentActions) {
        var normalActions = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return runAction(action.apply(void 0, args), state, actions);
        };
        return wrapper(normalActions, parentState, parentActions, state, actions);
    };
    var keys = (getter.toString().match(/((?:[\w_$]+\.)+[\w_$]+)/) || [])[1].split('.').slice(1);
    var cursor = parentActions;
    var replaced = false;
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (cursor[key] === action) {
            cursor[key] = wrapped;
            replaced = true;
            break;
        }
        cursor = cursor[key] = tslib_1.__assign({}, cursor[key]);
    }
    if (!replaced) {
        console.error(new Error("Cannot find action in parentActions"), parentActions, getter);
    }
    return parentActions;
}
//# sourceMappingURL=index.js.map