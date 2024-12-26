const { v4: uuidv4 } = require("uuid"); // Thư viện để tạo mã tự động
const PurchaseOrder = require("../models/purchaseOrder.model");
const PurchaseDetail = require("../models/purchaseOrderDetails.model");
const Provider = require("../models/provider.model");
const Product = require("../models/product.model");
const ProductCategory = require("../models/category.model");

class PurchaseService {
  static async createPurchase(data) {
    const { soPhieu, ngayLap, nhaCungCap, chiTietSanPham } = data;

    // Khởi tạo giao dịch
    const transaction = await PurchaseOrder.sequelize.transaction();

    try {
      // Tính tổng tiền
      const tongTien = chiTietSanPham.reduce(
        (sum, item) => sum + item.thanhTien,
        0
      );

      // Lưu phiếu mua hàng
      const purchaseOrder = await PurchaseOrder.create(
        {
          SoPhieu: soPhieu,
          NgayLap: ngayLap,
          MaNCC: nhaCungCap,
          TongTien: tongTien,
        },
        { transaction }
      );

      // Lưu chi tiết sản phẩm và cập nhật tồn kho
      const savedDetails = [];
      for (const product of chiTietSanPham) {
        // Tạo chi tiết sản phẩm
        const detail = await PurchaseDetail.create(
          {
            MaChiTietMH: `${soPhieu}_${product.maSanPham}`,
            SoPhieu: soPhieu,
            MaSanPham: product.maSanPham,
            SoLuong: product.soLuong,
            DonGia: product.donGia,
            ThanhTien: product.thanhTien,
          },
          { transaction }
        );
        
        // Truy xuất mã loại sản phẩm
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

        // Tăng số lượng tồn kho = Tồn kho hiện tại + Số lượng mua thêm
        const updatedQuantity = currentProduct.SoLuong + product.soLuong;

        console.log("Số lượng update: ", updatedQuantity)  

        await Product.update(
          { 
            SoLuong: updatedQuantity,
          },
          {
            where: { MaSanPham: product.maSanPham },
            transaction,
          }
        );

        savedDetails.push({
          ...detail.toJSON(),
          TenLoaiSanPham: productType.TenLoaiSanPham
        });
      }

      // Commit giao dịch
      await transaction.commit();

      // Trả về kết quả
      return {
        message: "Phiếu mua hàng tạo thành công",
        purchaseOrder: {
          SoPhieu: soPhieu,
          NgayLap: ngayLap,
          MaNCC: nhaCungCap,
          TongTien: tongTien,
          ChiTietSanPham: savedDetails,
        },
      };
    } catch (error) {
      // Rollback giao dịch khi có lỗi
      await transaction.rollback();
      throw new Error("Lỗi khi tạo phiếu mua hàng: " + error.message);
    }
  }

  static async getAllPurchases() {
    const purchases = await PurchaseOrder.findAll();

    return purchases.map((purchase) => ({
      SoPhieu: purchase.SoPhieu,
      NgayLap: purchase.NgayLap,
      MaNCC: purchase.MaNCC,
      TongTien: purchase.TongTien,
    }));
  }

  static async getPurchaseDetails(soPhieu) {
    const purchaseDetails = await PurchaseDetail.findAll({
      where: { SoPhieu: soPhieu },
      include: [
        {
          model: Product,
          attributes: ['MaLoaiSanPham'],
          include: [
            {
              model: ProductCategory,
              attributes: ['TenLoaiSanPham']
            }
          ]
        }
      ]
    });

    return purchaseDetails.map(detail => ({
      MaChiTietMH: detail.MaChiTietMH,
      SoPhieu: detail.SoPhieu,
      MaSanPham: detail.MaSanPham,
      SoLuong: detail.SoLuong,
      DonGia: detail.DonGia,
      ThanhTien: detail.ThanhTien,
      MaLoaiSanPham: detail.Product.MaLoaiSanPham,
      TenLoaiSanPham: detail.Product.ProductCategory.TenLoaiSanPham
    }));
  }

  // static async updatePurchase(soPhieu, updatedData) {
  //   const transaction = await PurchaseOrder.sequelize.transaction();

  //   try {
  //     const { NgayLap, MaNCC, ChiTietSanPham } = updatedData;

  //     // Kiểm tra nếu ChiTietSanPham không phải là mảng
  //     if (!Array.isArray(ChiTietSanPham)) {
  //       throw new Error("Dữ liệu ChiTietSanPham phải là một mảng");
  //     }

  //     // Tìm phiếu mua hàng
  //     const purchaseOrder = await PurchaseOrder.findByPk(soPhieu);
  //     if (!purchaseOrder) {
  //       throw new Error("Phiếu mua hàng không tồn tại");
  //     }

  //     // Cập nhật phiếu mua hàng
  //     await purchaseOrder.update(
  //       {
  //         NgayLap: NgayLap || purchaseOrder.NgayLap,
  //         MaNCC: MaNCC || purchaseOrder.MaNCC,
  //       },
  //       { transaction }
  //     );

  //     // Xóa các chi tiết cũ
  //     await PurchaseDetail.destroy({
  //       where: { SoPhieu: soPhieu },
  //       transaction,
  //     });

  //     // Lưu các chi tiết mới
  //     const updatedDetails = [];
  //     for (const product of ChiTietSanPham) {
  //       const detail = await PurchaseDetail.create(
  //         {
  //           MaChiTietMH: `${soPhieu}_${product.MaSanPham}`,
  //           SoPhieu: soPhieu,
  //           MaSanPham: product.MaSanPham,
  //           SoLuong: product.SoLuong,
  //           DonGia: parseFloat(product.DonGia), // Chuyển đổi DonGia thành số thực
  //           ThanhTien: parseFloat(product.ThanhTien), // Chuyển đổi ThanhTien thành số thực
  //         },
  //         { transaction }
  //       );
  //       updatedDetails.push(detail);
  //     }

