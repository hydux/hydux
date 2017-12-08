"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    none: [],
    ofPromise: function (task, args, succeedAction, failedAction) {
        return [
            function (_) {
                task(args)
                    .then(succeedAction)
                    .catch(failedAction);
            }
        ];
    },
    ofFn: function (task, args, succeedAction, failedAction) {
        return [
            function (_) {
                try {
                    succeedAction(task(args));
                }
                catch (e) {
                    failedAction(e);
                }
            }
        ];
    },
    ofSub: function (sub) {
        return [sub];
    },
    batch: function () {
        var cmds = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            cmds[_i] = arguments[_i];
        }
        return Array.prototype.concat.apply([], cmds);
    },
    map: function (map, cmd) {
        return cmd.map(function (sub) { return function (actions) { return sub(map(actions)); }; });
    }
};
//# sourceMappingURL=cmd.js.map