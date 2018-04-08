import * as tslib_1 from "tslib";
import { runAction } from './../../index';
import Cmd from './../../cmd';
import { BaseHistory, HashHistory, BrowserHistory, MemoryHistory, } from './history';
export { BaseHistory, HashHistory, BrowserHistory, MemoryHistory, };
var CHANGE_LOCATION = '@@hydux-router/CHANGE_LOCATION';
export function parsePath(path) {
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
var isNotEmpty = function (s) { return s !== ''; };
export function matchPath(pathname, fmt) {
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
export function mkLink(history, h) {
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
        var Comp = 'a';
        if ('children' in props) {
            children = props.children;
        }
        return (React.createElement("a", tslib_1.__assign({ href: to }, props, { onClick: handleClick }), children));
    };
}
export default function withRouter(props) {
    if (props === void 0) { props = {}; }
    var _a = props.history, history = _a === void 0 ? new HashHistory() : _a, _b = props.routes, routes = _b === void 0 ? {} : _b;
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
                    result = [result, Cmd.none];
                }
                var loc = pathToLoc(history.current());
                var cmd = Cmd.batch(result[1], Cmd.ofSub(function (actions) { return actions[CHANGE_LOCATION](loc); }));
                return [tslib_1.__assign({}, result[0], { location: loc }), cmd];
            }, subscribe: function (state) { return Cmd.batch(Cmd.ofSub(function (actions) {
                history.listen(function (path) {
                    actions[CHANGE_LOCATION](pathToLoc(path));
                });
            }), props.subscribe ? props.subscribe(state) : Cmd.none); }, actions: tslib_1.__assign({}, props.actions, (_a = { history: {
                        push: function (path) { return (history.push(path), void 0); },
                        replace: function (path) { return (history.replace(path), void 0); },
                        go: function (delta) { return (history.go(delta), void 0); },
                        back: function () { return (history.back(), void 0); },
                        forward: function () { return (history.forward(), void 0); },
                    } }, _a[CHANGE_LOCATION] = function (loc) { return function (state, actions) {
                history._setLoc(loc);
                if (loc.template) {
                    var _a = runAction(routes[loc.template](loc), state, actions), nextState = _a[0], cmd = _a[1];
                    return [tslib_1.__assign({}, nextState, { location: loc }), cmd];
                }
                else {
                    return tslib_1.__assign({}, state, { location: loc });
                }
            }; }, _a)) }));
        var _a;
    }; };
}
export function join() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return args.join('/').replace(/\/+/g, '/');
}
/**
 * @param routes nested routes contains path, action, children, it would parse it to a `route` field (path:action map) for router enhancer, and a `meta` field which contains each route's parents.
 */
export function parseNestedRoutes(routes) {
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
//# sourceMappingURL=index.js.map