require("dotenv").config();
const createError = require("http-errors");
const express = require("express");
const dbConnection = require("./src/app/configs/database");
const systemConfig = require("./src/app/configs/system");
const app = express();
const path = require("path");

app.use(express.json());

const pathConfig = require("./src/path");
global.__base = __dirname + "/src";
global.__path_app = __base + pathConfig.folder_app + "/";

global.__path_schemas = __path_app + pathConfig.folder_schemas + "";
global.__path_models = __path_app + pathConfig.folder_models + "";
global.__path_routers = __path_app + pathConfig.folder_routers + "";
global.__path_configs = __path_app + pathConfig.folder_configs + "";

// Sử dụng cấu hình cổng từ file system.js
app.locals.systemConfig = systemConfig;

// Gọi hàm để kết nối đến cơ sở dữ liệu
const connection = dbConnection;

app.use("/api/v1/", require(__path_routers));

// Phục vụ các tệp tĩnh từ thư mục "assets"
app.use("/assets/avt", express.static(path.join(__dirname, "assets", "avt")));

app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // Lỗi 400 cho các yêu cầu không hợp lệ
  if (err.status === 400) {
    res.status(400).json({ error: "Lỗi kết nối", message: err.message });
  } else if (err.status === 404) {
    res.status(404).json({ error: "Không tìm thấy", message: err.message });
  } else {
    // Các lỗi khác
    res.status(err.status || 500);
    res.json({
      error: err.message,
      message: "Có lỗi xảy ra vui lòng liên hệ với các bên liên quan",
    });
  }
});

// Sử dụng cổng từ cấu hình hệ thống
const port = app.locals.systemConfig.port || 3000;
app.listen(port, () => {
  console.log(`Ứng dụng đang chạy trên cổng ${port}`);
});
