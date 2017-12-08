var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
import Cmd from './../cmd';
export default function withPersist(_a) {
    var _b = _a === void 0 ? {} : _a, _c = _b.store, store = _c === void 0 ? localStorage : _c, _d = _b.serialize, serialize = _d === void 0 ? JSON.stringify : _d, _e = _b.deserialize, deserialize = _e === void 0 ? JSON.parse : _e, _f = _b.debounce, debounce = _f === void 0 ? 50 : _f, _g = _b.key, key = _g === void 0 ? 'hydux-persist' : _g;
    var timer;
    return function (app) { return function (props) {
        return app(__assign({}, props, { init: function () {
                var result = props.init();
                if (!(result instanceof Array)) {
                    result = [result, Cmd.none];
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
//# sourceMappingURL=persist.js.map