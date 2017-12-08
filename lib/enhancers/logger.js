var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
import { get } from '../utils';
function defaultLogger(prevState, action, nextState) {
    console.group('%c action', 'color: gray; font-weight: lighter;', action.name);
    console.log('%c prev state', 'color: #9E9E9E; font-weight: bold;', prevState);
    console.log('%c data', 'color: #03A9F4; font-weight: bold;', action.data);
    console.log('%c next state', 'color: #4CAF50; font-weight: bold;', nextState);
    console.groupEnd();
}
export default function withLogger(_a) {
    var _b = (_a === void 0 ? {} : _a).logger, logger = _b === void 0 ? defaultLogger : _b;
    return function (app) { return function (props) {
        return app(__assign({}, props, { onUpdate: function (data) {
                props.onUpdate && props.onUpdate(data);
                var path = data.action.split('.').slice(0, -1);
                var prevState = get(path, data.prevAppState);
                var nextState = get(path, data.nextAppState);
                logger(data.prevAppState, { name: data.action, data: data.msgData }, nextState);
            } }));
    }; };
}
//# sourceMappingURL=logger.js.map