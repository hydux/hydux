"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Cmd = require("./cmd");
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