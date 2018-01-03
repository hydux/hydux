"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var assert = require("assert");
var index_1 = require("../index");
var logger_1 = require("../enhancers/logger");
function sleep(ns) {
    return new Promise(function (resolve) { return setTimeout(resolve, ns); });
}
describe('core api', function () {
    it('init', function () {
        var ctx;
        var state;
        var renderResult;
        ctx = index_1.default({
            init: function () { return ({ count: 1 }); },
            actions: {},
            view: function (state) { return function (actions) { return state; }; },
            onRender: function (view) { return renderResult = view; }
        });
        assert(ctx.getState().count === 1, 'simple state should work');
        assert.equal(renderResult.count, 1, 'simple state in view should work');
        state = { aa: 1, bb: { cc: 'aa' } };
        ctx = logger_1.default()(index_1.default)({
            init: function () { return state; },
            actions: {},
            view: function (state, actions) { return ({ type: 'view', state: state }); },
            onRender: function (view) { return renderResult = view; }
        });
        assert.deepStrictEqual(ctx.getState(), state, 'nested state should work');
        assert.deepStrictEqual(renderResult, { type: 'view', state: state }, 'nested state in view should work');
    });
    function testCounter(ctx, renderResult, path) {
        if (path === void 0) { path = []; }
        function getState() {
            var state = ctx.getState();
            for (var i in path) {
                state = state[path[i]];
            }
            return state;
        }
        var actions = ctx.actions;
        for (var i in path) {
            actions = actions[path[i]];
        }
        assert(getState().count === 1, 'init should work');
        assert.deepStrictEqual(ctx.actions, renderResult, 'actions in ctx should work');
        actions.up();
        actions.up();
        actions.up();
        console.log('getState().count', getState());
        assert.equal(getState().count, 4, 'up should work');
        actions.down();
        actions.down();
        assert(getState().count === 2, 'down should work');
        actions.reset();
        assert(getState().count === 1, 'reset should work');
    }
    it('actions', function () {
        var ctx;
        var state;
        var renderResult;
        ctx = index_1.default({
            init: function () { return ({ count: 1 }); },
            actions: {
                up: function (_) { return function (state) { return ({ count: state.count + 1 }); }; },
                down: function (_) { return function (state) { return ({ count: state.count - 1 }); }; },
                reset: function (_) { return ({ count: 1 }); },
            },
            view: function (state) { return function (actions) { return actions; }; },
            onRender: function (view) { return renderResult = view; }
        });
        testCounter(ctx, renderResult);
    });
    it('nested async actions', function () { return __awaiter(_this, void 0, void 0, function () {
        var counter, ctx, state, renderResult;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    counter = {
                        init: function () { return ({ count: 1 }); },
                        actions: {
                            up: function (_) { return function (state) { return ({ count: state.count + 1 }); }; },
                            upN: function (n) { return function (state) { return ({ count: state.count + n }); }; },
                            down: function (_) { return function (state) { return ({ count: state.count - 1 }); }; },
                            reset: function (_) { return ({ count: 1 }); },
                            up12: function (_) { return function (state, actions) { return actions.upN(12); }; },
                            upLaterByPromise: function (n) { return function (state) { return function (actions) { return new Promise(function (resolve) {
                                return setTimeout(function () { return resolve(actions.upN(n)); }, 10);
                            }); }; }; },
                            upLater: function () { return function (state) { return function (actions) { return [state, index_1.Cmd.ofPromise(function () { return new Promise(function (resolve) { return setTimeout(function () { return resolve(); }, 10); }); }, void 0, actions.up)]; }; }; },
                            upLaterWithBatchedCmd: function () { return function (state) { return function (actions) { return [state, index_1.Cmd.batch([
                                    index_1.Cmd.ofPromise(function () { return new Promise(function (resolve) { return setTimeout(function () { return resolve(); }, 10); }); }, void 0, actions.up)
                                ])]; }; }; }
                        }
                    };
                    ctx = index_1.default({
                        init: function () { return ({
                            counter1: counter.init(),
                            counter2: counter.init(),
                        }); },
                        actions: {
                            counter1: counter.actions,
                            counter2: counter.actions,
                        },
                        view: function (state) { return function (actions) { return actions; }; },
                        onRender: function (view) { return renderResult = view; }
                    });
                    assert(ctx.getState().counter1.count === 1, 'counter1 init should work');
                    ctx.actions.counter1.upLater();
                    assert(ctx.getState().counter1.count === 1, 'counter1 should work 1');
                    return [4 /*yield*/, sleep(10)];
                case 1:
                    _a.sent();
                    assert.equal(ctx.getState().counter1.count, 2, 'counter1 should work 2');
                    ctx.actions.counter1.upLater();
                    return [4 /*yield*/, sleep(10)];
                case 2:
                    _a.sent();
                    assert(ctx.getState().counter1.count === 3, 'counter1 should work 3');
                    ctx.actions.counter1.upLaterByPromise(3);
                    assert(ctx.getState().counter1.count === 3, 'upLaterByPromise should work 3');
                    return [4 /*yield*/, sleep(10)];
                case 3:
                    _a.sent();
                    assert(ctx.getState().counter1.count === 6, 'upLaterByPromise should work 6');
                    ctx.actions.counter1.upLaterWithBatchedCmd();
                    assert(ctx.getState().counter1.count === 6, 'upLaterWithBatchedCmd should work 6');
                    return [4 /*yield*/, sleep(10)];
                case 4:
                    _a.sent();
                    assert(ctx.getState().counter1.count === 7, 'upLaterWithBatchedCmd should work 7');
                    ctx.actions.counter1.up12();
                    assert(ctx.getState().counter1.count === 19, 'up12 should work 19');
                    return [2 /*return*/];
            }
        });
    }); });
});
//# sourceMappingURL=core.test.js.map