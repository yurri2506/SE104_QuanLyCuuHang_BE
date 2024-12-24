const { v4: uuidv4 } = require('uuid');
const SaleInvoice = require('../models/saleInvoice.model');
const SaleInvoiceDetail = require('../models/saleInvoiceDetail.model');

class SaleInvoiceService {
    static async createSaleInvoice(invoiceData, details) {
        try {
            // Generate UUID for SoPhieuBH
            const invoiceWithId = {
                ...invoiceData,
                SoPhieuBH: `BH${uuidv4().substring(0, 8)}` // Creates ID like "BH12345678"
            };

            // Create sale invoice
            const invoice = await SaleInvoice.create(invoiceWithId);
            
            // Create details with generated IDs and invoice's SoPhieuBH
            if (details && details.length > 0) {
                const detailsWithIds = details.map(detail => ({
                    ...detail,
                    MaChiTietBH: `CTBH${uuidv4().substring(0, 8)}`, // Creates ID like "CTBH12345678"
                    SoPhieuBH: invoice.SoPhieuBH
                }));
                
                await SaleInvoiceDetail.bulkCreate(detailsWithIds);
            }
            
            // Return created invoice with details
            return await SaleInvoice.findByPk(invoice.SoPhieuBH, {  // Changed from SoPhieu to SoPhieuBH
                include: [{
                    model: SaleInvoiceDetail,
                    as: 'details'
                }]
            });
        } catch (error) {
            throw error;
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

    static async updateSaleInvoice(id, { invoiceData, details }) {
        try {
            // Update invoice if invoiceData is provided
            if (invoiceData) {
                const [updated] = await SaleInvoice.update(invoiceData, {
                    where: { SoPhieuBH: id }
                });
                if (!updated) throw new Error('Sale invoice not found');
            }

            // Update details if details array is provided
            if (details && details.length > 0) {
                // Delete existing details first
                await SaleInvoiceDetail.destroy({
                    where: { SoPhieuBH: id }
                });

                // Create new details
                const detailsWithInvoice = details.map(detail => ({
                    ...detail,
                    SoPhieuBH: id
                }));
                await SaleInvoiceDetail.bulkCreate(detailsWithInvoice);
            }

            // Return updated invoice with details
            return await SaleInvoice.findByPk(id, {
                include: [{
                    model: SaleInvoiceDetail,
                    as: 'details'
                }]
            });
        } catch (error) {
            throw error;
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