"use strict";
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.sequelizeConnect = void 0;
const sequelize_1 = require("sequelize");
const models_1 = require("./models");
const env_1 = require("./env");
function sequelizeConnect() {
  return __awaiter(this, void 0, void 0, function* () {
    const sequelize = new sequelize_1.Sequelize(
      env_1.DB_NAME,
      env_1.DB_USER,
      env_1.DB_PASS,
      {
        host: env_1.DB_HOST,
        port: env_1.DB_PORT,
        dialect: "postgres",
        retry: {
          match: [
            sequelize_1.ConnectionError,
            sequelize_1.ConnectionTimedOutError,
            sequelize_1.TimeoutError,
          ],
          max: 5,
        },
      }
    );
    try {
      yield sequelize.authenticate();
      console.log("Connection has been established successfully.");
    } catch (error) {
      console.error("Unable to connect to the database:", error);
    }
    (0, models_1.initializeModels)(sequelize);
    return sequelize;
  });
}
exports.sequelizeConnect = sequelizeConnect;
