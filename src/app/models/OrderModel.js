const db = require("../configs/database");
const OrderSchema = require("../schemas/OrderSchema");

class OrderModel {
  static executeQuery(query, params, successMessage, errorMessage, callback) {
    db.query(query, params, (err, result) => {
      if (err) {
        return callback({
          data: [],
          message: errorMessage,
          success: false,
          error: err.message,
        });
      }
      callback({
        data: result,
        message: successMessage,
        success: true,
        error: "",
      });
    });
  }

  static getAll(callback) {
    const query = "SELECT * FROM orders";
    const countQuery = "SELECT COUNT(*) as totalCount FROM orders";
    db.query(query, [], (err, rows) => {
      if (err) {
        return callback({
          data: [],
          message: "Không thể lấy danh sách đơn hàng",
          success: false,
          error: err.message,
        });
      }
      db.query(countQuery, [], (err, countResult) => {
        if (err) {
          return callback({
            data: [],
            message: "Không thể đếm số lượng đơn hàng",
            success: false,
            error: err.message,
          });
        }
        const totalCount = countResult[0].totalCount;
        callback({
          data: rows,
          message: "Danh sách đơn hàng đã được lấy thành công",
          success: true,
          error: "",
          totalCount: totalCount,
        });
      });
    });
  }

  static getById(id, callback) {
    this.executeQuery(
      "SELECT * FROM orders WHERE id = ?",
      [id],
      "Thông tin đơn hàng đã được lấy thành công",
      "Không thể lấy thông tin đơn hàng",
      (response) => {
        if (response.data.length === 0) {
          return callback({
            data: {},
            message: "Không tìm thấy đơn hàng",
            success: false,
            error: "",
          });
        }
        response.data = response.data[0];
        callback(response);
      }
    );
  }

  static create(newComment, callback) {
    const { error } = OrderSchema.validate(newComment);
    if (error) {
      return callback({
        data: [],
        message: "Dữ liệu không hợp lệ",
        success: false,
        error: error.details[0].message,
      });
    }

    this.executeQuery(
      "INSERT INTO orders SET ?",
      newComment,
      "đơn hàng đã được thêm thành công",
      "Không thể thêm đơn hàng",
      (response) => {
        response.data = response.data.insertId;
        callback(response);
      }
    );
  }

  static update(id, updatedComment, callback) {
    this.executeQuery(
      "UPDATE orders SET ? WHERE id = ?",
      [updatedComment, id],
      "Thông tin đơn hàng đã được cập nhật thành công",
      "Không thể cập nhật thông tin đơn hàng",
      (response) => {
        if (response.data.affectedRows === 0) {
          return callback({
            data: [],
            message: "Không tìm thấy đơn hàng để cập nhật",
            success: false,
            error: "",
          });
        }
        response.data = id;
        callback(response);
      }
    );
  }

  static delete(id, callback) {
    this.executeQuery(
      "DELETE FROM orders WHERE id = ?",
      [id],
      "đơn hàng đã được xóa thành công",
      "Không thể xóa đơn hàng",
      (response) => {
        if (response.data.affectedRows === 0) {
          return callback({
            data: [],
            message: "Không tìm thấy đơn hàng để xóa",
            success: false,
            error: "",
          });
        }
        response.data = id;
        callback(response);
      }
    );
  }

  static getListWithLimitOffset(limit, offset, callback) {
    const query = "SELECT * FROM orders LIMIT ? OFFSET ?";
    const countQuery = "SELECT COUNT(*) as totalCount FROM orders";
    db.query(query, [limit, offset], (err, rows) => {
      if (err) {
        return callback({
          data: [],
          message: "Không thể lấy danh sách đơn hàng",
          success: false,
          error: err.message,
        });
      }
      db.query(countQuery, [], (err, countResult) => {
        if (err) {
          return callback({
            data: [],
            message: "Không thể đếm số lượng đơn hàng",
            success: false,
            error: err.message,
          });
        }
        const totalCount = countResult[0].totalCount;
        callback({
          data: rows,
          message: "Danh sách đơn hàng đã được lấy thành công",
          success: true,
          error: "",
          totalCount: totalCount,
        });
      });
    });
  }

  static getListWithLimitOffsetByField(field, value, limit, offset, callback) {
    const query = `SELECT * FROM orders WHERE ${field} = ? LIMIT ? OFFSET ?`;
    const countQuery = `SELECT COUNT(*) as totalCount FROM orders WHERE ${field} = ?`;
    db.query(query, [value, limit, offset], (err, rows) => {
      if (err) {
        return callback({
          data: [],
          message: "Không thể lấy danh sách đơn hàng",
          success: false,
          error: err.message,
        });
      }
      db.query(countQuery, [value], (err, countResult) => {
        if (err) {
          return callback({
            data: [],
            message: "Không thể đếm số lượng đơn hàng",
            success: false,
            error: err.message,
          });
        }
        const totalCount = countResult[0].totalCount;
        callback({
          data: rows,
          message: "Danh sách đơn hàng đã được lấy thành công",
          success: true,
          error: "",
          totalCount: totalCount,
        });
      });
    });
  }

  static getListWithLimitOffsetByFields(fields, values, limit, offset, callback) {
    if (fields.length !== values.length) {
      return callback({
        data: [],
        message: "Số lượng fields và values không khớp",
        success: false,
        error: "Invalid input",
      });
    }

    const whereClauses = fields.map(field => `${field} = ?`).join(' AND ');
    const query = `SELECT * FROM orders WHERE ${whereClauses} LIMIT ? OFFSET ?`;
    const countQuery = `SELECT COUNT(*) as totalCount FROM orders WHERE ${whereClauses}`;

    const queryParams = [...values, limit, offset];
    const countParams = values;

    db.query(query, queryParams, (err, rows) => {
      if (err) {
        return callback({
          data: [],
          message: "Không thể lấy danh sách đơn hàng",
          success: false,
          error: err.message,
        });
      }
      db.query(countQuery, countParams, (err, countResult) => {
        if (err) {
          return callback({
            data: [],
            message: "Không thể đếm số lượng đơn hàng",
            success: false,
            error: err.message,
          });
        }
        const totalCount = countResult[0].totalCount;
        callback({
          data: rows,
          message: "Danh sách đơn hàng đã được lấy thành công",
          success: true,
          error: "",
          totalCount: totalCount,
        });
      });
    });
  }
}

module.exports = OrderModel;
