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
    const fn = () => {
        const result = task(args);
        if (succeedAction) {
            succeedAction(result);
        }
        return result;
    };
    return [
            _ => {
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
            _ => task(args)
            .then(res => {
            try {
                succeedAction && succeedAction(res);
            }
            catch (error) {
                console.error(error);
            }
        })
            .catch(failedAction)
    ];
}
export const ofSub = (sub) => [sub];
const _concat = Array.prototype.concat;
export const batch = (...cmds) => _concat.apply([], _concat.apply([], cmds));
export const map = (map, cmd) => {
    return cmd.map(sub => actions => sub(map(actions)));
};
export const none = [];
export default {
    none,
    ofFn,
    ofPromise,
    ofSub,
    batch,
    map,
};
//# sourceMappingURL=cmd.js.map