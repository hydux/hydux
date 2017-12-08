var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
import Cmd from './../cmd';
export default function withRouter(_a) {
    var _b = _a === void 0 ? {} : _a, _c = _b.type, type = _c === void 0 ? 'hash' : _c, _d = _b.routes, routes = _d === void 0 ? {} : _d;
    var timer;
    return function (app) { return function (props) {
        return app(__assign({}, props, { init: function () {
                return props.init('aaa');
            }, subscribe: function (state) { return Cmd.batch(Cmd.ofSub(function (actions) {
                window.addEventListener('hashchange', function (e) {
                    var url = location.hash.replace('#', '');
                });
            }), props.subscribe ? props.subscribe(state) : Cmd.none); }, actions: __assign({}, props.actions, { routes: {}, location: {
                    assign: function (path) {
                        location.hash = '#' + path;
                    },
                    replace: function (path) {
                        location.replace('#' + path);
                    },
                } }) }));
    }; };
}
//# sourceMappingURL=router.js.map