"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var cmd_1 = require("./../../cmd");
var history_1 = require("./history");
exports.BaseHistory = history_1.BaseHistory;
exports.HashHistory = history_1.HashHistory;
exports.BrowserHistory = history_1.BrowserHistory;
var ROUTE_ACTION = '@@hydux-router/CHANGE_LOCATION';
function parsePath(path) {
    var splits = path.split('?');
    var pathname = decodeURI(splits[0]);
    var search = splits[1] ? '?' + splits[1] : '';
    var query = search.slice(1).split('&').filter(Boolean)
        .reduce(function (query, kv) {
        var _a = kv.split('=').map(decodeURIComponent), key = _a[0], value = _a[1];
        if (query[key]) {
            query[key] = Array.prototype.concat.call([], query[key], value);
        }
        else {
            query[key] = value || '';
        }
        return query;
    }, {});
    return { pathname: pathname, params: {}, query: query, search: search, template: null };
}
exports.parsePath = parsePath;
var isNotEmpty = function (s) { return s !== ''; };
function matchPath(pathname, fmt) {
    var paramKeys = [];
    var re = '^' + fmt.replace(/\/$/, '').replace(/([.%|(){}\[\]])/g, '\\$1').replace('*', '.*').replace(/\/\:([\w]+)/g, function (m, name) {
        paramKeys.push(name);
        return '/([^/]+)';
    }) + '\/?$';
    var match = pathname.match(new RegExp(re));
    if (match) {
        var params = paramKeys.reduce(function (params, key, i) {
            return (tslib_1.__assign({}, params, (_a = {}, _a[key] = match && match[i + 1], _a)));
            var _a;
        }, {});
        return [true, params];
    }
    else {
        return [false, {}];
    }
}
exports.matchPath = matchPath;
function mkLink(history, h) {
    var React = { createElement: h };
    return function Link(_a, children) {
        var to = _a.to, onClick = _a.onClick, _b = _a.replace, replace = _b === void 0 ? false : _b, props = tslib_1.__rest(_a, ["to", "onClick", "replace"]);
        function handleClick(e) {
            if (replace) {
                history.replace(to);
            }
            else {
                history.push(to);
            }
            e.preventDefault();
            e.stopPropagation();
            onClick && onClick(e);
        }
        return React.createElement("a", tslib_1.__assign({ href: to }, props, { onclick: handleClick, onClick: handleClick }), children);
    };
}
exports.mkLink = mkLink;
function withRouter(props) {
    if (props === void 0) { props = {}; }
    var _a = props.history, history = _a === void 0 ? new history_1.HashHistory() : _a, _b = props.routes, routes = _b === void 0 ? {} : _b;
    var timer;
    return function (app) { return function (props) {
        function pathToLoc(path) {
            var loc = parsePath(path);
            for (var key in routes) {
                var _a = matchPath(loc.pathname, key), match = _a[0], params = _a[1];
                if (match) {
                    loc.params = params;
                    loc.template = key;
                    break;
                }
            }
            return loc;
        }
        return app(tslib_1.__assign({}, props, { init: function () {
                var result = props.init();
                if (!(result instanceof Array)) {
                    result = [result, cmd_1.default.none];
                }
                var loc = pathToLoc(history.current());
                var cmd = result[1];
                if (loc) {
                    cmd = cmd_1.default.batch(result[1], cmd_1.default.ofSub(function (actions) { return actions[ROUTE_ACTION](loc); }));
                }
                return [tslib_1.__assign({}, result[0], { location: loc }), cmd];
            }, subscribe: function (state) { return cmd_1.default.batch(cmd_1.default.ofSub(function (actions) {
                history.listen(function (path) {
                    var loc = pathToLoc(path);
                    actions[ROUTE_ACTION](loc);
                });
            }), props.subscribe ? props.subscribe(state) : cmd_1.default.none); }, actions: tslib_1.__assign({}, props.actions, (_a = { history: {
                        push: function (path) { return (history.push(path), void 0); },
                        replace: function (path) { return (history.replace(path), void 0); },
                        go: function (delta) { return (history.go(delta), void 0); },
                        back: function () { return (history.back(), void 0); },
                        forward: function () { return (history.forward(), void 0); },
                    } }, _a[ROUTE_ACTION] = function (loc) {
                if (loc.template) {
                    return routes[loc.template](loc);
                }
                else {
                    return function (state) { return (tslib_1.__assign({}, state, { location: loc })); };
                }
            }, _a)) }));
        var _a;
    }; };
}
exports.default = withRouter;
function join() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return args.join('/').replace(/\/+/g, '/');
}
exports.join = join;
/**
 * @param routes nested routes contains path, action, children, it would parse it to a `route` field (path:action map) for router enhancer, and a `meta` field which contains each route's parents.
 */
function parseNestedRoutes(routes) {
    function rec(routes, newRoutes) {
        var children = routes.children || [];
        newRoutes[routes.path] = tslib_1.__assign({}, routes, { parents: routes.parents || [], children: children.map(function (r) { return (tslib_1.__assign({}, r, { parents: void 0, children: void 0 })); }) });
        children
            .map(function (r) { return (tslib_1.__assign({}, r, { path: join(routes.path, r.path), action: r.action, parents: (routes.parents || []).concat(tslib_1.__assign({}, routes, { parents: void 0, children: void 0 })), children: r.children })); })
            .forEach(function (r) { return rec(r, newRoutes); });
        return newRoutes;
    }
    var meta = rec(routes, {});
    var simpleRoutes = {};
    for (var key in meta) {
        var route = meta[key];
        if (route.action) {
            simpleRoutes[key] = route.action;
        }
    }
    return { routes: simpleRoutes, meta: meta };
}
exports.parseNestedRoutes = parseNestedRoutes;
//# sourceMappingURL=index.js.map