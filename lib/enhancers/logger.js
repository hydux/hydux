"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var index_1 = require("./../index");
var utils_1 = require("../utils");
function defaultLogger(level, prevState, action, nextState, extra) {
    console.group('%c action', 'color: gray; font-weight: lighter;', action.name);
    console[level]('%c prev state', 'color: #9E9E9E; font-weight: bold;', prevState);
    console[level].apply(console, ['%c data', 'color: #03A9F4; font-weight: bold;'].concat(action.data, extra));
    console[level]('%c next state', 'color: #4CAF50; font-weight: bold;', nextState);
    console.groupEnd();
}
function withLogger(options) {
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
                var result = index_1.normalize(props.init());
                if (windowInspectKey) {
                    scope[windowInspectKey] = {
                        prevAppState: void 0,
                        nextAppState: result.state,
                        action: '@@hydux/INIT',
                        msgData: void 0,
                    };
                }
                return result;
            }, onUpdateStart: function (data) {
                timeMap[data.action] = now();
            }, onUpdated: function (data) {
                props.onUpdated && props.onUpdated(data);
                var path = data.action.split('.').slice(0, -1);
                var prevState = utils_1.get(path, data.prevAppState);
                var nextState = utils_1.get(path, data.nextAppState);
                if (filter(data.action)) {
                    logger(options.level || 'log', prevState, { name: data.action, data: data.msgData }, nextState, logActionTime ? ['time', (now() - timeMap[data.action]) + 'ms'] : []);
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
exports.default = withLogger;
//# sourceMappingURL=logger.js.map