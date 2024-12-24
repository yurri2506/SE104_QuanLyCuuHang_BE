const express = require('express');
const router = express.Router();
const warehouseManageController = require('../controllers/warehouseController');

router.get('/get-all', warehouseManageController.getAllReports);
router.get('/get-report/:thang/:maSanPham', warehouseManageController.getReportByMonthAndProduct);
router.post('/create', warehouseManageController.createReport);
router.put('update/:thang/:maSanPham', warehouseManageController.updateReport);
router.delete('delete/:thang/:maSanPham', warehouseManageController.deleteReport);

module.exports = router;