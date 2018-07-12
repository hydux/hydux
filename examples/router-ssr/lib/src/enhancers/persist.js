var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
import { normalize } from '../index';
export default function withPersist(props) {
    if (props === void 0) { props = {}; }
    var _a = props.store, store = _a === void 0 ? localStorage : _a, _b = props.serialize, serialize = _b === void 0 ? JSON.stringify : _b, _c = props.deserialize, deserialize = _c === void 0 ? JSON.parse : _c, _d = props.debounce, debounce = _d === void 0 ? 50 : _d, _e = props.key, key = _e === void 0 ? 'hydux-persist' : _e;
    var timer;
    return function (app) { return function (props) {
        return app(__assign({}, props, { init: function () {
                var result = normalize(props.init());
                try {
                    var persistState = store.getItem(key);
                    if (persistState) {
                        result.state = deserialize(persistState);
                    }
                }
                catch (error) {
                    console.error(error);
                }
                return result;
            }, onUpdated: function (data) {
                props.onUpdated && props.onUpdated(data);
                timer && clearTimeout(timer);
                var persist = function () { return store.setItem(key, serialize(data.nextAppState)); };
                timer = setTimeout(persist, debounce);
            } }));
    }; };
}
//# sourceMappingURL=persist.js.map