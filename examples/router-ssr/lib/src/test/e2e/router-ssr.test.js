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
import * as assert from 'assert';
import * as child from 'child_process';
import * as Utils from './utils';
describe('ssr + code-splitting test', function () {
    var _this = this;
    this.timeout(Utils.timeout);
    var browser = null;
    var page = null;
    var port = 3456;
    var hs = null;
    var server = null;
    before(function () { return __awaiter(_this, void 0, void 0, function () {
        var _a, startBe;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, Utils.launchBrowser()];
                case 1:
                    browser = _b.sent();
                    startBe = function () {
                        return new Promise(function (res, rej) {
                            var s = child.exec("node -r ./tools/register ./src/server/main.ts", {
                                cwd: process.cwd() + "/examples/router-ssr",
                            });
                            s.stdout.on('data', function () {
                                res(s);
                            });
                            s.on('error', function (err) {
                                console.error(err);
                                rej(err);
                            });
                        });
                    };
                    return [4 /*yield*/, Promise.all([
                            Utils.runServer('router-ssr', 8081),
                            startBe(),
                        ])];
                case 2:
                    _a = _b.sent(), hs = _a[0], server = _a[1];
                    return [4 /*yield*/, Utils.sleep(2000)];
                case 3:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    after(function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('start close browser');
                    return [4 /*yield*/, browser.close()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, hs.kill()];
                case 2:
                    _a.sent();
                    server && server.kill();
                    console.log('end close browser');
                    return [2 /*return*/];
            }
        });
    }); });
    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, browser.newPage()];
                case 1:
                    page = _a.sent();
                    return [4 /*yield*/, page.goto("http://127.0.0.1:" + port)];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    afterEach(function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, page.close()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    it('simple', function () { return __awaiter(_this, void 0, void 0, function () {
        var routeTo, $main, _a, _b, _c, _d, _e, _f, loading;
        var _this = this;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0: return [4 /*yield*/, page.waitFor('.main')];
                case 1:
                    _g.sent();
                    routeTo = function (sel) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, page.$(sel)];
                                case 1: return [4 /*yield*/, (_a.sent()).click()];
                                case 2:
                                    _a.sent();
                                    return [4 /*yield*/, Utils.sleep(50)];
                                case 3:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); };
                    return [4 /*yield*/, page.$('.main')];
                case 2:
                    $main = (_g.sent());
                    _b = (_a = assert).equal;
                    return [4 /*yield*/, Utils.text($main)];
                case 3:
                    _b.apply(_a, [_g.sent(), 'home', "route home"]);
                    return [4 /*yield*/, routeTo('a.users')];
                case 4:
                    _g.sent();
                    _d = (_c = assert).equal;
                    return [4 /*yield*/, Utils.text($main)];
                case 5:
                    _d.apply(_c, [_g.sent(), 'User: 1', "route users"]);
                    return [4 /*yield*/, routeTo('a.counter')];
                case 6:
                    _g.sent();
                    return [4 /*yield*/, Utils.counterSuit(page, 0, 100)];
                case 7:
                    _g.sent();
                    return [4 /*yield*/, Utils.sleep(200)];
                case 8:
                    _g.sent();
                    return [4 /*yield*/, routeTo('a.counter2')];
                case 9:
                    _g.sent();
                    return [4 /*yield*/, Utils.counterSuit(page, 0, 100)];
                case 10:
                    _g.sent();
                    return [4 /*yield*/, Utils.sleep(200)];
                case 11:
                    _g.sent();
                    return [4 /*yield*/, routeTo('a.counter3')];
                case 12:
                    _g.sent();
                    return [4 /*yield*/, Utils.counterSuit(page, 0, 100)];
                case 13:
                    _g.sent();
                    return [4 /*yield*/, routeTo('a.e404')];
                case 14:
                    _g.sent();
                    _f = (_e = assert).equal;
                    return [4 /*yield*/, Utils.text($main)];
                case 15:
                    _f.apply(_e, [_g.sent(), '404', 'route 404']);
                    return [4 /*yield*/, page.goto("http://127.0.0.1:" + port)];
                case 16:
                    _g.sent();
                    return [4 /*yield*/, page.evaluateHandle(function () {
                            var a = document.querySelector('a.counter');
                            a.click();
                            return new Promise(function (res) {
                                var t = setInterval(function () {
                                    if (location.href.includes('counter')) {
                                        var text = document.querySelector('.count').innerText;
                                        clearInterval(t);
                                        res(text);
                                    }
                                }, 1);
                            });
                        })];
                case 17:
                    loading = _g.sent();
                    return [4 /*yield*/, loading.jsonValue()];
                case 18:
                    loading = _g.sent();
                    assert.equal(loading, '100', 'ssr');
                    return [2 /*return*/];
            }
        });
    }); });
});
//# sourceMappingURL=router-ssr.test.js.map