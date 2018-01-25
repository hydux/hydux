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
    };
    return [
        function (_) {
            if (failedAction) {
                try {
                    fn();
                }
                catch (e) {
                    console.error(e);
                    failedAction(e);
                }
            }
            else {
                fn();
            }
        }
    ];
}
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
            task(args)
                .then(succeedAction)
                .catch(failedAction);
        }
    ];
}
exports.default = {
    none: [],
    ofPromise: ofPromise,
    ofFn: ofFn,
    ofSub: function (sub) {
        return [sub];
    },
    batch: function () {
        var cmds = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            cmds[_i] = arguments[_i];
        }
        var _concat = Array.prototype.concat;
        return _concat.apply([], _concat.apply([], cmds));
    },
    map: function (map, cmd) {
        return cmd.map(function (sub) { return function (actions) { return sub(map(actions)); }; });
    }
};
//# sourceMappingURL=cmd.js.map