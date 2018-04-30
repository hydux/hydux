import * as tslib_1 from "tslib";
var isBrowser = typeof window !== 'undefined'
    && typeof location !== 'undefined'
    && typeof history !== 'undefined';
export function parsePath(path, tpls) {
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
    var template = null;
    var params = {};
    for (var _i = 0, tpls_1 = tpls; _i < tpls_1.length; _i++) {
        var tpl = tpls_1[_i];
        var p = matchPath(pathname, tpl);
        if (p) {
            params = p;
            template = tpl;
            break;
        }
    }
    return {
        pathname: pathname,
        params: params,
        query: query,
        search: search,
        template: template,
    };
}
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
        return params;
    }
    return null;
}
var BaseHistory = /** @class */ (function () {
    function BaseHistory(props) {
        if (props === void 0) { props = {}; }
        var _this = this;
        this._last = [];
        this.listeners = [];
        this._routes = {};
        this._routesTpls = [];
        this.listen = function (listener) { return _this.listeners.push(listener); };
        this.props = props = tslib_1.__assign({ basePath: '', initPath: '/' }, props);
        this.listeners.push(function (path) {
            _this._last = _this._last.concat(path).slice(-2);
            _this._updateLocation(path);
        });
        this.handleChange(this.props.initPath);
    }
    Object.defineProperty(BaseHistory.prototype, "last", {
        get: function () {
            return this._last[0] || this.props.initPath;
        },
        enumerable: true,
        configurable: true
    });
    BaseHistory.prototype.go = function (delta) {
        history.go(delta);
    };
    BaseHistory.prototype.back = function () {
        history.back();
    };
    BaseHistory.prototype.forward = function () {
        history.forward();
    };
    BaseHistory.prototype.parsePath = function (path) {
        return parsePath(path, this._routesTpls);
    };
    BaseHistory.prototype._setRoutes = function (routes, routesMeta) {
        this._routesMeta = routesMeta;
        this._routes = routes;
        this._routesTpls = Object.keys(routes || {});
        this._updateLocation();
    };
    BaseHistory.prototype.handleChange = function (path) {
        if (path === void 0) { path = this.current(); }
        this.listeners.forEach(function (f) { return f(path); });
    };
    BaseHistory.prototype._updateLocation = function (path) {
        if (path === void 0) { path = this.current(); }
        var loc = this.parsePath(path);
        this.lastLocation = this.location || loc;
        this.location = loc;
    };
    return BaseHistory;
}());
export { BaseHistory };
var HashHistory = /** @class */ (function (_super) {
    tslib_1.__extends(HashHistory, _super);
    function HashHistory(props) {
        if (props === void 0) { props = {}; }
        var _this = this;
        if (!isBrowser) {
            return new MemoryHistory();
        }
        _this = _super.call(this, props) || this;
        _this.props = props = tslib_1.__assign({ hash: '#!' }, _this.props);
        _this._last = [_this.current()];
        window.addEventListener('hashchange', function (e) {
            _this.handleChange();
        });
        return _this;
    }
    HashHistory.prototype.realPath = function (path) {
        return this.props.hash + this.props.basePath + path;
    };
    HashHistory.prototype.current = function () {
        return location.hash.slice(this.props.hash.length + this.props.basePath.length) || '/';
    };
    HashHistory.prototype.push = function (path) {
        location.assign(this.realPath(path));
    };
    HashHistory.prototype.replace = function (path) {
        location.replace(this.realPath(path));
    };
    return HashHistory;
}(BaseHistory));
export { HashHistory };
var BrowserHistory = /** @class */ (function (_super) {
    tslib_1.__extends(BrowserHistory, _super);
    function BrowserHistory(props) {
        if (props === void 0) { props = {}; }
        var _this = this;
        if (!isBrowser) {
            return new MemoryHistory(props);
        }
        _this = _super.call(this, props) || this;
        _this._last = [_this.current()];
        window.addEventListener('popstate', function (e) {
            _this.handleChange();
        });
        return _this;
    }
    BrowserHistory.prototype.realPath = function (path) {
        return this.props.basePath + path;
    };
    BrowserHistory.prototype.current = function () {
        return location.pathname.slice(this.props.basePath.length)
            + location.search;
    };
    BrowserHistory.prototype.push = function (path) {
        history.pushState(null, '', this.realPath(path));
        this.handleChange(path);
    };
    BrowserHistory.prototype.replace = function (path) {
        history.replaceState(null, '', this.realPath(path));
        this.handleChange(path);
    };
    return BrowserHistory;
}(BaseHistory));
export { BrowserHistory };
var MemoryHistory = /** @class */ (function (_super) {
    tslib_1.__extends(MemoryHistory, _super);
    function MemoryHistory(props) {
        if (props === void 0) { props = {}; }
        var _this = _super.call(this, props) || this;
        _this._stack = [];
        _this._index = 0;
        _this.props = props = tslib_1.__assign({}, _this.props);
        // Override initialization in super class
        _this._stack = [_this.props.basePath + _this.props.initPath];
        _this._last = [_this.current()];
        return _this;
    }
    MemoryHistory.prototype.realPath = function (path) {
        return this.props.basePath + path;
    };
    MemoryHistory.prototype.current = function () {
        return this._stack[this._index].slice(this.props.basePath.length);
    };
    MemoryHistory.prototype.push = function (path) {
        this._reset();
        this._stack.push(this.props.basePath + path);
        this.handleChange(path);
    };
    MemoryHistory.prototype.replace = function (path) {
        this._reset();
        this._stack[this._index] = this.props.basePath + path;
        this.handleChange(path);
    };
    MemoryHistory.prototype.go = function (delta) {
        var next = this._index + delta;
        next = Math.min(next, this._stack.length - 1);
        next = Math.max(next, 0);
        this._index = next;
    };
    MemoryHistory.prototype.back = function () {
        this.go(-1);
    };
    MemoryHistory.prototype.forward = function () {
        this.go(1);
    };
    MemoryHistory.prototype._reset = function () {
        this._stack = this._stack.slice(0, this._index + 1);
    };
    return MemoryHistory;
}(BaseHistory));
export { MemoryHistory };
//# sourceMappingURL=history.js.map