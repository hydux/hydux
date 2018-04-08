import { isFn } from './utils';
export function ofFn(task, args, succeedAction, failedAction) {
    if (!task) {
        return [];
    }
    if (isFn(args)) {
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
            else {
                return fn();
            }
        }
    ];
}
export function ofPromise(task, args, succeedAction, failedAction) {
    if (!task) {
        return [];
    }
    if (isFn(args)) {
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
/**
 * Create a command from a sub function, you can access all same level actions in a `sub`.
 * @param sub
 */
export var ofSub = function (sub) { return [sub]; };
var _concat = Array.prototype.concat;
/**
 * Batch multi commands to one command
 * @param cmds
 */
export var batch = function () {
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
export var map = function (map, cmd) {
    return cmd.map(function (sub) { return function (actions) { return sub(map(actions)); }; });
};
/**
 * Empty command
 */
export var none = [];
export var Cmd = {
    none: none,
    ofFn: ofFn,
    ofPromise: ofPromise,
    ofSub: ofSub,
    batch: batch,
    map: map,
};
export default Cmd;
//# sourceMappingURL=cmd.js.map