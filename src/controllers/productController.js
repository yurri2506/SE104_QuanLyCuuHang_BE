const productService = require("../services/productService");

class ProductController {
  // Lấy tất cả sản phẩm
  async getAllProducts(req, res) {
    try {
      const products = await productService.getAllProducts();
      res.status(200).json(products);
    } catch (error) {
      res.status(500).json({ error: "Đã xảy ra lỗi khi lấy danh sách sản phẩm." });
    }
  }

  // Lấy sản phẩm theo ID
  async getProductById(req, res) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ error: "ID sản phẩm không được để trống." });
      }

      const product = await productService.getProductById(id);
      if (!product) {
        return res.status(404).json({ error: "Không tìm thấy sản phẩm với mã này." });
      }

      res.status(200).json(product);
    } catch (error) {
      res.status(500).json({ error: "Đã xảy ra lỗi khi lấy sản phẩm." });
    }
  }

  // Tạo sản phẩm mới
  async createProduct(req, res) {
    try {
      const productData = req.body;

      if (!productData || Object.keys(productData).length === 0) {
        return res
          .status(400)
          .json({ error: "Dữ liệu sản phẩm không được để trống." });
      }

      const newProduct = await productService.createProduct(productData);
      res.status(201).json({
        message: "Sản phẩm đã được tạo thành công.",
        product: newProduct,
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Cập nhật sản phẩm
  async updateProduct(req, res) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ error: "ID sản phẩm không được để trống." });
      }

      const productData = req.body;
      if (!productData || Object.keys(productData).length === 0) {
        return res.status(400).json({ error: "Dữ liệu cập nhật không được để trống." });
      }

      const updatedProduct = await productService.updateProduct(id, productData);
      res.status(200).json({
        message: "Sản phẩm đã được cập nhật thành công.",
        product: updatedProduct,
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Xóa sản phẩm
  async deleteProduct(req, res) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ error: "ID sản phẩm không được để trống." });
      }

      const result = await productService.deleteProduct(id);
      res.status(200).json({
        message: "Sản phẩm đã được xóa thành công.",
        result,
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Update isDelete field for a product
  async softDeleteProduct(req, res) {
    try {
      const { id } = req.params;
      const { isDelete } = req.body;

      if (typeof isDelete !== 'boolean') {
        return res.status(400).json({ error: "isDelete must be a boolean value." });
      }

      const product = await productService.updateProduct(id, { isDelete });
      res.status(200).json({
        message: "Product soft delete status updated successfully.",
        product,
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new ProductController();