const { v4: uuidv4 } = require('uuid');
const SaleInvoice = require('../models/saleInvoice.model');
const SaleInvoiceDetail = require('../models/saleInvoiceDetail.model');
const Product = require('../models/product.model');
const ProductCategory = require('../models/category.model');

class SaleInvoiceService {
    static async createSaleInvoice(data) {
        const { soPhieu, ngayLap, khachHang, chiTietSanPham } = data;

        // Khởi tạo giao dịch
        const transaction = await SaleInvoice.sequelize.transaction();

        try {
            // Lưu hóa đơn bán hàng trước
            const saleInvoice = await SaleInvoice.create(
                {
                    SoPhieuBH: soPhieu,
                    NgayLap: ngayLap,
                    MaKhachHang: khachHang,
                    TongTien: 0, // Temporary value, will be updated later
                },
                { transaction }
            );

            // Lưu chi tiết sản phẩm và cập nhật tồn kho
            const savedDetails = [];
            let tongTien = 0; // Tổng tiền sẽ được tính sau khi tính thành tiền của từng chi tiết

            for (const product of chiTietSanPham) {
                // Truy xuất sản phẩm hiện tại
                const currentProduct = await Product.findOne({
                    where: { MaSanPham: product.maSanPham },
                    transaction,
                });

                if (!currentProduct) {
                    throw new Error(`Không tìm thấy sản phẩm có mã ${product.maSanPham}`);
                }

                // Lấy thông tin loại sản phẩm
                const productType = await ProductCategory.findOne({
                    where: { MaLoaiSanPham: currentProduct.MaLoaiSanPham },
                    transaction,
                });

                if (!productType) {
                    throw new Error(`Không tìm thấy loại sản phẩm cho mã ${currentProduct.MaLoaiSanPham}`);
                }

                // Tính toán đơn giá bán ra
                const updatedPrice = currentProduct.DonGia * (1 + productType.PhanTramLoiNhuan / 100);

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

                // Tạo chi tiết sản phẩm với giá bán cập nhật
                const thanhTien = updatedPrice * product.soLuong;
                tongTien += thanhTien; // Cộng thành tiền vào tổng tiền

                const detail = await SaleInvoiceDetail.create(
                    {
                        MaChiTietBH: `${soPhieu}_${product.maSanPham}`,
                        SoPhieuBH: soPhieu,
                        MaSanPham: product.maSanPham,
                        SoLuong: product.soLuong,
                        DonGiaBanRa: updatedPrice,
                        ThanhTien: thanhTien,
                    },
                    { transaction }
                );

                savedDetails.push(detail.toJSON());
            }

            // Cập nhật tổng tiền của hóa đơn bán hàng
            await saleInvoice.update(
                { TongTien: parseFloat(tongTien).toFixed(2) }, // Ensure the total amount is formatted as a decimal
                { transaction }
            );

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

    static async updateSaleInvoice(soPhieu, { updateDetails, addDetails, deleteDetails }) {
        console.log('updateDetails:', updateDetails);
        console.log('addDetails:', addDetails);
        console.log('deleteDetails:', deleteDetails);
        const transaction = await SaleInvoice.sequelize.transaction();

        try {
            const saleInvoice = await SaleInvoice.findByPk(soPhieu);
            if (!saleInvoice) {
                throw new Error("Hóa đơn bán hàng không tồn tại");
            }

            // Update invoice info if provided
            if (updateDetails && updateDetails.length > 0) {
                const { NgayLap, MaKH } = updateDetails[0];
                await saleInvoice.update({
                    NgayLap,
                    MaKhachHang: MaKH
                }, { transaction });
            }

            // Handle deleted items
            if (deleteDetails?.length > 0) {
                for (const detail of deleteDetails) {
                    await SaleInvoiceDetail.destroy({
                        where: { 
                            MaChiTietBH: detail.MaChiTietBH,
                            SoPhieuBH: soPhieu 
                        },
                        transaction
                    });

                    // Return stock
                    const product = await Product.findByPk(detail.MaSanPham, { transaction });
                    if (product) {
                        await product.update({
                            SoLuong: product.SoLuong + detail.SoLuong
                        }, { transaction });
                    }
                }
            }

            // Handle added items
            if (addDetails?.length > 0) {
                for (const detail of addDetails) {
                    const product = await Product.findByPk(detail.MaSanPham, {
                        include: [{
                            model: ProductCategory,
                            as: 'category'
                        }],
                        transaction
                    });

                    if (!product) {
                        throw new Error(`Không tìm thấy sản phẩm ${detail.MaSanPham}`);
                    }

                    // Check stock
                    if (product.SoLuong < detail.SoLuong) {
                        throw new Error(`Sản phẩm ${product.TenSanPham} không đủ số lượng`);
                    }

                    // Calculate selling price
                    const sellingPrice = product.DonGia * (1 + (product.category.PhanTramLoiNhuan / 100));

                    // Create detail record
                    await SaleInvoiceDetail.create({
                        MaChiTietBH: `${soPhieu}_${detail.MaSanPham}`,
                        SoPhieuBH: soPhieu,
                        MaSanPham: detail.MaSanPham,
                        SoLuong: detail.SoLuong,
                        DonGiaBanRa: sellingPrice,
                        ThanhTien: sellingPrice * detail.SoLuong,
                        HinhAnh: detail.HinhAnh
                    }, { transaction });

                    // Update stock
                    await product.update({
                        SoLuong: product.SoLuong - detail.SoLuong
                    }, { transaction });
                }
            }

            // Recalculate total
            const details = await SaleInvoiceDetail.findAll({
                where: { SoPhieuBH: soPhieu },
                transaction
            });

            const total = details.reduce((sum, detail) => sum + Number(detail.ThanhTien), 0);
            await saleInvoice.update({ TongTien: parseFloat(total).toFixed(2)  }, { transaction });

            await transaction.commit();
            return { message: "Cập nhật thành công" };

        } catch (error) {
            await transaction.rollback();
            throw new Error(`Lỗi cập nhật: ${error.message}`);
        }
    }

    static async deleteSaleInvoice(id) {
        const transaction = await SaleInvoice.sequelize.transaction();

        try {
            // Lấy chi tiết phiếu bán hàng
            const saleInvoiceDetails = await SaleInvoiceDetail.findAll({
                where: { SoPhieuBH: id },
                transaction,
            });

            // Cập nhật lại số lượng tồn kho của sản phẩm
            for (const detail of saleInvoiceDetails) {
                const product = await Product.findOne({
                    where: { MaSanPham: detail.MaSanPham },
                    transaction,
                });

                if (product) {
                    const updatedQuantity = product.SoLuong + detail.SoLuong;
                    await Product.update(
                        { SoLuong: updatedQuantity },
                        {
                            where: { MaSanPham: detail.MaSanPham },
                            transaction,
                        }
                    );
                }
            }

            // Xóa chi tiết phiếu bán hàng
            await SaleInvoiceDetail.destroy({
                where: { SoPhieuBH: id },
                transaction,
            });

            // Xóa phiếu bán hàng
            const result = await SaleInvoice.destroy({
                where: { SoPhieuBH: id },
                transaction,
            });

            await transaction.commit();

            if (!result) {
                throw new Error('Sale invoice not found');
            }

            return { message: 'Sale invoice deleted successfully' };
        } catch (error) {
            await transaction.rollback();
            throw new Error("Lỗi khi xóa hóa đơn bán hàng: " + error.message);
        }
    }
}

module.exports = SaleInvoiceService;