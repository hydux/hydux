import * as tslib_1 from "tslib";
import { Cmd } from './../index';
var globalState;
export default function withHmr() {
    return function (app) { return function (props) { return app(tslib_1.__assign({}, props, { init: function () {
            var result = props.init();
            if (!(result instanceof Array)) {
                result = [result, Cmd.none];
            }
            return [
                globalState || result[0],
                result[1],
            ];
        },
        onUpdate: function (data) {
            props.onUpdate && props.onUpdate(data);
            globalState = data.nextAppState;
        } })); }; };
}
//# sourceMappingURL=hmr.js.map