"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var index_1 = require("./../index");
var globalState;
function withHmr() {
    return function (app) { return function (props) { return app(tslib_1.__assign({}, props, { init: function () {
            var result = index_1.normalizeInit(props.init());
            return [
                globalState || result.state,
                result.cmd,
            ];
        },
        onUpdate: function (data) {
            props.onUpdate && props.onUpdate(data);
            globalState = data.nextAppState;
        } })); }; };
}
exports.default = withHmr;
//# sourceMappingURL=hmr.js.map