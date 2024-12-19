const express = require('express');
const UnitController = require('../controllers/unitController');

const router = express.Router();

router.get('/get-all', UnitController.getAllUnits);         // Lấy tất cả đơn vị tính
router.get('/get-details/:id', UnitController.getUnitById);     // Lấy thông tin chi tiết đơn vị tính
router.post('/create', UnitController.createUnit);         // Thêm đơn vị tính mới
router.put('/update/:id', UnitController.updateUnit);      // Cập nhật đơn vị tính
router.delete('/delete/:id', UnitController.deleteUnit);   // Xóa đơn vị tính

module.exports = router;