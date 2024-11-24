const Unit = require("../models/unit.model");

class UnitService {
  // Lấy tất cả đơn vị tính
  async getAllUnits() {
    const units = await Unit.findAll();
    return {
      message: "Lấy danh sách đơn vị tính thành công.",
      data: units,
    };
  }

  // Lấy thông tin chi tiết đơn vị tính
  async getUnitById(MaDVTinh) {
    const unit = await Unit.findByPk(MaDVTinh);
    if (!unit) {
      throw new Error("Không tìm thấy đơn vị tính với mã này.");
    }
    return {
      message: "Lấy thông tin chi tiết đơn vị tính thành công.",
      data: unit,
    };
  }

  // Thêm đơn vị tính mới
  async createUnit(data) {
    if (!data.MaDVTinh || !data.TenDVTinh) {
      throw new Error("Vui lòng cung cấp đầy đủ thông tin.");
    }

    const existingUnit = await Unit.findByPk(data.MaDVTinh);
    if (existingUnit) {
      throw new Error("Mã đơn vị tính đã tồn tại.");
    }

    const newUnit = await Unit.create(data);
    return {
      message: "Thêm đơn vị tính thành công.",
      data: newUnit,
    };
  }

  // Cập nhật đơn vị tính
  async updateUnit(MaDVTinh, data) {
    const unit = await Unit.findByPk(MaDVTinh);
    if (!unit) {
      throw new Error("Không tìm thấy đơn vị tính với mã này.");
    }

    const updatedUnit = await unit.update(data);
    return {
      message: "Cập nhật đơn vị tính thành công.",
      data: updatedUnit,
    };
  }

  // Xóa đơn vị tính
  async deleteUnit(MaDVTinh) {
    const unit = await Unit.findByPk(MaDVTinh);
    if (!unit) {
      throw new Error("Không tìm thấy đơn vị tính với mã này.");
    }

    await unit.destroy();
    return {
      message: "Đơn vị tính đã được xóa thành công.",
    };
  }
}

module.exports = new UnitService();
