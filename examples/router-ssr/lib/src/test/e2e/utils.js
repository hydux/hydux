var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
import * as puppeteer from 'puppeteer';
import * as child from 'child_process';
import * as assert from 'assert';
export var IsCI = !!process.env.CI;
export var Examples = process.cwd() + "/examples";
export var timeout = 60000 * 10;
export var runServer = function (app, port) { return __awaiter(_this, void 0, void 0, function () {
    var p;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                p = child.exec(process.cwd() + "/node_modules/.bin/serve -n -c 0 -s -p " + port, {
                    cwd: Examples + "/" + app,
                });
                p.stderr.on('data', console.error);
                return [4 /*yield*/, new Promise(function (res) { return p.stdout.on('data', function (d) { return (console.log(d), res()); }); })];
            case 1:
                _a.sent();
                return [4 /*yield*/, sleep(1000)];
            case 2:
                _a.sent();
                return [2 /*return*/, p];
        }
    });
}); };
export function downloadChrome() {
    return __awaiter(this, void 0, void 0, function () {
        var revision, p, fetcher, revisionInfo;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!IsCI && require('get-chrome')()) {
                        console.log('Chrome is installed');
                        return [2 /*return*/];
                    }
                    revision = require(process.cwd() + "/node_modules/puppeteer/package.json")
                        .puppeteer
                        .chromium_revision;
                    console.log('Start downloading chrome:', revision);
                    p = puppeteer;
                    fetcher = p.createBrowserFetcher();
                    return [4 /*yield*/, fetcher.download(revision)];
                case 1:
                    revisionInfo = _a.sent();
                    console.log('Chrome downloaded info:', revisionInfo);
                    return [2 /*return*/];
            }
        });
    });
}
export var sleep = function (ms) {
    return new Promise(function (res) { return setTimeout(res, ms); });
};
export var launchBrowser = function () { return __awaiter(_this, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, puppeteer.launch({
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
                executablePath: IsCI
                    ? puppeteer.executablePath()
                    : require('get-chrome')()
            })];
    });
}); };
export var text = function (e, trim) {
    if (trim === void 0) { trim = true; }
    return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, sleep(100)];
                case 1:
                    _a.sent();
                    return [2 /*return*/, e.getProperty('innerText')
                            .then(function (e) { return e.jsonValue(); })
                            .then(function (e) { return trim ? e.trim() : e; })];
            }
        });
    });
};
export var counterSuit = function (page, n, init) {
    if (n === void 0) { n = 0; }
    if (init === void 0) { init = 0; }
    return __awaiter(_this, void 0, void 0, function () {
        var _text, c1, c1Up, c1Down, c1UpLater, _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
        var _this = this;
        return __generator(this, function (_o) {
            switch (_o.label) {
                case 0:
                    _text = function (e, trim) {
                        if (trim === void 0) { trim = true; }
                        return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, sleep(100)];
                                    case 1:
                                        _a.sent();
                                        if (!(typeof e === 'string')) return [3 /*break*/, 3];
                                        return [4 /*yield*/, page.$$(e)];
                                    case 2:
                                        e = (_a.sent())[n];
                                        _a.label = 3;
                                    case 3: return [2 /*return*/, text(e, trim)];
                                }
                            });
                        });
                    };
                    return [4 /*yield*/, page.waitFor('.count')];
                case 1:
                    _o.sent();
                    return [4 /*yield*/, page.$$('.count')];
                case 2:
                    c1 = (_o.sent())[n];
                    return [4 /*yield*/, page.$$('.up')];
                case 3:
                    c1Up = (_o.sent())[n];
                    return [4 /*yield*/, page.$$('.down')];
                case 4:
                    c1Down = (_o.sent())[n];
                    return [4 /*yield*/, page.$$('.upLater')];
                case 5:
                    c1UpLater = (_o.sent())[n];
                    console.log('text 1');
                    _b = (_a = assert).equal;
                    return [4 /*yield*/, _text('.count')];
                case 6:
                    _b.apply(_a, [_o.sent(), "" + init, "count" + n]);
                    return [4 /*yield*/, c1Up.click()];
                case 7:
                    _o.sent();
                    console.log('text 2');
                    _d = (_c = assert).equal;
                    return [4 /*yield*/, _text(c1)];
                case 8:
                    _d.apply(_c, [_o.sent(), "" + (init + 1), "count" + n + " up"]);
                    return [4 /*yield*/, c1Down.click()];
                case 9:
                    _o.sent();
                    _f = (_e = assert).equal;
                    return [4 /*yield*/, _text(c1)];
                case 10:
                    _f.apply(_e, [_o.sent(), "" + init, "count" + n + " down"]);
                    return [4 /*yield*/, c1UpLater.click()];
                case 11:
                    _o.sent();
                    _h = (_g = assert).equal;
                    return [4 /*yield*/, _text(c1)];
                case 12:
                    _h.apply(_g, [_o.sent(), "" + init, "count" + n + " upLater before"]);
                    return [4 /*yield*/, sleep(1100)];
                case 13:
                    _o.sent();
                    _k = (_j = assert).equal;
                    return [4 /*yield*/, _text(c1)];
                case 14:
                    _k.apply(_j, [_o.sent(), "" + (init + 10), "count" + n + " upLater"]);
                    return [4 /*yield*/, c1Up.click()];
                case 15:
                    _o.sent();
                    return [4 /*yield*/, c1Up.click()];
                case 16:
                    _o.sent();
                    return [4 /*yield*/, c1Up.click()];
                case 17:
                    _o.sent();
                    _m = (_l = assert).equal;
                    return [4 /*yield*/, _text(c1)];
                case 18:
                    _m.apply(_l, [_o.sent(), "" + (init + 13), "count" + n + " upLater"]);
                    return [2 /*return*/];
            }
        });
    });
};
//# sourceMappingURL=utils.js.map