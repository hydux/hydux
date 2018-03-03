import Cmd from './cmd';
import { merge, setDeep, get, isFn, noop, clone } from './utils';
export * from './helpers';
export { Cmd, noop };
/**
 * run action and return a normalized result ([State, CmdType<>]),
 * this is useful to write High-Order-Action, which take an action and return a wrapped action.
 * @param result result of `action(msg: Data)`
 * @param state
 * @param actions
 */
export function runAction(result, state, actions, parentState, parentActions) {
    let rst = result;
    isFn(rst) && (rst = rst(state, actions, parentState, parentActions)) &&
        isFn(rst) && (rst = rst(actions));
    // action can be a function that return a promise or undefined(callback)
    if (rst === undefined ||
        (rst.then && isFn(rst.then))) {
        return [state, Cmd.none];
    }
    if (rst instanceof Array) {
        return [rst[0] || state, rst[1] || Cmd.none];
    }
    return [rst, Cmd.none];
}
/**
 * Wrap a child action with parentState, parentActions.
 * @param action The action to be wrapped
 * @param wrapper
 * @param parentState
 * @param parentActions
 */
export function withParents(action, wrapper, parentState, parentActions) {
    if (!wrapper) {
        return action;
    }
    const wrapped = (state, actions, parentState, parentActions) => {
        const nactions = (...args) => runAction(action(...args), state, actions);
        return wrapper(nactions, parentState, parentActions, state, actions);
    };
    return wrapped;
}
export function app(props) {
    // const appEvents = props.events || {}
    const appActions = {};
    const appSubscribe = props.subscribe || (_ => Cmd.none);
    const render = props.onRender || noop;
    // const appMiddlewares = props.middlewares || []
    let [appState, cmd] = runAction(props.init(), void 0, appActions);
    init(appState, appActions, props.actions, []);
    cmd.forEach(sub => sub(appActions));
    appRender(appState);
    appSubscribe(appState).forEach(sub => sub(appActions));
    return Object.assign({}, props, { actions: appActions, get state() {
            return appState;
        },
        getState() { return appState; }, render: appRender });
    function appRender(state = appState) {
        if (state !== appState) {
            appState = state;
        }
        let view;
        if (isFn(view = props.view(appState, appActions))) {
            view = view(appActions);
        }
        return render(view);
    }
    function init(state, actions, from, path) {
        for (const key in from) {
            if (/^_/.test(key)) {
                continue;
            }
            const subFrom = from[key];
            if (isFn(subFrom)) {
                actions[key] = function (...msgData) {
                    state = get(path, appState);
                    // action = appMiddlewares.reduce((action, fn) => fn(action, key, path), action)
                    let [nextState, nextAppState] = [state, appState];
                    let cmd = Cmd.none;
                    let [parentState, parentActions] = [undefined, undefined];
                    const actionResult = subFrom(...msgData);
                    if (isFn(actionResult) && actionResult.length > 2) {
                        const pPath = path.slice(0, -1);
                        parentActions = get(pPath, appActions);
                        parentState = get(pPath, appState);
                    }
                    [nextState, cmd] = runAction(actionResult, state, actions, parentState, parentActions);
                    if (props.onUpdate) {
                        nextAppState = setDeep(path, merge(state, nextState), appState);
                        props.onUpdate({
                            prevAppState: appState,
                            nextAppState,
                            msgData,
                            action: path.concat(key).join('.')
                        });
                    }
                    if (nextState !== state) {
                        appState = nextAppState !== appState
                            ? nextAppState
                            : setDeep(path, merge(state, nextState), appState);
                        appRender(appState);
                    }
                    cmd.forEach(sub => sub(actions));
                };
            }
            else if (typeof subFrom === 'object' && subFrom) {
                init(state[key] || (state[key] = {}), (actions[key] = clone(subFrom)), subFrom, path.concat(key));
            }
        }
    }
}
export default app;
//# sourceMappingURL=index.js.map