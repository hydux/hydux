"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var isSet = function (val) { return typeof val !== 'undefined' && val !== null; };
exports.isPojo = function (obj) { return !isSet(obj.constructor) || obj.constructor === Object; };
exports.isDev = typeof process !== 'undefined' && process.env.NODE_ENV === 'development';
exports.debug = function (key) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    exports.isDev && console.log.apply(console, ["[hydux-" + key + "]"].concat(args));
};
function set(to, from) {
    var keys = Object.keys(from);
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        to[key] = from[key];
    }
    return to;
}
exports.set = set;
function merge(to, from) {
    return set(set(exports.isPojo(to) ? {} : new to.constructor(), to), from);
}
exports.merge = merge;
function clone(from) {
    return set(exports.isPojo(from) ? {} : new from.constructor(), from);
}
exports.clone = clone;
function setDeep(path, value, from) {
    if (path.length === 0) {
        return value;
    }
    var to = exports.isPojo(from)
        ? {} : new from.constructor();
    var toCursor = to;
    var fromCursor = from;
    var lastIdx = path.length - 1;
    set(toCursor, fromCursor);
    for (var i = 0; i < lastIdx; i++) {
        var key = path[i];
        toCursor = toCursor[key];
        fromCursor = fromCursor[key];
        set(toCursor, fromCursor);
    }
    toCursor[path[lastIdx]] = value;
    return to;
}
exports.setDeep = setDeep;
function setDeepMutable(path, value, from) {
    var cursor = from;
    for (var i = 0; i < path.length - 1; i++) {
        cursor = cursor[path[i]];
    }
    cursor[path[path.length - 1]] = value;
    return from;
}
exports.setDeepMutable = setDeepMutable;
function get(path, from, len) {
    if (len === void 0) { len = path.length; }
    for (var i = 0; i < len; i++) {
        from = from[path[i]];
    }
    return from;
}
exports.get = get;
function isFn(data) {
    return 'function' === typeof data;
}
exports.isFn = isFn;
exports.noop = function (f) { return f; };
//# sourceMappingURL=utils.js.map