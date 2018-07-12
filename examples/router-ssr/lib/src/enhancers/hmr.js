var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
import { normalize } from './../index';
var globalState;
export default function withHmr() {
    return function (app) { return function (props) { return app(__assign({}, props, { init: function () {
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