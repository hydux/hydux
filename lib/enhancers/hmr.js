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
var globalState;
function withHmr(options) {
    return function (app) { return function (props) { return app(__assign({}, props, { init: function () {
            var result = props.init();
            if (!(result instanceof Array)) {
                result = [result, []];
            }
            return [globalState || result[0], result[1]];
        },
        onUpdate: function (data) {
            props.onUpdate && props.onUpdate(data);
            globalState = data.nextAppState;
        } })); }; };
}
exports.default = withHmr;
//# sourceMappingURL=hmr.js.map