"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var index_1 = require("./../index");
var globalState;
function withHmr() {
    return function (app) { return function (props) { return app(tslib_1.__assign({}, props, { init: function () {
            var result = index_1.normalize(props.init());
            result.state = globalState || result.state;
            return result;
        },
        onUpdated: function (data) {
            props.onUpdated && props.onUpdated(data);
            globalState = data.nextAppState;
        } })); }; };
}
exports.default = withHmr;
//# sourceMappingURL=hmr.js.map