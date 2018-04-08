import * as tslib_1 from "tslib";
import { patch, createNode as _h } from 'ultradom';
var React = { createElement: h };
export { React };
export function h(type, props) {
    var children = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        children[_i - 2] = arguments[_i];
    }
    if (props) {
        for (var key in props) {
            if (key.match(/^on[A-Z]\w+$/)) {
                props[key.toLowerCase()] = props[key];
            }
        }
    }
    return _h.apply(void 0, [type, props].concat(children));
}
var __HYDUX_RENDER_NODE__ = '__HYDUX_RENDER_NODE__';
export default function withUltradom(container, options) {
    if (container === void 0) { container = document.body; }
    if (options === void 0) { options = { raf: true }; }
    var rafId;
    return function (app) { return function (props) { return app(tslib_1.__assign({}, props, { onRender: function (view) {
            props.onRender && props.onRender(view);
            // fix duplicate node in hmr
            var render = function () {
                var rootEl = container[__HYDUX_RENDER_NODE__];
                if (!rootEl) {
                    rootEl = container[__HYDUX_RENDER_NODE__] = patch(view);
                    container.appendChild(rootEl);
                }
                else {
                    container[__HYDUX_RENDER_NODE__] = patch(view, rootEl);
                }
            };
            if (!options.raf) {
                return render();
            }
            if (rafId) {
                window.cancelAnimationFrame(rafId);
            }
            rafId = window.requestAnimationFrame(render);
        } })); }; };
}
//# sourceMappingURL=ultradom-render.js.map