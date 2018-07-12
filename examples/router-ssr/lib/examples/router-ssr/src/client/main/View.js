import { React } from 'hydux-react';
import { mkLink, } from '../../../../../src/enhancers/router';
import { history, subComps } from './State';
var NoMatch = function () { return React.createElement("div", null, "404"); };
var Home = function () { return React.createElement("div", null, "Home"); };
var Users = function () { return React.createElement("div", null, "Users"); };
var Link = mkLink(history, React.createElement);
var renderRoutes = function (state, actions) {
    var Counter = state.lazyComps.counter;
    switch (state.page) {
        case 'home':
            return React.createElement("div", null, "Home");
        case 'counter':
            console.log('client state', state);
            if (Counter) {
                return Counter.view(state.counter, actions.counter);
            }
            return React.createElement("div", null, "Loading...");
        case '404':
            return React.createElement(NoMatch, null);
        case 'counter2':
            return subComps.render('counter2', state, actions);
        case 'counter3':
            return subComps.render('counter3', state, actions);
        default:
            switch (state.page.page) {
                case 'user':
                    return React.createElement("div", null,
                        "User: ",
                        state.page.id);
            }
    }
};
export var root = function (state, actions) { return (React.createElement("main", null,
    React.createElement("style", null, "\n        a {\n          margin-right: 5px;\n        }\n    "),
    React.createElement("h1", null, "Router example"),
    React.createElement(Link, { className: "home", to: "/" }, "Home"),
    React.createElement(Link, { className: "users", to: "/user/1" }, "Users"),
    React.createElement(Link, { className: "accounts", to: "/accounts" }, "Accounts"),
    React.createElement(Link, { className: "counter", to: "/counter", prefetch: true }, "Counter"),
    React.createElement(Link, { className: "counter2", to: "/counter2", prefetch: true }, "Counter"),
    React.createElement(Link, { className: "counter3", to: "/counter3", prefetch: true }, "Counter"),
    React.createElement(Link, { className: "e404", to: "/404" }, "404"),
    React.createElement("div", { className: "main" }, renderRoutes(state, actions)))); };
//# sourceMappingURL=View.js.map