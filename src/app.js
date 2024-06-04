const express = require("express");
const systemConfig = require("./app/configs/system");
const indexRouter = require("./app/routers/index");

const app = express();

app.use(express.json());

app.use("/", indexRouter);

app.listen(systemConfig.port, () => {
  console.log(`Server is running on port ${systemConfig.port}`);
});
