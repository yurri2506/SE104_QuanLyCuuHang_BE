const { v4: uuidv4 } = require('uuid');
const SaleInvoice = require('../models/saleInvoice.model');
const SaleInvoiceDetail = require('../models/saleInvoiceDetail.model');
const Product = require('../models/product.model');

class SaleInvoiceService {
    static async createSaleInvoice(data) {
        const { soPhieu, ngayLap, khachHang, chiTietSanPham } = data;
    
        // Khởi tạo giao dịch
        const transaction = await SaleInvoice.sequelize.transaction();
    
        try {
            // Tính tổng tiền
            const tongTien = chiTietSanPham.reduce(
                (sum, item) => sum + item.thanhTien,
                0
            );
    
            // Lưu hóa đơn bán hàng
            const saleInvoice = await SaleInvoice.create(
                {
                    SoPhieuBH: soPhieu,
                    NgayLap: ngayLap,
                    MaKhachHang: khachHang,
                    TongTien: tongTien,
                },
                { transaction }
            );
    
            // Lưu chi tiết sản phẩm và cập nhật tồn kho
            const savedDetails = [];
            for (const product of chiTietSanPham) {
                // Tạo chi tiết sản phẩm với ID tự sinh
                const detail = await SaleInvoiceDetail.create(
                    {
                        MaChiTietBH: `${soPhieu}_${product.maSanPham}`,
                        SoPhieuBH: soPhieu,
                        MaSanPham: product.maSanPham,
                        SoLuong: product.soLuong,
                        DonGiaBanRa: product.donGia,
                        ThanhTien: product.thanhTien,
                    },
                    { transaction }
                );
    
                // Truy xuất sản phẩm hiện tại
                const currentProduct = await Product.findOne({
                    where: { MaSanPham: product.maSanPham },
                    transaction,
                });
    
                if (!currentProduct) {
                    throw new Error(`Không tìm thấy sản phẩm có mã ${product.maSanPham}`);
                }
    
                // Giảm số lượng tồn kho = Tồn kho hiện tại - Số lượng bán
                const updatedQuantity = currentProduct.SoLuong - product.soLuong;
    
                if (updatedQuantity < 0) {
                    throw new Error(
                        `Sản phẩm ${product.maSanPham} không đủ số lượng tồn kho (hiện tại: ${currentProduct.SoLuong})`
                    );
                }
    
                // Cập nhật tồn kho
                await Product.update(
                    { SoLuong: updatedQuantity },
                    {
                        where: { MaSanPham: product.maSanPham },
                        transaction,
                    }
                );
    
                savedDetails.push(detail.toJSON());
            }
    
            // Commit giao dịch
            await transaction.commit();
    
            // Trả về kết quả
            return {
                message: "Hóa đơn bán hàng tạo thành công",
                saleInvoice: {
                    SoPhieuBH: soPhieu,
                    NgayLap: ngayLap,
                    MaKH: khachHang,
                    TongTien: tongTien,
                    ChiTietSanPham: savedDetails,
                },
            };
        } catch (error) {
            // Rollback giao dịch khi có lỗi
            await transaction.rollback();
            throw new Error("Lỗi khi tạo hóa đơn bán hàng: " + error.message);
        }
    }
    

    static async getAllSaleInvoices() {
        return await SaleInvoice.findAll({
            include: [{
                model: SaleInvoiceDetail,
                as: 'details'
            }]
        });
    }

    static async getSaleInvoiceById(id) {
        return await SaleInvoice.findByPk(id, {
            include: [{
                model: SaleInvoiceDetail,
                as: 'details'
            }]
        });
    }

    static async updateSaleInvoice(soPhieu, { updatedDetails, addDetails, deleteDetails }) {
        const transaction = await SaleInvoice.sequelize.transaction();
    
        try {
            // Tìm hóa đơn bán hàng
            const saleInvoice = await SaleInvoice.findByPk(soPhieu);
            if (!saleInvoice) {
                throw new Error("Hóa đơn bán hàng không tồn tại");
            }
    
            // Kiểm tra thời gian
            const currentDate = new Date();
            const invoiceDate = new Date(saleInvoice.NgayLap);
            const timeDiff = Math.abs(currentDate - invoiceDate);
            const dayDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)); // Chuyển đổi sang số ngày
    
