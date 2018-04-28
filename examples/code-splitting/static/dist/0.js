webpackJsonp([0],{

/***/ "./src/counter.tsx":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "init", function() { return init; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "actions", function() { return actions; });
/* harmony export (immutable) */ __webpack_exports__["view"] = view;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__src_enhancers_picodom_render__ = __webpack_require__("../../src/enhancers/picodom-render.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__src_index__ = __webpack_require__("../../src/index.ts");


var initState = { count: 0 };
var init = function () { return initState; };
var actions = {
    down: function () { return function (state) { return ({ count: state.count - 1 }); }; },
    up: function () { return function (state) { return ({ count: state.count + 1 }); }; },
    upN: function (n) { return function (state) { return ({ count: state.count + n }); }; },
    upLater: (function () { return function (state, actions) {
        return [state,
            __WEBPACK_IMPORTED_MODULE_1__src_index__["a" /* Cmd */].ofPromise(function (n) {
                return new Promise(function (resolve) {
                    return setTimeout(function () { return resolve(n); }, 1000);
                });
            }, 10, actions.upN)];
    }; })
};
function view(state, actions) {
    return (__WEBPACK_IMPORTED_MODULE_0__src_enhancers_picodom_render__["a" /* React */].createElement("div", null,
        __WEBPACK_IMPORTED_MODULE_0__src_enhancers_picodom_render__["a" /* React */].createElement("h1", { className: "count" }, state.count),
        __WEBPACK_IMPORTED_MODULE_0__src_enhancers_picodom_render__["a" /* React */].createElement("button", { className: "up", onclick: actions.up }, "+"),
        __WEBPACK_IMPORTED_MODULE_0__src_enhancers_picodom_render__["a" /* React */].createElement("button", { className: "down", onclick: actions.down }, "\u2013"),
        __WEBPACK_IMPORTED_MODULE_0__src_enhancers_picodom_render__["a" /* React */].createElement("button", { className: "upLater", onclick: actions.upLater }, "+ later")));
}
/* harmony default export */ __webpack_exports__["default"] = ({ init: init, actions: actions, view: view });


/***/ })

});
//# sourceMappingURL=0.js.map