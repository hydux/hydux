"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var cmd_1 = require("./../cmd");
function parsePath(path, fmt) {
    var splits = path.split('?');
    var pathname = splits[0];
    var fmtParts = fmt.split('/');
    var pathParts = pathname.split('/');
    var params = {};
    for (var i = 0; i < fmtParts.length; i++) {
        var part = fmtParts[i];
        if (i >= pathParts.length) {
            return false;
        }
        var pathPart = decodeURI(pathParts[i]);
        if (part.charAt(0) === ':') {
            params[part.slice(1)] = pathPart;
        }
        else if (part.slice(-1, part.length) === '*' &&
            i === fmtParts.length - 1) {
            part = part.slice(0, -1);
            // match prefix
            if (part === pathParts[i].slice(0, part.length)) {
                break;
            }
            else {
                return false;
            }
        }
        else if (part !== pathParts[i]) {
            return false;
        }
    }
    var search = splits[1] ? '?' + splits[1] : '';
    var query = search.slice(1).split('&').filter(Boolean)
        .reduce(function (query, kv) {
        var _a = kv.split('=').map(decodeURIComponent), key = _a[0], value = _a[1];
        if (query[key]) {
            query[key] = Array.prototype.concat.call(query[key], value);
        }
        else {
            query[key] = value || '';
        }
        return query;
    }, {});
    return { pathname: pathname, params: params, query: query, search: search, template: fmt };
}
var BaseHistory = /** @class */ (function () {
    function BaseHistory(props) {
        if (props === void 0) { props = { basePath: '' }; }
        var _this = this;
        this.listeners = [];
        this.last = function () { return _this._last[0]; };
        this.current = function () { return ''; };
        this.watch = function (listener) { return _this.listeners.push(listener); };
        this.go = function (delta) { return history.go(delta); };
        this.back = function () { return history.back(); };
        this.forward = function () { return history.forward(); };
        this.props = props;
        this._last = [this.current()];
        this.listeners.push(function (path) {
            _this._last = _this._last.slice(-1).concat(path);
        });
    }
    BaseHistory.prototype.handleChange = function (path) {
        if (path === void 0) { path = this.current(); }
        this.listeners.forEach(function (f) { return f(path); });
    };
    return BaseHistory;
}());
exports.BaseHistory = BaseHistory;
var HashHistory = /** @class */ (function (_super) {
    __extends(HashHistory, _super);
    function HashHistory(props) {
        var _this = _super.call(this, props) || this;
        _this.current = function () { return location.hash.slice(2 + _this.props.basePath.length); };
        window.addEventListener('hashchange', function () {
            _this.handleChange();
        });
        return _this;
    }
    HashHistory.prototype.assign = function (path) {
        location.assign('#!' + this.props.basePath + path);
    };
    HashHistory.prototype.replace = function (path) {
        location.replace('#!' + this.props.basePath + path);
    };
    return HashHistory;
}(BaseHistory));
exports.HashHistory = HashHistory;
var BrowserHistory = /** @class */ (function (_super) {
    __extends(BrowserHistory, _super);
    function BrowserHistory(props) {
        var _this = _super.call(this, props) || this;
        _this.current = function () {
            return location.pathname.slice(_this.props.basePath.length)
                + location.search;
        };
        window.addEventListener('popstate', function (e) {
            _this.handleChange();
        });
        return _this;
    }
    BrowserHistory.prototype.assign = function (path) {
        history.pushState(null, '', this.props.basePath + path);
        this.handleChange(path);
    };
    BrowserHistory.prototype.replace = function (path) {
        history.replaceState(null, '', this.props.basePath + path);
        this.handleChange(path);
    };
    return BrowserHistory;
}(BaseHistory));
exports.BrowserHistory = BrowserHistory;
function withRouter(_a) {
    var _b = _a === void 0 ? {} : _a, _c = _b.type, type = _c === void 0 ? 'hash' : _c, _d = _b.basePath, basePath = _d === void 0 ? '' : _d, _e = _b.routes, routes = _e === void 0 ? {} : _e;
    var timer;
    var historyProps = { basePath: basePath };
    var history = type === 'history'
        ? new BrowserHistory(historyProps)
        : new HashHistory(historyProps);
    return function (app) { return function (props) {
        return app(__assign({}, props, { init: function () {
                return props.init('aaa');
            }, subscribe: function (state) { return cmd_1.default.batch(cmd_1.default.ofSub(function (actions) {
                history.watch(function (path) {
                    for (var key in routes) {
                        var router = parsePath(path, key);
                        if (router) {
                            routes[key](actions.routes)(router);
                        }
                        else {
                            break;
                        }
                    }
                });
            }), props.subscribe ? props.subscribe(state) : cmd_1.default.none); }, actions: __assign({}, props.actions, { location: history }) }));
    }; };
}
exports.default = withRouter;
function isRoute(obj) {
    return (Object.keys(obj).length === 2 &&
        typeof obj.map === 'function' &&
        typeof obj.action === 'function');
}
function nestedRoutes(routes) {
    var newRoutes = {};
    var newActions = {};
    for (var key in routes) {
        var route = routes[key];
        if (isRoute(route)) {
            newRoutes[key] = route;
        }
    }
}
exports.nestedRoutes = nestedRoutes;
//# sourceMappingURL=router.js.map