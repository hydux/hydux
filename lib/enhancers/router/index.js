"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
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
            return (__assign({}, params, (_a = {}, _a[key] = match && match[i + 1], _a)));
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
    return function Link(props, children) {
        function handleClick(e) {
            history.push(props.to);
            e.preventDefault();
            e.stopPropagation();
            props.onClick && props.onClick(e);
        }
        return React.createElement("a", __assign({ href: props.to }, props, { onclick: handleClick, onClick: handleClick }), children);
    };
}
exports.mkLink = mkLink;
function withRouter(_a) {
    var _b = _a === void 0 ? {} : _a, _c = _b.history, history = _c === void 0 ? new history_1.HashHistory() : _c, _d = _b.routes, routes = _d === void 0 ? {} : _d;
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
        return app(__assign({}, props, { init: function () {
                var result = props.init();
                if (!(result instanceof Array)) {
                    result = [result, cmd_1.default.none];
                }
                var loc = pathToLoc(history.current());
                var cmd = result[1];
                if (loc) {
                    cmd = cmd_1.default.batch(result[1], cmd_1.default.ofSub(function (actions) { return actions[ROUTE_ACTION](loc); }));
                }
                return [__assign({}, result[0], { location: loc }), cmd];
            }, subscribe: function (state) { return cmd_1.default.batch(cmd_1.default.ofSub(function (actions) {
                history.listen(function (path) {
                    var loc = pathToLoc(path);
                    actions[ROUTE_ACTION](loc);
                });
            }), props.subscribe ? props.subscribe(state) : cmd_1.default.none); }, actions: __assign({}, props.actions, (_a = { history: {
                        push: function (path) { return history.push(path); },
                        replace: function (path) { return history.replace(path); },
                        go: function (delta) { return history.go(delta); },
                        back: function () { return history.back(); },
                        forward: function () { return history.forward(); },
                    } }, _a[ROUTE_ACTION] = function (loc) {
                if (loc.template) {
                    return routes[loc.template](loc);
                }
                else {
                    return function (state) { return (__assign({}, state, { location: loc })); };
                }
            }, _a)) }));
        var _a;
    }; };
}
exports.default = withRouter;
function nestedRoutes(routes) {
    function rec(routes, newRoutes) {
        routes.children
            .map(function (r) { return ({
            path: routes.path + r.path,
            action: r.action,
            parent: (routes.parents || []).concat(r),
            children: r.children,
        }); })
            .forEach(function (r) {
            if (!r.children.length) {
                newRoutes[r.path] = r;
            }
            else {
                rec(r, newRoutes);
            }
        });
        return newRoutes;
    }
    return rec(routes, {});
}
exports.nestedRoutes = nestedRoutes;
//# sourceMappingURL=index.js.map