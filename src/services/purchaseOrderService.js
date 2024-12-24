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

        // Cập nhật đơn giá = Đơn giá chi tiết * (1 + Phần trăm lợi nhuận)
        const updatedPrice = product.donGia * (1 + productType.PhanTramLoiNhuan / 100);

        await Product.update(
          { 
            SoLuong: updatedQuantity,
            DonGia: updatedPrice
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
    const purchases = await PurchaseOrder.findAll({
      include: {
        model: PurchaseDetail,
        as: "ChiTietSanPham", // Alias đã định nghĩa
      },
    });

    // Format dữ liệu cho frontend
    return purchases.map((purchase) => ({
      SoPhieu: purchase.SoPhieu,
      NgayLap: purchase.NgayLap,
      MaNCC: purchase.MaNCC,
      TongTien: purchase.TongTien,
      ChiTietSanPham: purchase.CHITIETPHIEUMUAHANGs, // Tự động join qua include
    }));
  }

  static async getPurchaseDetails(soPhieu) {
    const purchase = await PurchaseOrder.findOne({
      where: { SoPhieu: soPhieu },
      include: [
        {
          model: PurchaseDetail,
          as: "ChiTietSanPham", // Alias đã định nghĩa trong model
        },
        {
          model: Provider,
          as: "NhaCungCap", // Lấy thông tin nhà cung cấp
        },
      ],
    });

    if (!purchase) {
      throw new Error("Phiếu mua hàng không tồn tại");
    }

    // Chuẩn hóa dữ liệu chi tiết sản phẩm
    const chiTietSanPham = purchase.ChiTietSanPham.map((detail) => ({
      MaSanPham: detail.MaSanPham,
      SoLuong: detail.SoLuong,
      DonGia: detail.DonGia,
      ThanhTien: detail.ThanhTien,
    }));

    // Trả về dữ liệu được format
    return {
      SoPhieu: purchase.SoPhieu,
      NgayLap: purchase.NgayLap,
      NhaCungCap: {
        MaNCC: purchase.NhaCungCap.MaNCC,
        TenNCC: purchase.NhaCungCap.TenNCC,
        SoDienThoai: purchase.NhaCungCap.SoDienThoai,
        DiaChi: purchase.NhaCungCap.DiaChi,
      },
      TongTien: purchase.TongTien,
      ChiTietSanPham: chiTietSanPham,
    };
  }

  static async updatePurchase(soPhieu, updatedData) {
    const transaction = await PurchaseOrder.sequelize.transaction();

    try {
      const { NgayLap, MaNCC, ChiTietSanPham } = updatedData;

      // Kiểm tra nếu ChiTietSanPham không phải là mảng
      if (!Array.isArray(ChiTietSanPham)) {
        throw new Error("Dữ liệu ChiTietSanPham phải là một mảng");
      }

      // Tìm phiếu mua hàng
      const purchaseOrder = await PurchaseOrder.findByPk(soPhieu);
      if (!purchaseOrder) {
        throw new Error("Phiếu mua hàng không tồn tại");
      }

      // Cập nhật phiếu mua hàng
      await purchaseOrder.update(
        {
          NgayLap: NgayLap || purchaseOrder.NgayLap,
          MaNCC: MaNCC || purchaseOrder.MaNCC,
        },
        { transaction }
      );

      // Xóa các chi tiết cũ
      await PurchaseDetail.destroy({
        where: { SoPhieu: soPhieu },
        transaction,
      });

      // Lưu các chi tiết mới
      const updatedDetails = [];
      for (const product of ChiTietSanPham) {
        const detail = await PurchaseDetail.create(
          {
            MaChiTietMH: `${soPhieu}_${product.MaSanPham}`,
            SoPhieu: soPhieu,
            MaSanPham: product.MaSanPham,
            SoLuong: product.SoLuong,
            DonGia: parseFloat(product.DonGia), // Chuyển đổi DonGia thành số thực
            ThanhTien: parseFloat(product.ThanhTien), // Chuyển đổi ThanhTien thành số thực
          },
          { transaction }
        );
        updatedDetails.push(detail);
      }

      await transaction.commit();

      // Trả về dữ liệu được cập nhật
      return {
        message: "Cập nhật phiếu mua hàng thành công",
        purchaseOrder: {
          SoPhieu: soPhieu,
          NgayLap: NgayLap || purchaseOrder.NgayLap,
          MaNCC: MaNCC || purchaseOrder.MaNCC,
          ChiTietSanPham: updatedDetails,
        },
      };
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
