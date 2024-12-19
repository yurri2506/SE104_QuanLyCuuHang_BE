
const Customer = require('../models/customer');

class CustomerService {
    static async createCustomer(customerData) {
        const customer = await Customer.create(customerData);
        return customer;
    }

    static async updateCustomer(id, customerData) {
        const [updated] = await Customer.update(customerData, {
            where: { MaKhachHang: id }
        });
        if (!updated) throw new Error('Customer not found');
        return await Customer.findByPk(id);
    }

    static async deleteCustomer(id) {
        const deleted = await Customer.destroy({
            where: { MaKhachHang: id }
        });
        if (!deleted) throw new Error('Customer not found');
        return deleted;
    }

    static async getAllCustomers() {
        return await Customer.findAll();
    }

    static async getCustomerById(id) {
        const customer = await Customer.findByPk(id);
        if (!customer) throw new Error('Customer not found');
        return customer;
    }
}

module.exports = CustomerService;