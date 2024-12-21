// services/warehouseManageService.js
const WarehouseManage = require('../models/warehouse.model');
const Product = require('../models/product.model');
const Category = require('../models/category.model');
const Unit = require('../models/unit.model');

const getAllReports = async () => {
  return await WarehouseManage.findAll();
};

const getReportByMonthAndProduct = async (thang, maSanPham) => {
  return await WarehouseManage.findOne({ where: { Thang: thang, MaSanPham: maSanPham } });
};

const createReport = async (data) => {
  const product = await Product.findOne({ where: { MaSanPham: data.MaSanPham } });
  if (!product) throw new Error('Product not found');

  const Category = await Category.findOne({ where: { MaLoaiSanPham: product.MaLoaiSanPham } });
  if (!Category) throw new Error('Category not found');

  const unit = await Unit.findOne({ where: { MaDonViTinh: Category.MaDonViTinh } });
  if (!unit) throw new Error('Unit not found');

  data.DonViTinh = unit.TenDonViTinh;
  return await WarehouseManage.create(data);
};

const updateReport = async (thang, maSanPham, data) => {
  const product = await Product.findOne({ where: { MaSanPham: data.MaSanPham } });
  if (!product) throw new Error('Product not found');

  const Category = await Category.findOne({ where: { MaLoaiSanPham: product.MaLoaiSanPham } });
  if (!Category) throw new Error('Category not found');

  const unit = await Unit.findOne({ where: { MaDonViTinh: Category.MaDonViTinh } });
  if (!unit) throw new Error('Unit not found');

  data.DonViTinh = unit.TenDonViTinh;
  return await WarehouseManage.update(data, { where: { Thang: thang, MaSanPham: maSanPham } });
};

const deleteReport = async (thang, maSanPham) => {
  return await WarehouseManage.destroy({ where: { Thang: thang, MaSanPham: maSanPham } });
};

module.exports = {
  getAllReports,
  getReportByMonthAndProduct,
  createReport,
  updateReport,
  deleteReport,
};