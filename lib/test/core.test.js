"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var assert = require('assert');
var index_1 = require("../src/index");
var logger_1 = require("../src/enhancers/logger");
describe('core api', function () {
    it('init', function () {
        var ctx;
        var state;
        var renderResult;
        ctx = index_1.default({
            init: function () { return ({ count: 1 }); },
            actions: {},
            view: function (state) { return function (actions) { return state; }; },
            render: function (view) { return renderResult = view; }
        });
        assert(ctx.getState().count === 1, 'simple state should work');
        assert.equal(renderResult.count, 1, 'simple state in view should work');
        state = { aa: 1, bb: { cc: 'aa' } };
        ctx = logger_1.default()(index_1.default)({
            init: function () { return state; },
            actions: {},
            view: function (state) { return function (actions) { return ({ type: 'view', state: state }); }; },
            render: function (view) { return renderResult = view; }
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
        assert(getState().count === 4, 'up should work');
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
            render: function (view) { return renderResult = view; }
        });
        testCounter(ctx, renderResult);
    });
    it('nested actions', function () {
        var counter = {
            init: function () { return ({ count: 1 }); },
            actions: {
                up: function (_) { return function (state) { return ({ count: state.count + 1 }); }; },
                down: function (_) { return function (state) { return ({ count: state.count - 1 }); }; },
                reset: function (_) { return ({ count: 1 }); },
            }
        };
        var ctx;
        var state;
        var renderResult;
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
            render: function (view) { return renderResult = view; }
        });
        testCounter(ctx, renderResult, ['counter1']);
        assert(ctx.getState().counter2.count === 1, 'counter2 should be invariant');
        testCounter(ctx, renderResult, ['counter2']);
        assert(ctx.getState().counter1.count === 1, 'counter1 should be invariant');
    });
});
//# sourceMappingURL=core.test.js.map