            if (dayDiff > 7) {
                if (addDetails && addDetails.length > 0) {
                    throw new Error("Không thể thêm chi tiết sau 7 ngày kể từ ngày tạo hóa đơn bán hàng.");
                }
    
                if (deleteDetails && deleteDetails.length > 0) {
                    throw new Error("Không thể xóa chi tiết sau 7 ngày kể từ ngày tạo hóa đơn bán hàng.");
                }
            }
    
            // Cập nhật thông tin hóa đơn nếu updatedDetails được cung cấp
            if (updatedDetails) {
                const { NgayLap, MaKH, TongTien } = updatedDetails;
                await saleInvoice.update({
                    NgayLap: NgayLap || saleInvoice.NgayLap,
                    MaKH: MaKH || saleInvoice.MaKH,
                    TongTien: TongTien || saleInvoice.TongTien,
                }, { transaction });
            }
    
            // Xử lý thêm chi tiết hóa đơn
            if (addDetails && addDetails.length > 0) {
                for (const product of addDetails) {
                    const detail = await SaleInvoiceDetail.create({
                        MaChiTietBH: `CTBH${uuidv4().substring(0, 8)}`,
                        SoPhieuBH: soPhieu,
                        MaSanPham: product.MaSanPham,
                        SoLuong: product.SoLuong,
                        DonGiaBanRa: product.DonGiaBanRa,
                        ThanhTien: product.ThanhTien,
                    }, { transaction });
    
                    const currentProduct = await Product.findOne({
                        where: { MaSanPham: product.MaSanPham },
                        transaction,
                    });
    
                    if (!currentProduct) {
                        throw new Error(`Không tìm thấy sản phẩm có mã ${product.MaSanPham}`);
                    }
    
                    const updatedQuantity = currentProduct.SoLuong - product.SoLuong;
                    if (updatedQuantity < 0) {
                        throw new Error(
                            `Sản phẩm ${product.MaSanPham} không đủ số lượng tồn kho (hiện tại: ${currentProduct.SoLuong})`
                        );
                    }
    
                    await Product.update(
                        { SoLuong: updatedQuantity },
                        {
                            where: { MaSanPham: product.MaSanPham },
                            transaction,
                        }
                    );
                }
            }
    
            // Xử lý xóa chi tiết hóa đơn
            if (deleteDetails && deleteDetails.length > 0) {
                for (const detail of deleteDetails) {
                    const { MaChiTietBH, MaSanPham, SoLuong } = detail;
                    await SaleInvoiceDetail.destroy({
                        where: { MaChiTietBH, SoPhieuBH: soPhieu },
                        transaction,
                    });
    
                    const currentProduct = await Product.findOne({
                        where: { MaSanPham: MaSanPham },
                        transaction,
                    });
    
                    if (currentProduct) {
                        const updatedQuantity = currentProduct.SoLuong + SoLuong;
                        await Product.update(
                            { SoLuong: updatedQuantity },
                            {
                                where: { MaSanPham: MaSanPham },
                                transaction,
                            }
                        );
                    }
                }
            }
    
            // Commit giao dịch
            await transaction.commit();
            return { message: "Cập nhật hóa đơn bán hàng thành công" };
        } catch (error) {
            // Rollback giao dịch khi có lỗi
            await transaction.rollback();
            throw new Error(`Lỗi khi cập nhật hóa đơn bán hàng: ${error.message}`);
        }
    }

    static async deleteSaleInvoice(id) {
        try {
            // Delete all related details first
            await SaleInvoiceDetail.destroy({
                where: { SoPhieuBH: id }
            });
    
            // Then delete the main invoice
            const deleted = await SaleInvoice.destroy({
                where: { SoPhieuBH: id }
            });
    
            if (!deleted) {
                throw new Error('Sale invoice not found');
            }
    
            return { message: 'Sale invoice deleted successfully' };
        } catch (error) {
            throw error;
        }
    }
}

module.exports = SaleInvoiceService;