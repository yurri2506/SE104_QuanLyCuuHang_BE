const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const ProductCategory = require('./productCategory');

const Product = sequelize.define('SANPHAM', {
    MaSanPham: {
        type: DataTypes.STRING(50),
        primaryKey: true
    },
    TenSanPham: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    MaLoaiSanPham: {
        type: DataTypes.STRING(50),
        allowNull: false,
        references: {
            model: 'LOAISANPHAM',
            key: 'MaLoaiSanPham'
        }
    },
    DonGia: {
        type: DataTypes.DECIMAL(18, 2),
        allowNull: false
    },
    SoLuong: {
        type: DataTypes.INTEGER,
        allowNull: false 
    }
}, {
    tableName: 'SANPHAM',
    timestamps: false
});

// Define relationship
Product.belongsTo(ProductCategory, {
    foreignKey: 'MaLoaiSanPham',
    as: 'category'
});

ProductCategory.hasMany(Product, {
    foreignKey: 'MaLoaiSanPham',
    as: 'products'
});

module.exports = Product;