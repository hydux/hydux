"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var index_1 = require("./../index");
var cmd_1 = require("./../cmd");
function withSSR(options) {
    var _this = this;
    return function (app) { return function (props) {
        var initCmd = cmd_1.default.none;
        var ctx = app(tslib_1.__assign({}, props, { init: function () {
                var result = index_1.normalize(props.init());
                initCmd = result.cmd;
                result.cmd = cmd_1.default.none;
                return result;
            },
            onRender: function () {
                // ignore
                return;
            } }));
        ctx.render = function (state) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var view;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Promise.all(initCmd.map(function (sub) { return sub(ctx.actions); }))];
                    case 1:
                        _a.sent();
                        state = state || ctx.state;
                        view = ctx.view(state, ctx.actions);
                        return [2 /*return*/, options.renderToString(view)];
                }
            });
        }); };
        var newCtx = new Proxy(ctx, {
            get: function (t, p, r) {
                if (p === 'state') {
                    var s = t.state;
                    if ('lazyComps' in s) {
                        return tslib_1.__assign({}, s, { lazyComps: {} });
                    }
                    return s;
                }
                return t[p];
            }
        });
        return newCtx;
    }; };
}
exports.default = withSSR;
//# sourceMappingURL=ssr.js.map