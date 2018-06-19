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
            var _a;
            return (tslib_1.__assign({}, params, (_a = {}, _a[key] = match && match[i + 1], _a)));
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
        this._listeners = [];
        this._fireInitPath = true;
        this._routes = {};
        this._routesTpls = [];
        this._props = props = tslib_1.__assign({ basePath: '', initPath: '/' }, props);
        this._listeners.push(function (path) {
            _this._last = _this._last.concat(path).slice(-2);
            _this._updateLocation(path);
        });
        if (this._fireInitPath) {
            this._fireChange(this._props.initPath);
        }
    }
    Object.defineProperty(BaseHistory.prototype, "last", {
        get: function () {
            return this._last[0] || this._props.initPath;
        },
        enumerable: true,
        configurable: true
    });
    BaseHistory.prototype.listen = function (listener) {
        this._listeners.push(listener);
    };
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
    /* @internal */
    BaseHistory.prototype._setRoutes = function (routes, routesMeta) {
        this._routesMeta = routesMeta;
        this._routes = routes;
        this._routesTpls = Object.keys(routes || {});
        this._updateLocation();
    };
    BaseHistory.prototype._fireChange = function (path) {
        if (path === void 0) { path = this.current; }
        this._listeners.forEach(function (f) { return f(path); });
    };
    BaseHistory.prototype._updateLocation = function (path) {
        if (path === void 0) { path = this.current; }
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
        _this._props = props = tslib_1.__assign({ hash: '#!' }, _this._props);
        _this._last = [_this.current];
        window.addEventListener('hashchange', function (e) {
            _this._fireChange();
        });
        return _this;
    }
    HashHistory.prototype.realPath = function (path) {
        return this._props.hash + this._props.basePath + path;
    };
    Object.defineProperty(HashHistory.prototype, "length", {
        get: function () {
            return history.length;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(HashHistory.prototype, "current", {
        get: function () {
            return location.hash.slice(this._props.hash.length + this._props.basePath.length) || '/';
        },
        enumerable: true,
        configurable: true
    });
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
        _this._last = [_this.current];
        window.addEventListener('popstate', function (e) {
            _this._fireChange();
        });
        return _this;
    }
    BrowserHistory.prototype.realPath = function (path) {
        return this._props.basePath + path;
    };
    Object.defineProperty(BrowserHistory.prototype, "length", {
        get: function () {
            return history.length;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BrowserHistory.prototype, "current", {
        get: function () {
            return location.pathname.slice(this._props.basePath.length)
                + location.search;
        },
        enumerable: true,
        configurable: true
    });
    BrowserHistory.prototype.push = function (path) {
        history.pushState(null, '', this.realPath(path));
        this._fireChange(path);
    };
    BrowserHistory.prototype.replace = function (path) {
        history.replaceState(null, '', this.realPath(path));
        this._fireChange(path);
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
        _this._storeKey = '@hydux-router/memoryhistory';
        _this._index = 0;
        _this._props = props = tslib_1.__assign({}, _this._props);
        // Override initialization in super class
        _this._stack = [_this._props.basePath + _this._props.initPath];
        var storage = _this._getStorage();
        if (storage) {
            _this.listen(function (path) {
                storage.setItem(_this._storeKey, JSON.stringify(_this._stack));
            });
            var stack = storage.getItem(_this._storeKey);
            if (stack) {
                _this._stack = JSON.parse(stack);
                return _this;
            }
        }
        _this._fireChange(_this._props.initPath);
        return _this;
    }
    MemoryHistory.prototype.realPath = function (path) {
        return this._props.basePath + path;
    };
    Object.defineProperty(MemoryHistory.prototype, "length", {
        get: function () {
            return this._stack.length;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MemoryHistory.prototype, "current", {
        get: function () {
            return this._stack[this._index].slice(this._props.basePath.length);
        },
        enumerable: true,
        configurable: true
    });
    MemoryHistory.prototype.push = function (path) {
        this._reset();
        this._stack.push(this._props.basePath + path);
        this._index++;
        this._fireChange(path);
    };
    MemoryHistory.prototype.replace = function (path) {
        this._reset();
        this._stack[this._index] = this._props.basePath + path;
        this._fireChange(path);
    };
    MemoryHistory.prototype.go = function (delta) {
        var next = this._index + delta;
        next = Math.min(next, this._stack.length - 1);
        next = Math.max(next, 0);
        this._index = next;
        this._updateLocation();
        this._fireChange();
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
    MemoryHistory.prototype._getStorage = function () {
        return (this._props.store && typeof this._props.store === 'boolean')
            ? localStorage
            : this._props.store || null;
    };
    return MemoryHistory;
}(BaseHistory));
export { MemoryHistory };
//# sourceMappingURL=history.js.map