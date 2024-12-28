const WarehouseManage = require('../models/warehouse.model');
const PurchaseDetail = require('../models/purchaseOrderDetails.model');
const SaleInvoiceDetail = require('../models/saleInvoiceDetail.model');
const Product = require('../models/product.model');
const ProductCategory = require('../models/category.model');
const { Op } = require('sequelize');

class WarehouseManageService {
    // Lấy tất cả báo cáo tồn kho
    static async getAllReports() {
        return await WarehouseManage.findAll();
    }

    // Tính toán và tạo báo cáo tồn kho
    static async generateReport(year, month) {
        const period = `${year}-${String(month).padStart(2, '0')}`; // Kết hợp năm và tháng

        // Lấy danh sách sản phẩm
        const products = await PurchaseDetail.findAll({
            attributes: ['MaSanPham', 'TenSanPham'],
            group: ['MaSanPham'],
        });

        const reports = [];

        for (const product of products) {
            // Lấy mã loại sản phẩm và đơn vị tính từ bảng Product và ProductCategory
            const productInfo = await Product.findOne({
                where: { MaSanPham: product.MaSanPham },
                include: [{
                    model: ProductCategory,
                    as: 'category',
                    attributes: ['DonViTinh']
                }]
            });

            const donViTinh = productInfo?.category?.DonViTinh || 'Chưa xác định';

            // Kiểm tra xem báo cáo đã tồn tại chưa
            const existingReport = await WarehouseManage.findOne({
                where: { Thang: period, MaSanPham: product.MaSanPham },
            });

            if (existingReport) {
                reports.push(existingReport);
                continue;
            }

            // Tính toán tồn kho
            const previousPeriod = WarehouseManageService.getPreviousMonth(year, month);
            const previousReport = await WarehouseManage.findOne({
                where: { Thang: previousPeriod, MaSanPham: product.MaSanPham },
            });

            const tonDau = previousReport ? previousReport.TonCuoi : 0;

            const muaVao = await PurchaseDetail.sum('SoLuong', {
                where: { MaSanPham: product.MaSanPham, NgayLap: { [Op.startsWith]: period } },
            });

            const banRa = await SaleInvoiceDetail.sum('SoLuong', {
                where: { MaSanPham: product.MaSanPham, NgayLap: { [Op.startsWith]: period } },
            });

            const tonCuoi = tonDau + (muaVao || 0) - (banRa || 0);

            // Tạo báo cáo mới
            const report = await WarehouseManage.create({
                Thang: period,
                MaSanPham: product.MaSanPham,
                TenSanPham: product.TenSanPham,
                TonDau: tonDau,
                SoLuongMuaVao: muaVao || 0,
                SoLuongBanRa: banRa || 0,
                TonCuoi: tonCuoi,
                DonViTinh: donViTinh,
            });

            reports.push(report);
        }

        return reports;
    }

    // Hàm hỗ trợ lấy tháng trước
    static getPreviousMonth(year, month) {
        let prevMonth = month - 1;
        let prevYear = year;
        if (prevMonth === 0) {
            prevMonth = 12;
            prevYear -= 1;
        }
        return `${prevYear}-${String(prevMonth).padStart(2, '0')}`;
    }
}

module.exports = WarehouseManageService;