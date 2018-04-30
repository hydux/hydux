"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var getPort = require("get-port");
var Utils = require("./utils");
describe('counter test', function () {
    var _this = this;
    this.timeout(10000);
    var browser = null;
    var page = null;
    var port = 0;
    var hs = null;
    before(function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Utils.launchBrowser()];
                case 1:
                    browser = _a.sent();
                    return [4 /*yield*/, getPort()];
                case 2:
                    port = _a.sent();
                    return [4 /*yield*/, Utils.runServer('counter', port)];
                case 3:
                    hs = _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    after(function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('start close browser');
                    return [4 /*yield*/, browser.close()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, hs.kill()];
                case 2:
                    _a.sent();
                    console.log('end close browser');
                    return [2 /*return*/];
            }
        });
    }); });
    beforeEach(function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
        return tslib_1.__generator(this, function (_a) {
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
    afterEach(function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, page.close()];
                case 1:
                    _a.sent();
                    console.log('page closed');
                    return [2 /*return*/];
            }
        });
    }); });
    it('simple', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, page.waitFor('.count')];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, Utils.counterSuit(page, 0)];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, Utils.counterSuit(page, 1)];
                case 3:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
});
//# sourceMappingURL=counter.test.js.map