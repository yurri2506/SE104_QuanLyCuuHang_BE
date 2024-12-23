const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ServiceTicket = sequelize.define('PHIEUDICHVU', {
    SoPhieuDV: {
        type: DataTypes.STRING(50),
        primaryKey: true
    },
    NgayLap: {
        type: DataTypes.DATE,
        allowNull: false
    },
    MaKhachHang: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    TongTien: {
        type: DataTypes.DECIMAL(18, 2),
        allowNull: false
    },
    TongTienTraTruoc: {
        type: DataTypes.DECIMAL(18, 2),
        allowNull: false
    }
}, {
    tableName: 'PHIEUDICHVU',
    timestamps: false
});

module.exports = ServiceTicket;