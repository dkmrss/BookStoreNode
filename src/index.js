const express = require("express");
const morgan = require("morgan");

const app = express();
const port = 3000;

app.use(express.json());

const dtaas = [
  { id: 1, name: "abc" },
  { id: 2, name: "abcd" },
  { id: 3, name: "abcd3" },
];
app.use(morgan("combined"));
app.get("/", (req, res) => {
  res.send("trang chủ");
});

app.get("/api/data/getdata", (req, res) => {
  res.send(dtaas);
});

app.get("/api/data/getdata/:id", (req, res) => {
  const data = dtaas.find((dtaas) => dtaas.id === parseInt(req.params.id));
  if (!data) res.status(404).send("id ko tồn tại");
  res.send(data);
});

app.post("/api/data/create", (req, res) => {
  const data = {
    id: req.body.id,
    name: req.body.name,
  };

  dtaas.push(data);
  res.send(
    JSON.stringify({
      success: true,
      notice: "đã thêm thành công",
      data: dtaas,
    })
  );
});

app.put("/api/data/edit/:id", (req, res) => {
  const data = dtaas.find((dtaas) => dtaas.id === parseInt(req.params.id));
  data.name = req.body.name;
  res.send(
    JSON.stringify({
      success: true,
      notice: "đã thêm thành công",
      data: dtaas,
    })
  );
});

app.delete("/api/data/delete/:id", (req, res) => {
  const data = dtaas.find((dtaas) => dtaas.id === parseInt(req.params.id));
  let dataIndex = dtaas.indexOf(data);
  dtaas.splice(dataIndex, 1);
  res.send(
    JSON.stringify({
      success: true,
      notice: "đã xoá thành công",
      data: dtaas,
    })
  );
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
