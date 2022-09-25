"use strict";
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (
          !desc ||
          ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)
        ) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __exportStar =
  (this && this.__exportStar) ||
  function (m, exports) {
    for (var p in m)
      if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p))
        __createBinding(exports, m, p);
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.sleep = exports.unixTsToDate = void 0;
const big_js_1 = __importDefault(require("big.js"));
const NANO = new big_js_1.default("1000000000");
__exportStar(require("./launchpad"), exports);
__exportStar(require("./nftStaking"), exports);
__exportStar(require("./xToken"), exports);
function unixTsToDate(date) {
  let dateObject = new Date(
    parseInt(
      new big_js_1.default(date)
        .div(NANO)
        .mul(new big_js_1.default("1000"))
        .toFixed(0)
    )
  );
  return dateObject;
}
exports.unixTsToDate = unixTsToDate;
function sleep(baseMs, multiplier) {
  return new Promise((resolve) => {
    setTimeout(resolve, baseMs * multiplier);
  });
}
exports.sleep = sleep;
