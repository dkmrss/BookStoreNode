const db = require("../configs/database");
const newSchema = require("../schemas/NewSchema");
const fs = require("fs");
const path = require("path");

class NewModel {
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
      const rows = await this.executeQuery("SELECT * FROM news");
      callback({
        data: rows,
        message: "Danh sách tin tức đã được lấy thành công",
        success: true,
        error: "",
        totalCount: rows.length,
      });
    } catch (err) {
      callback({
        data: [],
        message: "Không thể lấy danh sách tin tức",
        success: false,
        error: err.message,
        totalCount: 0,
      });
    }
  }

  static async getDetail(id, callback) {
    try {
      const rows = await this.executeQuery("SELECT * FROM news WHERE id = ?", [
        id,
      ]);
      if (rows.length === 0) {
        return callback({
          data: {},
          message: "Không tìm thấy tin tức",
          success: false,
          error: "",
        });
      }
      callback({
        data: rows[0],
        message: "Thông tin tin tức đã được lấy thành công",
        success: true,
        error: "",
      });
    } catch (err) {
      callback({
        data: {},
        message: "Không thể lấy thông tin tin tức",
        success: false,
        error: err.message,
      });
    }
  }

  static async getListWithLimitOffset(limit, offset, callback) {
    try {
      const rows = await this.executeQuery(
        "SELECT * FROM news LIMIT ? OFFSET ?",
        [limit, offset]
      );
      const countResult = await this.executeQuery(
        "SELECT COUNT(*) as totalCount FROM news"
      );
      callback({
        data: rows,
        message: "Danh sách tin tức đã được lấy thành công",
        success: true,
        error: "",
        totalCount: countResult[0].totalCount,
      });
    } catch (err) {
      callback({
        data: [],
        message: "Không thể lấy danh sách tin tức",
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

  static async create(newNew, callback) {
    const { error } = newSchema.validate(newNew);
    if (error) {
      if (newNew.avatar) {
        const imagePath = path.join(__dirname, "..", "..", "..", newNew.avatar);
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
      const result = await this.executeQuery("INSERT INTO news SET ?", newNew);
      callback({
        data: result.insertId,
        message: "tin tức đã được thêm thành công",
        success: true,
        error: "",
      });
    } catch (err) {
      if (newNew.avatar) {
        const imagePath = path.join(__dirname, "..", "..", "..", newNew.avatar);
        await this.handleImageDeletion(imagePath);
      }
      callback({
        data: [],
        message: "Không thể thêm tin tức",
        success: false,
        error: err.message,
      });
    }
  }

  static async update(id, updatedNew, callback) {
    try {
      const rows = await this.executeQuery(
        "SELECT avatar FROM news WHERE id = ?",
        [id]
      );
      if (rows.length === 0) {
        if (updatedNew.avatar) {
          const imagePath = path.join(
            __dirname,
            "..",
            "..",
            "..",
            updatedNew.avatar
          );
          await this.handleImageDeletion(imagePath);
        }
        return callback({
          data: [],
          message: "Không tìm thấy tin tức",
          success: false,
          error: "",
        });
      }

      if (!updatedNew.avatar) {
        updatedNew.avatar = rows[0].avatar;
      }

      const result = await this.executeQuery("UPDATE news SET ? WHERE id = ?", [
        updatedNew,
        id,
      ]);
      if (result.affectedRows === 0) {
        if (updatedNew.avatar) {
          const imagePath = path.join(
            __dirname,
            "..",
            "..",
            "..",
            updatedNew.avatar
          );
          await this.handleImageDeletion(imagePath);
        }
        return callback({
          data: [],
          message: "Không tìm thấy tin tức dùng để cập nhật",
          success: false,
          error: "",
        });
      }
      callback({
        data: id,
        message: "Thông tin tin tức đã được cập nhật thành công",
        success: true,
        error: "",
      });
    } catch (err) {
      if (updatedNew.avatar) {
        const imagePath = path.join(
          __dirname,
          "..",
          "..",
          "..",
          updatedNew.avatar
        );
        await this.handleImageDeletion(imagePath);
      }
      callback({
        data: [],
        message: "Không thể cập nhật tin tức",
        success: false,
        error: err.message,
      });
    }
  }

  static async delete(id, callback) {
    try {
      const result = await this.executeQuery("DELETE FROM news WHERE id = ?", [
        id,
      ]);
      if (result.affectedRows === 0) {
        return callback({
          data: [],
          message: "Không tìm thấy tin tức để xóa",
          success: false,
          error: "",
        });
      }
      callback({
        data: id,
        message: "tin tức đã được xóa thành công",
        success: true,
        error: "",
      });
    } catch (err) {
      callback({
        data: [],
        message: "Không thể xóa tin tức",
        success: false,
        error: err.message,
      });
    }
  }

  static async updateField(id, field, value, callback) {
    try {
      const result = await this.executeQuery(
        `UPDATE news SET ${field} = ? WHERE id = ?`,
        [value, id]
      );
      if (result.affectedRows === 0) {
        return callback({
          data: [],
          message: `Không tìm thấy tin tức để cập nhật ${field}`,
          success: false,
          error: "",
        });
      }
      callback({
        data: id,
        message: `Trạng thái ${field} của tin tức đã được cập nhật thành công`,
        success: true,
        error: "",
      });
    } catch (err) {
      callback({
        data: [],
        message: `Không thể cập nhật ${field} của tin tức`,
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
        `SELECT * FROM news WHERE ${field} = ?`,
        [value]
      );
      callback({
        data: rows,
        message: `Danh sách tin tức theo ${field} đã được lấy thành công`,
        success: true,
        error: "",
        totalCount: rows.length,
      });
    } catch (err) {
      callback({
        data: [],
        message: `Không thể lấy danh sách tin tức theo ${field}`,
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
      const query = `SELECT * FROM news WHERE ${field} = ? LIMIT ? OFFSET ?`;
      const rows = await this.executeQuery(query, [value, limit, offset]);
      const countQuery = `SELECT COUNT(*) as totalCount FROM news WHERE ${field} = ?`;
      const countResult = await this.executeQuery(countQuery, [value]);
      callback({
        data: rows,
        message: `Danh sách tin tức theo ${field} đã được lấy thành công`,
        success: true,
        error: "",
        totalCount: countResult[0].totalCount,
      });
    } catch (err) {
      callback({
        data: [],
        message: `Không thể lấy danh sách tin tức theo ${field}`,
        success: false,
        error: err.message,
        totalCount: 0,
      });
    }
  }

  static async getListByFieldWithLimitOffset2(
    value1,

    value2,
    limit,
    offset,
    callback
  ) {
    try {
      const query = `SELECT * FROM news WHERE status = ? AND trash = ? LIMIT ? OFFSET ?`;
      const rows = await this.executeQuery(query, [
        value1,
        value2,
        limit,
        offset,
      ]);
      const countQuery = `SELECT COUNT(*) as totalCount FROM news WHERE status = ? AND trash = ?`;
      const countResult = await this.executeQuery(countQuery, [value1, value2]);
      callback({
        data: rows,
        message: `Danh sách tin tức đã được lấy thành công`,
        success: true,
        error: "",
        totalCount: countResult[0].totalCount,
      });
    } catch (err) {
      callback({
        data: [],
        message: `Không thể lấy danh sách tin tức `,
        success: false,
        error: err.message,
        totalCount: 0,
      });
    }
  }
}

module.exports = NewModel;
