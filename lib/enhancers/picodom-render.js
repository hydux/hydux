"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
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
function withPicodom(container) {
    if (container === void 0) { container = document.body; }
    var node;
    var rafId;
    return function (app) { return function (props) { return app(__assign({}, props, { init: function () {
            // fix duplicate node in hmr
            container.innerHTML = '';
            return props.init();
        },
        onRender: function (view) {
            props.onRender && props.onRender(view);
            if (rafId) {
                window.cancelAnimationFrame(rafId);
            }
            rafId = window.requestAnimationFrame(function () { return picodom_1.patch(node, (node = view), container); });
        } })); }; };
}
exports.default = withPicodom;
//# sourceMappingURL=picodom-render.js.map