  //     await transaction.commit();

  //     // Trả về dữ liệu được cập nhật
  //     return {
  //       message: "Cập nhật phiếu mua hàng thành công",
  //       purchaseOrder: {
  //         SoPhieu: soPhieu,
  //         NgayLap: NgayLap || purchaseOrder.NgayLap,
  //         MaNCC: MaNCC || purchaseOrder.MaNCC,
  //         ChiTietSanPham: updatedDetails,
  //       },
  //     };
  //   } catch (error) {
  //     await transaction.rollback();
  //     throw new Error(`Lỗi khi cập nhật phiếu mua hàng: ${error.message}`);
  //   }
  // }

  // Chưa test thử, mới chỉ code
  static async updatePurchase(soPhieu, { updatedDetails, addDetails, deleteDetails }) {
    const transaction = await PurchaseOrder.sequelize.transaction();

    try {
      // Tìm phiếu mua hàng
      const purchaseOrder = await PurchaseOrder.findByPk(soPhieu);
      if (!purchaseOrder) {
        throw new Error("Phiếu mua hàng không tồn tại");
      }

      // Kiểm tra ngày tạo phiếu mua hàng
      const currentDate = new Date();
      const orderDate = new Date(purchaseOrder.NgayLap);
      const timeDiff = Math.abs(currentDate - orderDate);
      const dayDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)); // Chuyển đổi sang số ngày

      if (dayDiff > 2) {
        if (addDetails && addDetails.length > 0) {
          throw new Error("Không thể thêm chi tiết sau 2 ngày kể từ ngày tạo phiếu mua hàng.");
        }

        if (deleteDetails && deleteDetails.length > 0) {
          throw new Error("Không thể xóa chi tiết sau 2 ngày kể từ ngày tạo phiếu mua hàng.");
        }
      }

      // Cập nhật thông tin phiếu mua hàng
      if (updatedDetails) {
        const { NgayLap, MaNCC } = updatedDetails;
        await purchaseOrder.update({
          NgayLap: NgayLap || purchaseOrder.NgayLap,
          MaNCC: MaNCC || purchaseOrder.MaNCC,
        }, { transaction });
      }

      // Thêm chi tiết phiếu mua hàng mới
      if (addDetails && addDetails.length > 0) {
        for (const product of addDetails) {
          const detail = await PurchaseDetail.create({
            MaChiTietMH: `${soPhieu}_${product.MaSanPham}`,
            SoPhieu: soPhieu,
            MaSanPham: product.MaSanPham,
            SoLuong: product.SoLuong,
            DonGia: product.DonGia,
            ThanhTien: product.ThanhTien,
          }, { transaction });

          const currentProduct = await Product.findOne({
            where: { MaSanPham: product.MaSanPham },
            transaction,
          });

          if (!currentProduct) {
            throw new Error(`Không tìm thấy sản phẩm có mã ${product.MaSanPham}`);
          }

          const productType = await ProductCategory.findOne({
            where: { MaLoaiSanPham: currentProduct.MaLoaiSanPham },
            transaction,
          });

          if (!productType) {
            throw new Error(`Không tìm thấy loại sản phẩm cho mã ${currentProduct.MaLoaiSanPham}`);
          }

          const updatedQuantity = currentProduct.SoLuong + product.SoLuong;

          await Product.update({
            SoLuong: updatedQuantity,
            DonGia: updatedPrice,
          }, {
            where: { MaSanPham: product.MaSanPham },
            transaction,
          });
        }
      }

      // Xóa chi tiết phiếu mua hàng
      if (deleteDetails && deleteDetails.length > 0) {
        for (const detail of deleteDetails) {
          const { MaChiTietMH, MaSanPham, SoLuong } = detail;
          await PurchaseDetail.update({
            SoLuong: 0,
            DonGia: 0,
            ThanhTien: 0,
          }, {
            where: { MaChiTietMH, SoPhieu: soPhieu },
            transaction,
          });

          const currentProduct = await Product.findOne({
            where: { MaSanPham: MaSanPham },
            transaction,
          });

          if (currentProduct) {
            const updatedQuantity = currentProduct.SoLuong - SoLuong;
            await Product.update({
              SoLuong: updatedQuantity,
            }, {
              where: { MaSanPham: MaSanPham },
              transaction,
            });
          }
        }
      }

      await transaction.commit();
      return { message: "Cập nhật phiếu mua hàng thành công" };
    } catch (error) {
      await transaction.rollback();
      throw new Error(`Lỗi khi cập nhật phiếu mua hàng: ${error.message}`);
    }
  }

  static async deletePurchase(soPhieu) {
    const transaction = await PurchaseOrder.sequelize.transaction();

    try {
      // Xóa chi tiết phiếu mua hàng
      await PurchaseDetail.destroy({
        where: { SoPhieu: soPhieu },
        transaction,
      });

      // Xóa phiếu mua hàng
      const result = await PurchaseOrder.destroy({
        where: { SoPhieu: soPhieu },
        transaction,
      });

      await transaction.commit();

      if (result > 0) {
        return { message: "Xóa phiếu mua hàng thành công", soPhieu };
      } else {
        throw new Error("Phiếu mua hàng không tồn tại");
      }
    } catch (error) {
      await transaction.rollback();
      throw new Error("Lỗi khi xóa phiếu mua hàng: " + error.message);
    }
  }
}

module.exports = PurchaseService;
