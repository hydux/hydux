"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var hash_1 = require("./hash");
var LRUCache = require("lru-cache");
var cache = new LRUCache({
    max: 100,
    maxAge: 10 * 60 * 1000
});
function memoize(callback) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    var hashStr = args.concat(callback).map(hash_1.default).join('|');
    var cached = cache.get(hashStr);
    if (!cached) {
        cached = function () {
            var args2 = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args2[_i] = arguments[_i];
            }
            return callback.apply(void 0, args.concat(args2));
        };
        cache.set(hashStr, cached);
    }
    return cached;
}
exports.default = memoize;
function setCacheOptions(opts) {
    cache = new LRUCache(opts);
}
exports.setCacheOptions = setCacheOptions;
//# sourceMappingURL=memoize.js.map