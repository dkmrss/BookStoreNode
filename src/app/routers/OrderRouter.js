const express = require("express");
const router = express.Router();
const OrderModel = require("../models/OrderModel");

// Route để lấy danh sách tất cả bình luận của người dùng
router.get("/get-list", (req, res) => {
  OrderModel.getAll((result) => {
    res.status(200).json(result);
  });
});

// Route để lấy thông tin chi tiết của một bình luận của người dùng
router.get("/order-detail/:id", (req, res) => {
  const id = req.params.id;
  OrderModel.getById(id, (result) => {
    res.status(200).json(result);
  });
});

// Route để tạo một bình luận của người dùng mới
router.post("/create", (req, res) => {
  const newOrder = req.body;
  OrderModel.create(newOrder, (result) => {
    res.json(result);
  });
});

// Route để cập nhật thông tin của một bình luận của người dùng
router.put("/update/:id", (req, res) => {
  const id = req.params.id;
  const updatedOrder = req.body;
  OrderModel.update(id, updatedOrder, (result) => {
    res.status(result.success ? 200 : 400).json(result);
  });
});

// Route để xóa một bình luận của người dùng
router.delete("/delete/:id", (req, res) => {
  const id = req.params.id;
  OrderModel.delete(id, (result) => {
    res.status(200).json(result);
  });
});

//lấy theo trường
router.get("/get-list-by-field", (req, res) => {
  const { field, value, take, skip } = req.query;

  if (!field || !value || !take || !skip) {
    return res.status(400).json({
      data: [],
      message:
        "Thiếu thông tin trường hoặc giá trị, hoặc số lượng kết quả hoặc vị trí bắt đầu",
      success: false,
      error: "Missing field, value, take, or skip parameter",
    });
  }

  const takeInt = parseInt(take);
  const skipInt = parseInt(skip);

  if (isNaN(takeInt) || isNaN(skipInt)) {
    return res.status(400).json({
      data: [],
      message: "Số lượng kết quả hoặc vị trí bắt đầu không hợp lệ",
      success: false,
      error: "Invalid take or skip parameter",
    });
  }

  OrderModel.getListWithLimitOffsetByField(
    field,
    value,
    takeInt,
    skipInt,
    (result) => {
      res.status(result.success ? 200 : 400).json(result);
    }
  );
});

//phân trang, lấy theo trường
router.get("/get-lists", (req, res) => {
  const take = parseInt(req.query.take);
  const skip = parseInt(req.query.skip);
  const delivered = req.query.delivered;
  const method = req.query.method;
  const payment = req.query.payment;
  const customer_id = req.query.customer_id;
  const phone = req.query.phone;

  const fields = [];
  const values = [];

  if (phone) {
    fields.push("phone");
    values.push(phone);
  }

  if (delivered) {
    fields.push("delivered");
    values.push(delivered);
  }

  if (method) {
    fields.push("method");
    values.push(method);
  }

  if (payment) {
    fields.push("payment");
    values.push(payment);
  }

  if (customer_id) {
    fields.push("customer_id");
    values.push(customer_id);
  }

  if (fields.length > 0) {
    OrderModel.getListWithLimitOffsetByFields(
      fields,
      values,
      take,
      skip,
      (result) => {
        res.status(result.success ? 200 : 400).json(result);
      }
    );
  } else {
    OrderModel.getListWithLimitOffset(take, skip, (result) => {
      res.status(200).json(result);
    });
  }
});

module.exports = router;
