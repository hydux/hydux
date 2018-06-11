import * as tslib_1 from "tslib";
import { normalizeInit } from './../index';
var globalState;
export default function withHmr() {
    return function (app) { return function (props) { return app(tslib_1.__assign({}, props, { init: function () {
            var result = normalizeInit(props.init());
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
//# sourceMappingURL=hmr.js.map