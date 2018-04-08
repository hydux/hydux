import * as tslib_1 from "tslib";
import { get } from '../utils';
function defaultLogger(prevState, action, nextState, extra) {
    console.group('%c action', 'color: gray; font-weight: lighter;', action.name);
    console.log('%c prev state', 'color: #9E9E9E; font-weight: bold;', prevState);
    console.log.apply(console, ['%c data', 'color: #03A9F4; font-weight: bold;'].concat(action.data, extra));
    console.log('%c next state', 'color: #4CAF50; font-weight: bold;', nextState);
    console.groupEnd();
}
export default function withLogger(options) {
    if (options === void 0) { options = {}; }
    var _a = options.logger, logger = _a === void 0 ? defaultLogger : _a, _b = options.windowInspectKey, windowInspectKey = _b === void 0 ? '__HYDUX_STATE__' : _b, _c = options.filter, filter = _c === void 0 ? function (_) { return true; } : _c, _d = options.logActionTime, logActionTime = _d === void 0 ? true : _d, _e = options.logRenderTime, logRenderTime = _e === void 0 ? true : _e;
    var scope = typeof window !== 'undefined'
        ? window
        : typeof global !== 'undefined'
            ? global
            : {};
    var timeMap = {};
    var now = function () { return (scope['performance'] || Date).now(); };
    return function (app) { return function (props) {
        return app(tslib_1.__assign({}, props, { init: function () {
                var result = props.init();
                var state = result;
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
            }, onUpdateStart: function (data) {
                timeMap[data.action] = now();
            }, onUpdate: function (data) {
                props.onUpdate && props.onUpdate(data);
                var path = data.action.split('.').slice(0, -1);
                var prevState = get(path, data.prevAppState);
                var nextState = get(path, data.nextAppState);
                if (filter(data.action)) {
                    logger(prevState, { name: data.action, data: data.msgData }, nextState, logActionTime ? ['time', (now() - timeMap[data.action]) + 'ms'] : []);
                }
                if (windowInspectKey) {
                    scope[windowInspectKey] = data;
                }
            }, onRender: function (view) {
                var start = now();
                var ret = props.onRender && props.onRender(view);
                var end = now();
                if (logRenderTime) {
                    console.log('%c render time', 'color: #fa541c; font-weight: bold;', (end - start) + 'ms');
                }
                return ret;
            } }));
    }; };
}
//# sourceMappingURL=logger.js.map