import * as tslib_1 from "tslib";
import { runAction, normalize } from './../../index';
import { dt, never } from '../../helpers';
import Cmd from './../../cmd';
import { debug } from '../../utils';
import { BaseHistory, HashHistory, BrowserHistory, MemoryHistory, parsePath, matchPath } from './history';
export { parsePath, matchPath };
export { BaseHistory, HashHistory, BrowserHistory, MemoryHistory, };
var CHANGE_LOCATION = '@@hydux-router/CHANGE_LOCATION';
export function mkLink(history, h) {
    var React = { createElement: h };
    return function Link(_a, children) {
        var to = _a.to, onClick = _a.onClick, _b = _a.replace, replace = _b === void 0 ? false : _b, _c = _a.prefetch, prefetch = _c === void 0 ? false : _c, props = tslib_1.__rest(_a, ["to", "onClick", "replace", "prefetch"]);
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
        function handlePrefetch(e) {
            if (!prefetch) {
                return;
            }
            var h = history;
            if (!h._routesMeta) {
                return console.error("[hydux-router] Prefetch link requires passing nested routes to withRouter!");
            }
            var loc = h.parsePath(to);
            if (loc.template) {
                var meta = h._routesMeta[loc.template];
                if (!meta || !meta.getComponent) {
                    return console.error("[hydux-router] Prefetch link requires code-splitting components as router component!");
                }
                var _a = meta.getComponent(), key_1 = _a[0], comp = _a[1];
                comp.then(function () {
                    debug('router-link', "Component " + key_1 + " prefetched!");
                });
            }
        }
        return (React.createElement("a", tslib_1.__assign({ href: to }, props, { onMouseOver: function (e) {
                handlePrefetch(e);
                props.onMouseOver && props.onMouseOver(e);
            }, onTouchStart: function (e) {
                handlePrefetch(e);
                props.onTouchStart && props.onTouchStart(e);
            }, onClick: handleClick }), children));
    };
}
export default function withRouter(props) {
    if (props === void 0) { props = { routes: {} }; }
    var _a = props.history, history = _a === void 0 ? new HashHistory() : _a, routes = props.routes, _b = props.ssr, ssr = _b === void 0 ? false : _b, _c = props.isServer, isServer = _c === void 0 ? typeof window === 'undefined' || (typeof self !== undefined && window !== self) : _c;
    var timer;
    return function (app) { return function (props) {
        var _a;
        var routesMap = routes;
        var routesMeta = {};
        if (('path' in routes) && typeof routes.path === 'string') {
            var parsed = parseNestedRoutes(routes);
            routesMap = parsed.routes;
            routesMeta = parsed.meta;
        }
        history._setRoutes(routesMap, routesMeta);
        var loc = history.location;
        var meta = routesMeta[loc.template];
        var getRouteComp = function (meta, fromInit) {
            if (fromInit === void 0) { fromInit = false; }
            if (!meta || !meta.getComponent) {
                return dt('normal', null);
            }
            var ret = meta.getComponent();
            var key = ret[0], comp = ret[1];
            var renderOnServer = true;
            if (ret.length >= 3) {
                renderOnServer = ret[2];
            }
            if (ssr) {
                if (isServer && !renderOnServer) {
                    return dt('normal', null);
                }
                if (fromInit && !isServer && renderOnServer) {
                    return dt('clientSSR', { key: key, comp: comp });
                }
            }
            return dt('dynamic', { key: key, comp: comp });
        };
        var initComp = getRouteComp(meta, true);
        var isRenderable = false;
        function runRoute(routeComp, actions, loc, fromInit) {
            if (fromInit === void 0) { fromInit = false; }
            var meta = routesMeta[loc.template];
            switch (routeComp.tag) {
                case 'dynamic':
                case 'clientSSR':
                    var key_2 = routeComp.data.key;
                    var isClientSSRInit_1 = routeComp.tag === 'clientSSR' && fromInit;
                    return routeComp.data.comp.then(function (comp) { return ctx.patch(key_2, comp, isClientSSRInit_1); }).then(function () {
                        if (isClientSSRInit_1) { // trigger client ssr render
                            isRenderable = true;
                            return ctx.render();
                        }
                        isRenderable = true;
                        return actions[CHANGE_LOCATION](loc);
                    });
                case 'normal':
                    isRenderable = true;
                    return actions[CHANGE_LOCATION](loc);
                default: return never(routeComp);
            }
        }
        var ctx = app(tslib_1.__assign({}, props, { init: function () {
                var result = normalize(props.init());
                var cmd = Cmd.batch(result.cmd, Cmd.ofSub(function (actions) {
                    var ar = runRoute(initComp, actions, loc, true);
                    if (ar instanceof Promise) {
                        return ar;
                    }
                    return Promise.all(ar);
                }));
                var state = tslib_1.__assign({}, result.state, { location: loc, lazyComps: {} });
                return { state: state, cmd: cmd };
            }, subscribe: function (state) { return Cmd.batch(Cmd.ofSub(function (actions) {
                history.listen(function (path) {
                    var loc = history.location;
                    var meta = routesMeta[loc.template];
                    var comp = getRouteComp(meta, false);
                    runRoute(comp, actions, loc);
                });
            }), props.subscribe ? props.subscribe(state) : Cmd.none); }, actions: tslib_1.__assign({}, props.actions, (_a = { history: {
                        push: function (path) { return setTimeout(function () { return history.push(path); }); },
                        replace: function (path) { return setTimeout(function () { return history.replace(path); }); },
                        go: function (delta) { return setTimeout(function () { return history.go(delta); }); },
                        back: function () { return setTimeout(function () { return history.back(); }); },
                        forward: function () { return setTimeout(function () { return history.forward(); }); },
                    } }, _a[CHANGE_LOCATION] = function (loc, resolve) { return function (state, actions) {
                if (loc.template) {
                    var patch = function () {
                        var args = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            args[_i] = arguments[_i];
                        }
                        return ctx.patch.apply(ctx, args);
                    };
                    var _a = runAction(routesMap[loc.template](loc, patch), state, actions), nextState = _a.state, cmd = _a.cmd;
                    return [tslib_1.__assign({}, nextState, { location: loc }), cmd];
                }
                else {
                    return tslib_1.__assign({}, state, { location: loc });
                }
            }; }, _a)), onRender: function (view) {
                if (isRenderable) {
                    props.onRender && props.onRender(view);
                }
            } }));
        return ctx;
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