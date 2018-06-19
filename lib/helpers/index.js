"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var Cmd = require("../cmd");
var index_1 = require("../index");
tslib_1.__exportStar(require("./hash"), exports);
tslib_1.__exportStar(require("./memoize"), exports);
var utils_1 = require("../utils");
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
function dt(tag, data) {
    if (data === void 0) { data = null; }
    return { tag: tag, data: data };
}
exports.dt = dt;
exports.never = function (f) { return f; };
function mkInit(state, cmd) {
    if (cmd === void 0) { cmd = Cmd.none; }
    return { state: state, cmd: cmd };
}
exports.mkInit = mkInit;
function compose() {
    var fns = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        fns[_i] = arguments[_i];
    }
    return function (arg) {
        return fns.reduce(function (arg, fn) { return fn(arg); }, arg);
    };
}
exports.compose = compose;
function combineInit(arg) {
    var state = {};
    var cmd = Cmd.none;
    var _loop_1 = function (key) {
        var init = index_1.normalize(arg[key]);
        state[key] = init.state;
        cmd = Cmd.batch(cmd, Cmd.map(function (_) { return _[key]; }, init.cmd));
    };
    for (var key in arg) {
        _loop_1(key);
    }
    return { state: state, cmd: cmd };
}
exports.combineInit = combineInit;
/**
 * run action and return a normalized result ([State, CmdType<>]),
 * this is useful to write High-Order-Action, which take an action and return a wrapped action.
 * @param result result of `action(msg: Data)`
 * @param state
 * @param actions
 */
function runAction(result, state, actions, parentState, parentActions) {
    var res = result;
    utils_1.isFn(res)
        && (res = res(state, actions, parentState, parentActions))
        && utils_1.isFn(res)
        && (res = res(actions));
    // action can be a function that return a promise or undefined(callback)
    if (res === undefined ||
        (res.then && utils_1.isFn(res.then))) {
        return { state: state, cmd: Cmd.none };
    }
    var ret2 = index_1.normalize(res, state);
    return {
        state: ret2.state || state,
        cmd: ret2.cmd,
    };
}
exports.runAction = runAction;
/**
 * Wrap a child action with parentState, parentActions.
 * @deprecated Deprecated for `watchActions`
 * @param action The action to be wrapped
 * @param wrapper
 * @param parentState
 * @param parentActions
 */
function withParents(action, wrapper) {
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
/**
 * Wrap a child action with parentState, parentActions.
 * @param action The action to be wrapped
 * @param wrapper
 * @param parentState
 * @param parentActions
 */
function overrideAction(parentActions, getter, wrapper) {
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
exports.overrideAction = overrideAction;
//# sourceMappingURL=index.js.map