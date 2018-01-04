"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var picodom_1 = require("picodom");
var React = { createElement: h };
exports.React = React;
function h(type, props) {
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
    return picodom_1.h.apply(void 0, [type, props].concat(children));
}
exports.h = h;
function withPicodom(container, options) {
    if (container === void 0) { container = document.body; }
    if (options === void 0) { options = { raf: true }; }
    var rafId;
    return function (app) { return function (props) { return app(tslib_1.__assign({}, props, { onRender: function (view) {
            props.onRender && props.onRender(view);
            // fix duplicate node in hmr
            var render = function () {
                return picodom_1.patch(container.__HYDUX_PICO_NODE__, (container.__HYDUX_PICO_NODE__ = view), container);
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
exports.default = withPicodom;
//# sourceMappingURL=picodom-render.js.map