var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
import { patch, h } from 'picodom';
var React = { createElement: h };
export { h, React };
export default function withPicodom(container) {
    if (container === void 0) { container = document.body; }
    var node;
    var rafId;
    return function (app) { return function (props) { return app(__assign({}, props, { init: function () {
            // fix duplicate node in hmr
            container.innerHTML = '';
            return props.init();
        },
        render: function (view) {
            if (rafId) {
                window.cancelAnimationFrame(rafId);
            }
            rafId = window.requestAnimationFrame(function () { return patch(node, (node = view), container); });
        } })); }; };
}
//# sourceMappingURL=picodom-render.js.map