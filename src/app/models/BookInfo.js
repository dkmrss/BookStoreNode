const db = require("../configs/database");
const BookInfoSchema = require("../schemas/BookInfoSchema");
const fs = require("fs");
const path = require("path");

class BookInfoModel {
  static async executeQuery(query, params = []) {
    return new Promise((resolve, reject) => {
      db.query(query, params, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  static async getList(callback) {
    try {
      const rows = await this.executeQuery("SELECT * FROM book_info");
      callback({
        data: rows,
        message: "Danh sách danh mục đã được lấy thành công",
        success: true,
        error: "",
        totalCount: rows.length,
      });
    } catch (err) {
      callback({
        data: [],
        message: "Không thể lấy danh sách danh mục",
        success: false,
        error: err.message,
        totalCount: 0,
      });
    }
  }

  static async getDetail(id, callback) {
    try {
      const rows = await this.executeQuery(
        "SELECT * FROM book_info WHERE id = ?",
        [id]
      );
      if (rows.length === 0) {
        return callback({
          data: {},
          message: "Không tìm thấy danh mục",
          success: false,
          error: "",
        });
      }
      callback({
        data: rows[0],
        message: "Thông tin danh mục đã được lấy thành công",
        success: true,
        error: "",
      });
    } catch (err) {
      callback({
        data: {},
        message: "Không thể lấy thông tin danh mục",
        success: false,
        error: err.message,
      });
    }
  }

  static async getListWithLimitOffset(limit, offset, callback) {
    try {
      const rows = await this.executeQuery(
        "SELECT * FROM book_info LIMIT ? OFFSET ?",
        [limit, offset]
      );
      const countResult = await this.executeQuery(
        "SELECT COUNT(*) as totalCount FROM book_info"
      );
      callback({
        data: rows,
        message: "Danh sách danh mục đã được lấy thành công",
        success: true,
        error: "",
        totalCount: countResult[0].totalCount,
      });
    } catch (err) {
      callback({
        data: [],
        message: "Không thể lấy danh sách danh mục",
        success: false,
        error: err.message,
        totalCount: 0,
      });
    }
  }

  static async handleImageDeletion(imagePath) {
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
  }

  static async create(newBookInfo, callback) {
    const { error } = BookInfoSchema.validate(newBookInfo);
    if (error) {
      if (newBookInfo.book_images) {
        const imagePath = path.join(
          __dirname,
          "..",
          "..",
          "..",
          newBookInfo.book_images
        );
        await this.handleImageDeletion(imagePath);
      }
      return callback({
        data: [],
        message: "Dữ liệu không hợp lệ",
        success: false,
        error: error.details[0].message,
      });
    }
    try {
      const result = await this.executeQuery(
        "INSERT INTO book_info SET ?",
        newBookInfo
      );
      callback({
        data: result.insertId,
        message: "Danh mục đã được thêm thành công",
        success: true,
        error: "",
      });
    } catch (err) {
      if (newBookInfo.book_images) {
        const imagePath = path.join(
          __dirname,
          "..",
          "..",
          "..",
          newBookInfo.book_images
        );
        await this.handleImageDeletion(imagePath);
      }
      callback({
        data: [],
        message: "Không thể thêm danh mục",
        success: false,
        error: err.message,
      });
    }
  }

  static async update(id, updatedBookInfo, callback) {
    try {
      const rows = await this.executeQuery(
        "SELECT book_images FROM book_info WHERE id = ?",
        [id]
      );
      if (rows.length === 0) {
        if (updatedBookInfo.book_images) {
          const imagePath = path.join(
            __dirname,
            "..",
            "..",
            "..",
            updatedBookInfo.book_images
          );
          await this.handleImageDeletion(imagePath);
        }
        return callback({
          data: [],
          message: "Không tìm thấy danh mục",
          success: false,
          error: "",
        });
      }

      if (!updatedBookInfo.book_images) {
        updatedBookInfo.book_images = rows[0].book_images;
      }

      const result = await this.executeQuery(
        "UPDATE book_info SET ? WHERE id = ?",
        [updatedBookInfo, id]
      );
      if (result.affectedRows === 0) {
        if (updatedBookInfo.book_images) {
          const imagePath = path.join(
            __dirname,
            "..",
            "..",
            "..",
            updatedBookInfo.book_images
          );
          await this.handleImageDeletion(imagePath);
        }
        return callback({
          data: [],
          message: "Không tìm thấy danh mục dùng để cập nhật",
          success: false,
          error: "",
        });
      }
      callback({
        data: id,
        message: "Thông tin danh mục đã được cập nhật thành công",
        success: true,
        error: "",
      });
    } catch (err) {
      if (updatedBookInfo.book_images) {
        const imagePath = path.join(
          __dirname,
          "..",
          "..",
          "..",
          updatedBookInfo.book_images
        );
        await this.handleImageDeletion(imagePath);
      }
      callback({
        data: [],
        message: "Không thể cập nhật danh mục",
        success: false,
        error: err.message,
      });
    }
  }

  static async delete(id, callback) {
    try {
      const result = await this.executeQuery(
        "DELETE FROM book_info WHERE id = ?",
        [id]
      );
      if (result.affectedRows === 0) {
        return callback({
          data: [],
          message: "Không tìm thấy danh mục để xóa",
          success: false,
          error: "",
        });
      }
      callback({
        data: id,
        message: "Danh mục đã được xóa thành công",
        success: true,
        error: "",
      });
    } catch (err) {
      callback({
        data: [],
        message: "Không thể xóa danh mục",
        success: false,
        error: err.message,
      });
    }
  }

  static async updateField(id, field, value, callback) {
    try {
      const result = await this.executeQuery(
        `UPDATE book_info SET ${field} = ? WHERE id = ?`,
        [value, id]
      );
      if (result.affectedRows === 0) {
        return callback({
          data: [],
          message: `Không tìm thấy danh mục để cập nhật ${field}`,
          success: false,
          error: "",
        });
      }
      callback({
        data: id,
        message: `Trạng thái ${field} của danh mục đã được cập nhật thành công`,
        success: true,
        error: "",
      });
    } catch (err) {
      callback({
        data: [],
        message: `Không thể cập nhật ${field} của danh mục`,
        success: false,
        error: err.message,
      });
    }
  }

  static updateStatus(id, status, callback) {
    this.updateField(id, "status", status, callback);
  }

  static updateTrash(id, trash, callback) {
    this.updateField(id, "trash", trash, callback);
  }

  static async getListByField(field, value, callback) {
    try {
      const rows = await this.executeQuery(
        `SELECT * FROM book_info WHERE ${field} = ?`,
        [value]
      );
      callback({
        data: rows,
        message: `Danh sách danh mục theo ${field} đã được lấy thành công`,
        success: true,
        error: "",
        totalCount: rows.length,
      });
    } catch (err) {
      callback({
        data: [],
        message: `Không thể lấy danh sách danh mục theo ${field}`,
        success: false,
        error: err.message,
        totalCount: 0,
      });
    }
  }

  static getListByStatus(status, callback) {
    this.getListByField("status", status, callback);
  }

  static getListByTrash(trash, callback) {
    this.getListByField("trash", trash, callback);
  }

  static async getListByFieldWithLimitOffset(
    field,
    value,
    limit,
    offset,
    callback
  ) {
    try {
      const query = `SELECT * FROM book_info WHERE ${field} = ? LIMIT ? OFFSET ?`;
      const rows = await this.executeQuery(query, [value, limit, offset]);
      const countQuery = `SELECT COUNT(*) as totalCount FROM book_info WHERE ${field} = ?`;
      const countResult = await this.executeQuery(countQuery, [value]);
      callback({
        data: rows,
        message: `Danh sách danh mục theo ${field} đã được lấy thành công`,
        success: true,
        error: "",
        totalCount: countResult[0].totalCount,
      });
    } catch (err) {
      callback({
        data: [],
        message: `Không thể lấy danh sách danh mục theo ${field}`,
        success: false,
        error: err.message,
        totalCount: 0,
      });
    }
  }

  static async getListByFieldWithLimitOffset2(value, limit, offset, callback) {
    try {
      const query = `SELECT * FROM book_info WHERE trash = ? LIMIT ? OFFSET ?`;
      const rows = await this.executeQuery(query, [value, limit, offset]);
      const countQuery = `SELECT COUNT(*) as totalCount FROM book_info WHERE trash = ?`;
      const countResult = await this.executeQuery(countQuery, [value]);
      callback({
        data: rows,
        message: `Danh sách danh mục đã được lấy thành công`,
        success: true,
        error: "",
        totalCount: countResult[0].totalCount,
      });
    } catch (err) {
      callback({
        data: [],
        message: `Không thể lấy danh sách danh mục `,
        success: false,
        error: err.message,
        totalCount: 0,
      });
    }
  }
}

module.exports = BookInfoModel;
