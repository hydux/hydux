"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Cmd = require("../cmd");
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
exports.mkInit = function (state, cmd) {
    if (cmd === void 0) { cmd = Cmd.none; }
    return function () { return [state, cmd]; };
};
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
//# sourceMappingURL=index.js.map