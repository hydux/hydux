"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("../utils");
function defaultLogger(prevState, action, nextState) {
    console.group('%c action', 'color: gray; font-weight: lighter;', action.name);
    console.log('%c prev state', 'color: #9E9E9E; font-weight: bold;', prevState);
    console.log('%c data', 'color: #03A9F4; font-weight: bold;', action.data);
    console.log('%c next state', 'color: #4CAF50; font-weight: bold;', nextState);
    console.groupEnd();
}
function withLogger(_a) {
    var _b = _a === void 0 ? {} : _a, _c = _b.logger, logger = _c === void 0 ? defaultLogger : _c, _d = _b.windowInspectKey, windowInspectKey = _d === void 0 ? '__HYDUX_STATE__' : _d;
    var scope = typeof window !== 'undefined'
        ? window
        : typeof global !== 'undefined'
            ? global
            : {};
    return function (app) { return function (props) {
        return app(__assign({}, props, { init: function () {
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
                logger(data.prevAppState, { name: data.action, data: data.msgData }, nextState);
                if (windowInspectKey) {
                    scope[windowInspectKey] = data;
                }
            } }));
    }; };
}
exports.default = withLogger;
//# sourceMappingURL=logger.js.map