import * as tslib_1 from "tslib";
import { normalize } from './../index';
var globalState;
export default function withHmr() {
    return function (app) { return function (props) { return app(tslib_1.__assign({}, props, { init: function () {
            var result = normalize(props.init());
            result.state = globalState || result.state;
            return result;
        },
        onUpdated: function (data) {
            props.onUpdated && props.onUpdated(data);
            globalState = data.nextAppState;
        } })); }; };
}
//# sourceMappingURL=hmr.js.map