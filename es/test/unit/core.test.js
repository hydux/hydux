var _this = this;
import * as tslib_1 from "tslib";
import { noop } from './../../utils';
import * as assert from 'assert';
import app, { Cmd, withParents } from '../../index';
import logger from '../../enhancers/logger';
function sleep(ns) {
    return new Promise(function (resolve) { return setTimeout(resolve, ns); });
}
var Counter = {
    init: function () { return ({ count: 1 }); },
    actions: {
        up: function () { return function (state) { return ({ count: state.count + 1 }); }; },
        upN: function (n) { return function (state, actions) { return ({ count: state.count + n }); }; },
        down: function () { return function (state) { return ({ count: state.count - 1 }); }; },
        reset: function () { return ({ count: 1 }); },
        up12: function () { return function (state, actions) { return actions.upN(12); }; },
        upLaterByPromise: function (n) { return function (state) { return function (actions) { return new Promise(function (resolve) {
            return setTimeout(function () { return resolve(actions.upN(n)); }, 10);
        }); }; }; },
        upLater: function () { return function (state) { return function (actions) { return [state, Cmd.ofPromise(function () { return new Promise(function (resolve) { return setTimeout(function () { return resolve(); }, 10); }); }, void 0, actions.up)]; }; }; },
        upLaterObj: function () { return function (state) { return function (actions) { return ({
            state: state,
            cmd: Cmd.ofPromise(function () { return new Promise(function (resolve) { return setTimeout(function () { return resolve(); }, 10); }); }, void 0, actions.up)
        }); }; }; },
        upLaterWithBatchedCmd: function () { return function (state) { return function (actions) { return [state, Cmd.batch([
                Cmd.ofPromise(function () { return new Promise(function (resolve) { return setTimeout(function () { return resolve(); }, 10); }); }, void 0, actions.up)
            ])]; }; }; }
    }
};
var _dummyState = Counter.init();
describe('core api', function () {
    it('init', function () {
        var ctx;
        var state;
        var renderResult;
        ctx = app({
            init: function () { return ({ count: 1 }); },
            actions: {},
            view: function (state) { return function (actions) { return state; }; },
            onRender: function (view) { return renderResult = view; }
        });
        assert(ctx.state.count === 1, 'simple state should work');
        assert.equal(renderResult.count, 1, 'simple state in view should work');
        state = { aa: 1, bb: { cc: 'aa' } };
        ctx = logger()(app)({
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
        ctx = app({
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
        var ctx = app({
            init: function () { return ({ count: 1, classActions: { count: 1 } }); },
            actions: {
                classActions: new ClassActions(10),
                xx: 'aaa',
                _actions: new Date(),
                up: function (_) { return function (state) { return ({ count: state.count + 1 }); }; },
                down: function (_) { return function (state) { return ({ count: state.count - 1 }); }; },
                reset: function (_) { return ({ count: 1 }); },
            },
            view: function (state) { return function (actions) { return actions; }; },
            onRender: function (view) { return renderResult = view; }
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
                    ctx = app({
                        init: function () { return _state; },
                        actions: actions,
                        view: function (state) { return function (actions) { return actions; }; },
                        onRender: function (view) { return renderResult = view; }
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
            counter1: tslib_1.__assign({}, Counter.actions, { upN: function (n) { return withParents(Counter.actions.upN, function (action, parentState, parentActions, _, __) {
                    var _a = action(n + 1), state = _a[0], cmd = _a[1];
                    assert.equal(state.count, parentState.counter1.count + n + 1, 'call child action work');
                    return [
                        state,
                        Cmd.batch(cmd, Cmd.ofFn(function () { return parentActions.counter2.up(); }))
                    ];
                }); } }),
        };
        var ctx = app({
            init: function () { return initState; },
            actions: actions,
            view: function (state) { return function (actions) { return actions; }; },
            onRender: noop
        });
        ctx.actions.counter1.upN(1);
        assert.equal(ctx.state.counter1.count, 3, 'counter1 upN work');
        assert.equal(ctx.state.counter2.count, 2, 'counter2 upN work');
    });
});
//# sourceMappingURL=core.test.js.map