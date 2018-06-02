import hash from './hash';
import * as LRUCache from 'lru-cache';
var cache = new LRUCache({
    max: 100,
    maxAge: 10 * 60 * 1000
});
export default function memoize(callback) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    var hashStr = args.concat(callback).map(hash).join('|');
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
export function setCacheOptions(opts) {
    cache = new LRUCache(opts);
}
//# sourceMappingURL=memoize.js.map