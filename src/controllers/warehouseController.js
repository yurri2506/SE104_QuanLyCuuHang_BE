// controllers/warehouseManageController.js
const warehouseManageService = require("../services/warehouseService");

class WarehouseManageController {
  // Lấy tất cả báo cáo tồn kho
  static async getAllReports(req, res) {
    try {
      const reports = await warehouseManageService.getAllReports();
      res.status(200).json(reports);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Tạo hoặc cập nhật báo cáo tồn kho
  static async generateReport(req, res) {
    try {
      const { year, month } = req.params; // Nhận cả năm và tháng từ params
      const report = await warehouseManageService.generateReport(year, month);
      res.status(201).json(report);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = WarehouseManageController;