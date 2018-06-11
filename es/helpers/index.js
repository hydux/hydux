import * as Cmd from '../cmd';
import { normalizeInit } from '../index';
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
export var mkInit = function (state, cmd) {
    if (cmd === void 0) { cmd = Cmd.none; }
    return function () { return [state, cmd]; };
};
export function compose() {
    var fns = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        fns[_i] = arguments[_i];
    }
    return function (arg) {
        return fns.reduce(function (arg, fn) { return fn(arg); }, arg);
    };
}
export function initAll(arg) {
    var state = {};
    var cmd = Cmd.none;
    var _loop_1 = function (key) {
        var init = normalizeInit(arg[key]);
        state[key] = init.state;
        cmd = Cmd.batch(cmd, Cmd.map(function (_) { return _[key]; }, init.cmd));
    };
    for (var key in arg) {
        _loop_1(key);
    }
    return { state: state, cmd: cmd };
}
//# sourceMappingURL=index.js.map