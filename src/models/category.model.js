const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const ProductCategory = sequelize.define(
  "LOAISANPHAM",
  {
    MaLoaiSanPham: {
      type: DataTypes.STRING(50),
      primaryKey: true,
    },
    TenLoaiSanPham: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    MaDVTinh: {
      type: DataTypes.STRING(50),
      allowNull: false,
      references: {
        model: "DONVITINH",
        key: "MaDVTinh",
      },
    },
    PhanTramLoiNhuan: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
    },
    ParentID: {
      type: DataTypes.STRING(50),
      allowNull: true, // Cho phép null vì các danh mục cấp 1 không có cha
      references: {
        model: "LOAISANPHAM",
        key: "MaLoaiSanPham",
      },
    },
  },
  {
    tableName: "LOAISANPHAM",
    timestamps: false,
  }
);

// Tự tham chiếu để thiết lập quan hệ cha - con
ProductCategory.hasMany(ProductCategory, {
  as: "subcategories", // Danh mục con
  foreignKey: "ParentID",
  onDelete: 'CASCADE',
});

ProductCategory.belongsTo(ProductCategory, {
  as: "parent", // Danh mục cha
  foreignKey: "ParentID",
});

module.exports = ProductCategory;
