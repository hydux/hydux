"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var isBrowser = typeof window !== 'undefined'
    && typeof location !== 'undefined'
    && typeof history !== 'undefined';
var BaseHistory = /** @class */ (function () {
    function BaseHistory(props) {
        if (props === void 0) { props = {}; }
        var _this = this;
        this._last = [];
        this.listeners = [];
        this.last = function () { return _this._last[0]; };
        this.listen = function (listener) { return _this.listeners.push(listener); };
        this.props = props = tslib_1.__assign({ basePath: '' }, props);
        this.listeners.push(function (path) {
            _this._last = [_this._last[_this._last.length - 1], path];
        });
    }
    BaseHistory.prototype.go = function (delta) {
        history.go(delta);
    };
    BaseHistory.prototype.back = function () {
        history.back();
    };
    BaseHistory.prototype.forward = function () {
        history.forward();
    };
    BaseHistory.prototype._setLoc = function (loc) {
        this.lastLocation = this.location || loc;
        this.location = loc;
    };
    BaseHistory.prototype.handleChange = function (path) {
        if (path === void 0) { path = this.current(); }
        this.listeners.forEach(function (f) { return f(path); });
    };
    return BaseHistory;
}());
exports.BaseHistory = BaseHistory;
var HashHistory = /** @class */ (function (_super) {
    tslib_1.__extends(HashHistory, _super);
    function HashHistory(props) {
        if (props === void 0) { props = {}; }
        var _this = _super.call(this, props) || this;
        if (!isBrowser) {
            return new MemoryHistory();
        }
        _this.props = props = tslib_1.__assign({ hash: '#!' }, _this.props);
        _this._last = [_this.current()];
        window.addEventListener('hashchange', function (e) {
            _this.handleChange();
        });
        return _this;
    }
    HashHistory.prototype.getRealPath = function (path) {
        return this.props.hash + this.props.basePath + path;
    };
    HashHistory.prototype.current = function () {
        return location.hash.slice(this.props.hash.length + this.props.basePath.length) || '/';
    };
    HashHistory.prototype.push = function (path) {
        location.assign(this.getRealPath(path));
    };
    HashHistory.prototype.replace = function (path) {
        location.replace(this.getRealPath(path));
    };
    return HashHistory;
}(BaseHistory));
exports.HashHistory = HashHistory;
var BrowserHistory = /** @class */ (function (_super) {
    tslib_1.__extends(BrowserHistory, _super);
    function BrowserHistory(props) {
        if (props === void 0) { props = {}; }
        var _this = _super.call(this, props) || this;
        if (!isBrowser) {
            return new MemoryHistory(props);
        }
        _this._last = [_this.current()];
        window.addEventListener('popstate', function (e) {
            _this.handleChange();
        });
        return _this;
    }
    BrowserHistory.prototype.getRealPath = function (path) {
        return this.props.basePath + path;
    };
    BrowserHistory.prototype.current = function () {
        return location.pathname.slice(this.props.basePath.length)
            + location.search;
    };
    BrowserHistory.prototype.push = function (path) {
        history.pushState(null, '', this.getRealPath(path));
        this.handleChange(path);
    };
    BrowserHistory.prototype.replace = function (path) {
        history.replaceState(null, '', this.getRealPath(path));
        this.handleChange(path);
    };
    return BrowserHistory;
}(BaseHistory));
exports.BrowserHistory = BrowserHistory;
var MemoryHistory = /** @class */ (function (_super) {
    tslib_1.__extends(MemoryHistory, _super);
    function MemoryHistory(props) {
        if (props === void 0) { props = {}; }
        var _this = _super.call(this, props) || this;
        _this._stack = [];
        _this._index = 0;
        _this.props = props = tslib_1.__assign({ initPath: '/' }, _this.props);
        // override initialization in super class
        _this._stack = [_this.props.basePath + _this.props.initPath];
        _this._last = [_this.current()];
        return _this;
    }
    MemoryHistory.prototype.getRealPath = function (path) {
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
exports.MemoryHistory = MemoryHistory;
//# sourceMappingURL=history.js.map