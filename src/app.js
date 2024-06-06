require("dotenv").config();
const createError = require("http-errors");
const express = require("express");
const dbConnection = require("./app/configs/database");

const app = express();
app.use(express.json());

const pathConfig = require("./path");
global.__base = __dirname + "/";
global.__path_app = __base + pathConfig.folder_app + "/";

global.__path_schemas = __path_app + pathConfig.folder_schemas + "/";
global.__path_models = __path_app + pathConfig.folder_models + "/";
global.__path_routers = __path_app + pathConfig.folder_routers + "/";
global.__path_configs = __path_app + pathConfig.folder_configs + "/";

const systemConfig = require(__path_configs + "system");
const dbConfig = require(__path_configs + "database");

app.locals.systemConfig = systemConfig;

// Kết nối cơ sở dữ liệu
dbConnection.connect((err) => {
  if (err) {
    console.error("Kết nối thất bại:", err.message);
    return;
  }
  console.log("Kết nối thành công đến MySQL");
});

app.use("/api/v1/", require(__path_routers));

app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  res.status(err.status || 500);
  res.end("Lỗi, URL không đúng");
});

module.exports = app;
