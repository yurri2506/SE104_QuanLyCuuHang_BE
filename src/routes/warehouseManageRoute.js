const express = require('express');
const router = express.Router();
const warehouseManageController = require('../controllers/warehouseController');

// Định tuyến cho báo cáo tồn kho
router.get('/reports', warehouseManageController.getAllReports); // Lấy tất cả báo cáo
router.get('/reports/:year/:month', warehouseManageController.generateReport); // Tạo báo cáo tồn kho theo năm và tháng
