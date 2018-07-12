import { React } from 'hydux-react';
import * as Hydux from '../../../../src/index';
import * as Utils from './utils';
var Cmd = Hydux.Cmd;
export var init = function (title) {
    if (title === void 0) { title = 'Counter1'; }
    return ({
        state: { count: 0, title: title },
        cmd: Cmd.ofSub(function (_) {
            return Utils.fetch("/api/initcount")
                .then(function (res) { return res.json(); })
                .then(function (data) { return _.setCount(data.count); });
        })
    });
};
export var actions = {
    setCount: function (count) { return function (state) { return ({ count: count }); }; },
    down: function () { return function (state) { return ({ count: state.count - 1 }); }; },
    up: function () { return function (state) { return ({ count: state.count + 1 }); }; },
    upN: function (n) { return function (state) { return ({ count: state.count + n }); }; },
    upLater: function () { return function (state, actions) {
        return [state,
            Cmd.ofPromise(function (n) {
                return new Promise(function (resolve) {
                    return setTimeout(function () { return resolve(n); }, 1000);
                });
            }, 10, actions.upN)];
    }; }
};
export var view = function (state, actions) { return (React.createElement("div", null,
    React.createElement("h1", { className: "count" },
        state.title,
        ": ",
        state.count),
    React.createElement("button", { className: "down", onClick: actions.down }, "\u2013"),
    React.createElement("button", { className: "up", onClick: actions.up }, "+"),
    React.createElement("button", { className: "upLater", onClick: actions.upLater }, "+ later"))); };
//# sourceMappingURL=counter.js.map