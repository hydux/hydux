import { get } from '../utils';
function defaultLogger(prevState, action, nextState, extra) {
    console.group('%c action', 'color: gray; font-weight: lighter;', action.name);
    console.log('%c prev state', 'color: #9E9E9E; font-weight: bold;', prevState);
    console.log('%c data', 'color: #03A9F4; font-weight: bold;', ...action.data, ...extra);
    console.log('%c next state', 'color: #4CAF50; font-weight: bold;', nextState);
    console.groupEnd();
}
export default function withLogger(options = {}) {
    const { logger = defaultLogger, windowInspectKey = '__HYDUX_STATE__', filter = _ => true, logActionTime = true, logRenderTime = true, } = options;
    const scope = typeof window !== 'undefined'
        ? window
        : typeof global !== 'undefined'
            ? global
            : {};
    const timeMap = {};
    const now = () => (scope['performance'] || Date).now();
    return (app) => (props) => {
        return app(Object.assign({}, props, { init: () => {
                const result = props.init();
                let state = result;
                if (result instanceof Array) {
                    state = result[0];
                }
                if (windowInspectKey) {
                    scope[windowInspectKey] = {
                        prevAppState: void 0,
                        nextAppState: state,
                        action: '@@hydux/INIT',
                        msgData: void 0,
                    };
                }
                return result;
            }, onUpdateStart: (data) => {
                timeMap[data.action] = now();
            }, onUpdate: (data) => {
                props.onUpdate && props.onUpdate(data);
                const path = data.action.split('.').slice(0, -1);
                const prevState = get(path, data.prevAppState);
                const nextState = get(path, data.nextAppState);
                if (filter(data.action)) {
                    logger(prevState, { name: data.action, data: data.msgData }, nextState, logActionTime ? ['time', (now() - timeMap[data.action]) + 'ms'] : []);
                }
                if (windowInspectKey) {
                    scope[windowInspectKey] = data;
                }
            }, onRender: view => {
                const start = now();
                const ret = props.onRender && props.onRender(view);
                const end = now();
                if (logRenderTime) {
                    console.log('%c render time', 'color: #fa541c; font-weight: bold;', (end - start) + 'ms');
                }
                return ret;
            } }));
    };
}
//# sourceMappingURL=logger.js.map