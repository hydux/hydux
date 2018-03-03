import * as tslib_1 from "tslib";
import { runAction } from './../../index';
import Cmd from './../../cmd';
import { BaseHistory, HashHistory, BrowserHistory } from './history';
export { BaseHistory, HashHistory, BrowserHistory };
const CHANGE_LOCATION = '@@hydux-router/CHANGE_LOCATION';
export function parsePath(path) {
    const splits = path.split('?');
    const pathname = decodeURI(splits[0]);
    const search = splits[1] ? '?' + splits[1] : '';
    const query = search.slice(1).split('&').filter(Boolean)
        .reduce((query, kv) => {
        const [key, value] = kv.split('=').map(decodeURIComponent);
        if (query[key]) {
            query[key] = Array.prototype.concat.call([], query[key], value);
        }
        else {
            query[key] = value || '';
        }
        return query;
    }, {});
    return { pathname, params: {}, query, search, template: null };
}
const isNotEmpty = s => s !== '';
export function matchPath(pathname, fmt) {
    let paramKeys = [];
    let re = '^' + fmt.replace(/\/$/, '').replace(/([.%|(){}\[\]])/g, '\\$1').replace('*', '.*').replace(/\/\:([\w]+)/g, (m, name) => {
        paramKeys.push(name);
        return '/([^/]+)';
    }) + '\/?$';
    let match = pathname.match(new RegExp(re));
    if (match) {
        const params = paramKeys.reduce((params, key, i) => (Object.assign({}, params, { [key]: match && match[i + 1] })), {});
        return [true, params];
    }
    else {
        return [false, {}];
    }
}
export function mkLink(history, h) {
    const React = { createElement: h };
    return function Link(_a, children) {
        var { to, onClick, replace = false } = _a, props = tslib_1.__rest(_a, ["to", "onClick", "replace"]);
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
        const Comp = 'a';
        return React.createElement(Comp, Object.assign({ href: to }, props, { onclick: handleClick, onClick: handleClick }), children);
    };
}
export default function withRouter(props = {}) {
    const { history = new HashHistory(), routes = {}, } = props;
    let timer;
    return (app) => (props) => {
        function pathToLoc(path) {
            const loc = parsePath(path);
            for (const key in routes) {
                const [match, params] = matchPath(loc.pathname, key);
                if (match) {
                    loc.params = params;
                    loc.template = key;
                    break;
                }
            }
            return loc;
        }
        return app(Object.assign({}, props, { init: () => {
                let result = props.init();
                if (!(result instanceof Array)) {
                    result = [result, Cmd.none];
                }
                const loc = pathToLoc(history.current());
                let cmd = Cmd.batch(result[1], Cmd.ofSub(actions => actions[CHANGE_LOCATION](loc)));
                return [Object.assign({}, result[0], { location: loc }), cmd];
            }, subscribe: state => Cmd.batch(Cmd.ofSub(actions => {
                history.listen(path => {
                    actions[CHANGE_LOCATION](pathToLoc(path));
                });
            }), props.subscribe ? props.subscribe(state) : Cmd.none), actions: Object.assign({}, props.actions, { history: {
                    push: path => (history.push(path), void 0),
                    replace: path => (history.replace(path), void 0),
                    go: delta => (history.go(delta), void 0),
                    back: () => (history.back(), void 0),
                    forward: () => (history.forward(), void 0),
                }, [CHANGE_LOCATION]: (loc) => (state, actions) => {
                    history._setLoc(loc);
                    if (loc.template) {
                        let [nextState, cmd] = runAction(routes[loc.template](loc), state, actions);
                        return [Object.assign({}, nextState, { location: loc }), cmd];
                    }
                    else {
                        return Object.assign({}, state, { location: loc });
                    }
                } }) }));
    };
}
export function join(...args) {
    return args.join('/').replace(/\/+/g, '/');
}
/**
 * @param routes nested routes contains path, action, children, it would parse it to a `route` field (path:action map) for router enhancer, and a `meta` field which contains each route's parents.
 */
export function parseNestedRoutes(routes) {
    function rec(routes, newRoutes) {
        let children = routes.children || [];
        newRoutes[routes.path] = Object.assign({}, routes, { parents: routes.parents || [], children: children.map(r => (Object.assign({}, r, { parents: void 0, children: void 0 }))) });
        children
            .map(r => (Object.assign({}, r, { path: join(routes.path, r.path), action: r.action, parents: (routes.parents || []).concat(Object.assign({}, routes, { parents: void 0, children: void 0 })), children: r.children })))
            .forEach(r => rec(r, newRoutes));
        return newRoutes;
    }
    const meta = rec(routes, {});
    let simpleRoutes = {};
    for (const key in meta) {
        const route = meta[key];
        if (route.action) {
            simpleRoutes[key] = route.action;
        }
    }
    return { routes: simpleRoutes, meta };
}
//# sourceMappingURL=index.js.map