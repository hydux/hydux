"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var utils_1 = require("../utils");
function defaultLogger(prevState, action, nextState) {
    console.group('%c action', 'color: gray; font-weight: lighter;', action.name);
    console.log('%c prev state', 'color: #9E9E9E; font-weight: bold;', prevState);
    console.log('%c data', 'color: #03A9F4; font-weight: bold;', action.data);
    console.log('%c next state', 'color: #4CAF50; font-weight: bold;', nextState);
    console.groupEnd();
}
function withLogger(options) {
    if (options === void 0) { options = {}; }
    var _a = options.logger, logger = _a === void 0 ? defaultLogger : _a, _b = options.windowInspectKey, windowInspectKey = _b === void 0 ? '__HYDUX_STATE__' : _b, _c = options.filter, filter = _c === void 0 ? function (_) { return true; } : _c;
    var scope = typeof window !== 'undefined'
        ? window
        : typeof global !== 'undefined'
            ? global
            : {};
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
            }, onUpdate: function (data) {
                props.onUpdate && props.onUpdate(data);
                var path = data.action.split('.').slice(0, -1);
                var prevState = utils_1.get(path, data.prevAppState);
                var nextState = utils_1.get(path, data.nextAppState);
                if (filter(data.action)) {
                    logger(prevState, { name: data.action, data: data.msgData }, nextState);
                }
                if (windowInspectKey) {
                    scope[windowInspectKey] = data;
                }
            } }));
    }; };
}
exports.default = withLogger;
//# sourceMappingURL=logger.js.map