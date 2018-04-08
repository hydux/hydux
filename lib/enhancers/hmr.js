"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var globalState;
function withHmr(options) {
    return function (app) { return function (props) { return app(tslib_1.__assign({}, props, { init: function () {
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