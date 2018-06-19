"use strict";
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var utils_1 = require("./../../utils");
var assert = require("assert");
var index_1 = require("../../index");
var logger_1 = require("../../enhancers/logger");
function sleep(ns) {
    return new Promise(function (resolve) { return setTimeout(resolve, ns); });
}
var Counter = {
    init: function () { return ({ count: 1 }); },
    actions: {
        up: function () { return function (state) { return (state.count += 1, state); }; },
        upN: function (n) { return function (state, actions) { return (state.count += n, state); }; },
        down: function () { return function (state) { return (state.count -= 1, state); }; },
        reset: function () { return function (state) { return (state.count = 1, state); }; },
        up12: function () { return function (state, actions) { return actions.upN(12); }; },
        upLaterByPromise: function (n) { return function (state) { return function (actions) { return new Promise(function (resolve) {
            return setTimeout(function () { return resolve(actions.upN(n)); }, 10);
        }); }; }; },
        upLater: function () { return function (state) { return function (actions) { return [state, index_1.Cmd.ofPromise(function () { return new Promise(function (resolve) { return setTimeout(function () { return resolve(); }, 10); }); }, void 0, actions.up)]; }; }; },
        upLaterObj: function () { return function (state) { return function (actions) { return ({
            state: state,
            cmd: index_1.Cmd.ofPromise(function () { return new Promise(function (resolve) { return setTimeout(function () { return resolve(); }, 10); }); }, void 0, actions.up)
        }); }; }; },
        upLaterWithBatchedCmd: function () { return function (state) { return function (actions) { return [state, index_1.Cmd.batch([
                index_1.Cmd.ofPromise(function () { return new Promise(function (resolve) { return setTimeout(function () { return resolve(); }, 10); }); }, void 0, actions.up)
            ])]; }; }; }
    }
};
var _dummyState = Counter.init();
describe('mutable core api', function () {
    it('init', function () {
        var ctx;
        var state;
        var renderResult;
        ctx = index_1.default({
            init: function () { return ({ count: 1 }); },
            actions: {},
            view: function (state) { return function (actions) { return state; }; },
            onRender: function (view) { return renderResult = view; },
            mutable: true,
        });
        assert(ctx.state.count === 1, 'simple state should work');
        assert.equal(renderResult.count, 1, 'simple state in view should work');
        state = { aa: 1, bb: { cc: 'aa' } };
        ctx = logger_1.default()(index_1.default)({
            init: function () { return state; },
            actions: {},
            view: function (state, actions) { return ({ type: 'view', state: state }); },
            onRender: function (view) { return renderResult = view; }
        });
        assert.deepStrictEqual(ctx.state, state, 'nested state should work');
        assert.deepStrictEqual(renderResult, { type: 'view', state: state }, 'nested state in view should work');
    });
    function testCounter(ctx, renderResult, path) {
        if (path === void 0) { path = []; }
        function getState() {
            var state = ctx.state;
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
                up: function (_) { return function (state) { return (state.count += 1, state); }; },
                down: function (_) { return function (state) { return (state.count -= 1, state); }; },
                reset: function (_) { return function (state) { return (state.count = 1, state); }; },
            },
            view: function (state) { return function (actions) { return actions; }; },
            onRender: function (view) { return renderResult = view; },
            mutable: true,
        });
        testCounter(ctx, renderResult);
    });
    it('complex actions', function () {
        var state;
        var renderResult;
        var ClassActions = /** @class */ (function () {
            function ClassActions(inc) {
                var _this = this;
                this.up = function () { return function (state) {
                    return ({ count: state.count + _this._inc });
                }; };
                this._inc = inc;
            }
            return ClassActions;
        }());
        var ctx = index_1.default({
            init: function () { return ({ count: 1, classActions: { count: 1 } }); },
            actions: {
                classActions: new ClassActions(10),
                xx: 'aaa',
                _actions: new Date(),
                up: function (_) { return function (state) { return (state.count += 1, state); }; },
                down: function (_) { return function (state) { return (state.count -= 1, state); }; },
                reset: function (_) { return function (state) { return (state.count = 1, state); }; },
            },
            view: function (state) { return function (actions) { return actions; }; },
            onRender: function (view) { return renderResult = view; },
            mutable: true,
        });
        testCounter(ctx, renderResult);
        assert.deepEqual(ctx.state.classActions.count, 1, 'classActions state work');
        ctx.actions.classActions.up();
        assert.deepEqual(ctx.state.classActions.count, 11, 'classActions should work');
    });
    it('nested async actions', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
        var state, renderResult, _state, actions, ctx;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _state = {
                        counter1: Counter.init(),
                        counter2: Counter.init(),
                    };
                    actions = {
                        counter1: Counter.actions,
                        counter2: Counter.actions,
                    };
                    ctx = index_1.default({
                        init: function () { return _state; },
                        actions: actions,
                        view: function (state) { return function (actions) { return actions; }; },
                        onRender: function (view) { return renderResult = view; },
                        mutable: true,
                    });
                    assert(ctx.state.counter1.count === 1, 'counter1 init should work');
                    ctx.actions.counter1.upLater();
                    assert(ctx.state.counter1.count === 1, 'counter1 should work 1');
                    return [4 /*yield*/, sleep(10)];
                case 1:
                    _a.sent();
                    assert.equal(ctx.state.counter1.count, 2, 'counter1 should work 2');
                    ctx.actions.counter1.upLater();
                    return [4 /*yield*/, sleep(10)];
                case 2:
                    _a.sent();
                    assert(ctx.state.counter1.count === 3, 'counter1 should work 3');
                    ctx.actions.counter1.upLaterByPromise(3);
                    assert(ctx.state.counter1.count === 3, 'upLaterByPromise should work 3');
                    return [4 /*yield*/, sleep(10)];
                case 3:
                    _a.sent();
                    assert(ctx.state.counter1.count === 6, 'upLaterByPromise should work 6');
                    ctx.actions.counter1.upLaterWithBatchedCmd();
                    assert(ctx.state.counter1.count === 6, 'upLaterWithBatchedCmd should work 6');
                    return [4 /*yield*/, sleep(10)];
                case 4:
                    _a.sent();
                    assert(ctx.state.counter1.count === 7, 'upLaterWithBatchedCmd should work 7');
                    ctx.actions.counter1.up12();
                    assert(ctx.state.counter1.count === 19, 'up12 should work 19');
                    return [2 /*return*/];
            }
        });
    }); });
    it('parent actions', function () {
        var initState = {
            counter1: Counter.init(),
            counter2: Counter.init(),
        };
        // const counter1Actions: CounterActions =
        var actions = {
            counter2: Counter.actions,
            counter1: tslib_1.__assign({}, Counter.actions, { upN: function (n) { return index_1.withParents(Counter.actions.upN, function (action, parentState, parentActions, _, __) {
                    var pc = parentState.counter1.count;
                    var _a = action(n + 1), state = _a.state, cmd = _a.cmd;
                    assert.equal(state.count, pc + n + 1, 'call child action work');
                    return [
                        state,
                        index_1.Cmd.batch(cmd, index_1.Cmd.ofFn(function () { return parentActions.counter2.up(); }))
                    ];
                }); } }),
        };
        var ctx = index_1.default({
            init: function () { return initState; },
            actions: actions,
            view: function (state) { return function (actions) { return actions; }; },
            onRender: utils_1.noop,
            mutable: true,
        });
        ctx.actions.counter1.upN(1);
        assert.equal(ctx.state.counter1.count, 3, 'counter1 upN work');
        assert.equal(ctx.state.counter2.count, 2, 'counter2 upN work');
    });
});
//# sourceMappingURL=core-mutable.test.js.map