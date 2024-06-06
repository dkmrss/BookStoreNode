require("dotenv").config();
const createError = require("http-errors");
const express = require("express");
const dbConnection = require("./app/configs/database");
const systemConfig = require("./app/configs/system"); // Đã thêm dòng này

const app = express();
app.use(express.json());

const pathConfig = require("./path");
global.__base = __dirname + "/";
global.__path_app = __base + pathConfig.folder_app + "/";

global.__path_schemas = __path_app + pathConfig.folder_schemas + "/";
global.__path_models = __path_app + pathConfig.folder_models + "/";
global.__path_routers = __path_app + pathConfig.folder_routers + "/";
global.__path_configs = __path_app + pathConfig.folder_configs + "/";

// Sử dụng cấu hình cổng từ file system.js
app.locals.systemConfig = systemConfig;

// Gọi hàm để kết nối đến cơ sở dữ liệu
const connection = dbConnection;

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

// Sử dụng cổng từ cấu hình hệ thống
const port = app.locals.systemConfig.port || 3000;
app.listen(port, () => {
  console.log(`Ứng dụng đang chạy trên cổng ${port}`);
});

module.exports = app;
