"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Cmd = require("./cmd");
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
    return { tag: tag, data: data };
}
exports.dt = dt;
exports.never = function (f) { return f; };
exports.mkInit = function (state, cmd) {
    if (cmd === void 0) { cmd = Cmd.none; }
    return function () { return [state, cmd]; };
};
//# sourceMappingURL=helpers.js.map