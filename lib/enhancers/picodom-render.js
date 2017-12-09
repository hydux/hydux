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
exports.h = picodom_1.h;
var React = { createElement: picodom_1.h };
exports.React = React;
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