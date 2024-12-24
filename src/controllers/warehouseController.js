// controllers/warehouseManageController.js
const warehouseManageService = require('../services/warehouseService');

const getAllReports = async (req, res) => {
  try {
    const reports = await warehouseManageService.getAllReports();
    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getReportByMonthAndProduct = async (req, res) => {
  const { thang, maSanPham } = req.params;
  try {
    const report = await warehouseManageService.getReportByMonthAndProduct(thang, maSanPham);
    if (report) res.status(200).json(report);
    else res.status(404).json({ message: 'Report not found' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createReport = async (req, res) => {
  try {
    const newReport = await warehouseManageService.createReport(req.body);
    res.status(201).json(newReport);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateReport = async (req, res) => {
  const { thang, maSanPham } = req.params;
  try {
    const updatedReport = await warehouseManageService.updateReport(thang, maSanPham, req.body);
    if (updatedReport[0] > 0) res.status(200).json({ message: 'Report updated successfully' });
    else res.status(404).json({ message: 'Report not found' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteReport = async (req, res) => {
  const { thang, maSanPham } = req.params;
  try {
    const deleted = await warehouseManageService.deleteReport(thang, maSanPham);
    if (deleted) res.status(200).json({ message: 'Report deleted successfully' });
    else res.status(404).json({ message: 'Report not found' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllReports,
  getReportByMonthAndProduct,
  createReport,
  updateReport,
  deleteReport,
};