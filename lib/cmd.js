"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("./utils");
function ofFn(task, args, succeedAction, failedAction) {
    if (!task) {
        return [];
    }
    if (utils_1.isFn(args)) {
        failedAction = succeedAction;
        succeedAction = args;
        args = void 0;
    }
    var fn = function () {
        var result = task(args);
        if (succeedAction) {
            succeedAction(result);
        }
        return result;
    };
    return [
        function (_) {
            if (failedAction) {
                try {
                    return fn();
                }
                catch (e) {
                    console.error(e);
                    failedAction(e);
                }
            }
            else { // don't wrap in try cache, get better DX in `Pause on exceptions`
                return fn();
            }
        }
    ];
}
exports.ofFn = ofFn;
function ofPromise(task, args, succeedAction, failedAction) {
    if (!task) {
        return [];
    }
    if (utils_1.isFn(args)) {
        failedAction = succeedAction;
        succeedAction = args;
        args = void 0;
    }
    return [
        function (_) {
            return task(args)
                .then(function (res) {
                try {
                    succeedAction && succeedAction(res);
                }
                catch (error) {
                    console.error(error);
                }
            })
                .catch(failedAction);
        }
    ];
}
exports.ofPromise = ofPromise;
/**
 * Create a command from a sub function, you can access all same level actions in a `sub`.
 * @param sub
 */
exports.ofSub = function (sub) { return [sub]; };
var _concat = Array.prototype.concat;
/**
 * Batch multi commands to one command
 * @param cmds
 */
exports.batch = function () {
    var cmds = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        cmds[_i] = arguments[_i];
    }
    return _concat.apply([], _concat.apply([], cmds));
};
/**
 * Map a command to a low level command
 * @param map
 * @param cmd
 */
exports.map = function (map, cmd) {
    return cmd.map(function (sub) { return function (actions) { return sub(map(actions)); }; });
};
/**
 * Empty command
 */
exports.none = [];
exports.Cmd = {
    none: exports.none,
    ofFn: ofFn,
    ofPromise: ofPromise,
    ofSub: exports.ofSub,
    batch: exports.batch,
    map: exports.map,
};
exports.default = exports.Cmd;
//# sourceMappingURL=cmd.js.map