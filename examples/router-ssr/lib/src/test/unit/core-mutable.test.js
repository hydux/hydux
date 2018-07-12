var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
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
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
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
        up: function () { return function (state) { return (state.count += 1, state); }; },
        upN: function (n) { return function (state, actions) { return (state.count += n, state); }; },
        down: function () { return function (state) { return (state.count -= 1, state); }; },
        reset: function () { return function (state) { return (state.count = 1, state); }; },
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
describe('mutable core api', function () {
    it('init', function () {
        var ctx;
        var state;
        var renderResult;
        ctx = app({
            init: function () { return ({ count: 1 }); },
            actions: {},
            view: function (state) { return function (actions) { return state; }; },
            onRender: function (view) { return renderResult = view; },
            mutable: true,
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
        var ctx = app({
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
    it('nested async actions', function () { return __awaiter(_this, void 0, void 0, function () {
        var state, renderResult, _state, actions, ctx;
        return __generator(this, function (_a) {
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
            counter1: __assign({}, Counter.actions, { upN: function (n) { return withParents(Counter.actions.upN, function (action, parentState, parentActions, _, __) {
                    var pc = parentState.counter1.count;
                    var _a = action(n + 1), state = _a.state, cmd = _a.cmd;
                    assert.equal(state.count, pc + n + 1, 'call child action work');
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
            onRender: noop,
            mutable: true,
        });
        ctx.actions.counter1.upN(1);
        assert.equal(ctx.state.counter1.count, 3, 'counter1 upN work');
        assert.equal(ctx.state.counter2.count, 2, 'counter2 upN work');
    });
});
//# sourceMappingURL=core-mutable.test.js.map