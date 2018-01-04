"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var BaseHistory = /** @class */ (function () {
    function BaseHistory(props) {
        if (props === void 0) { props = {}; }
        var _this = this;
        this.listeners = [];
        this.last = function () { return _this._last[0]; };
        this.listen = function (listener) { return _this.listeners.push(listener); };
        this.go = function (delta) { return history.go(delta); };
        this.back = function () { return history.back(); };
        this.forward = function () { return history.forward(); };
        this.props = tslib_1.__assign({ basePath: '' }, props);
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
    tslib_1.__extends(HashHistory, _super);
    function HashHistory(props) {
        if (props === void 0) { props = {}; }
        var _this = this;
        props = tslib_1.__assign({ hash: '#!' }, props);
        _this = _super.call(this, props) || this;
        _this.props = tslib_1.__assign({}, _this.props, props);
        window.addEventListener('hashchange', function (e) {
            _this.handleChange();
        });
        return _this;
    }
    HashHistory.prototype.current = function () {
        return location.hash.slice(this.props.hash.length + this.props.basePath.length);
    };
    HashHistory.prototype.push = function (path) {
        var url = this.props.hash + this.props.basePath + path;
        location.assign(url);
    };
    HashHistory.prototype.replace = function (path) {
        location.replace(this.props.hash + this.props.basePath + path);
    };
    return HashHistory;
}(BaseHistory));
exports.HashHistory = HashHistory;
var BrowserHistory = /** @class */ (function (_super) {
    tslib_1.__extends(BrowserHistory, _super);
    function BrowserHistory(props) {
        if (props === void 0) { props = {}; }
        var _this = _super.call(this, props) || this;
        window.addEventListener('popstate', function (e) {
            _this.handleChange();
        });
        return _this;
    }
    BrowserHistory.prototype.current = function () {
        return location.pathname.slice(this.props.basePath.length)
            + location.search;
    };
    BrowserHistory.prototype.push = function (path) {
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
//# sourceMappingURL=history.js.map