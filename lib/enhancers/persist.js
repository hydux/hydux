"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var cmd_1 = require("./../cmd");
function withPersist(props) {
    if (props === void 0) { props = {}; }
    var _a = props.store, store = _a === void 0 ? localStorage : _a, _b = props.serialize, serialize = _b === void 0 ? JSON.stringify : _b, _c = props.deserialize, deserialize = _c === void 0 ? JSON.parse : _c, _d = props.debounce, debounce = _d === void 0 ? 50 : _d, _e = props.key, key = _e === void 0 ? 'hydux-persist' : _e;
    var timer;
    return function (app) { return function (props) {
        return app(tslib_1.__assign({}, props, { init: function () {
                var result = props.init();
                if (!(result instanceof Array)) {
                    result = [result, cmd_1.default.none];
                }
                var persistState = store.getItem(key);
                if (persistState) {
                    result[0] = deserialize(persistState);
                }
                return [result[0], result[1]];
            }, onUpdate: function (data) {
                props.onUpdate && props.onUpdate(data);
                timer && clearTimeout(timer);
                var persist = function () { return store.setItem(key, serialize(data.nextAppState)); };
                timer = setTimeout(persist, debounce);
            } }));
    }; };
}
exports.default = withPersist;
//# sourceMappingURL=persist.js.map