const { v4: uuidv4 } = require('uuid');
const ServiceTicket = require('../models/serviceTicket.model');
const ServiceTicketDetail = require('../models/serviceTicketDetail.model');

class ServiceTicketService {
    static async createServiceTicket(ticketData, details) {
        try {
            // Generate UUID for SoPhieuDV
            const ticketWithId = {
                ...ticketData,
                SoPhieuDV: `DV${uuidv4().substring(0, 8)}` // Creates ID like "DV12345678"
            };

            const ticket = await ServiceTicket.create({
                SoPhieuDV: ticketWithId.SoPhieuDV,
                NgayLap: ticketData.NgayLap,
                MaKhachHang: ticketData.MaKhachHang,
                TongTien: ticketData.TongTien,
                TongTienTraTruoc: ticketData.TongTienTraTruoc
            });
            
            // Create details with the ticket's SoPhieuDV
            if (details && details.length > 0) {
                const detailsWithIds = details.map(detail => ({
                    ...detail,
                    MaChiTietDV: `CTDV${uuidv4().substring(0, 8)}`, // Creates ID like "CTDV12345678"
                    SoPhieuDV: ticket.SoPhieuDV
                }));
                
                await ServiceTicketDetail.bulkCreate(detailsWithIds);
            }
            
            // Return created ticket with details 
            return await ServiceTicket.findByPk(ticket.SoPhieuDV, {
                include: [{
                    model: ServiceTicketDetail, 
                    as: 'details'
                }]
            });
        } catch (error) {
            if (error.name === 'SequelizeValidationError') {
                console.error('Validation Errors:', error.errors.map(err => err.message));
            } else {
                console.error('Error:', error);
            }
            throw error;
        }
    }

    static async getAllServiceTickets() {
        return await ServiceTicket.findAll({
            include: [{
                model: ServiceTicketDetail,
                as: 'details'
            }]
        });
    }

    static async getServiceTicketById(id) {
        return await ServiceTicket.findByPk(id, {
            include: [{
                model: ServiceTicketDetail,
                as: 'details'
            }]
        });
    }

    static async updateServiceTicket(id, { ticketData, details }) {
        try {
            // Update service ticket if ticketData is provided
            if (ticketData) {
                const [updated] = await ServiceTicket.update(ticketData, {
                    where: { SoPhieuDV: id }
                });
                if (!updated) throw new Error('Service ticket not found');
            }

            // Update details if details array is provided
            if (details && details.length > 0) {
                // Delete existing details first
                await ServiceTicketDetail.destroy({
                    where: { SoPhieuDV: id }
                });

                // Create new details
                const detailsWithTicket = details.map(detail => ({
                    ...detail,
                    SoPhieuDV: id
                }));
                await ServiceTicketDetail.bulkCreate(detailsWithTicket);
            }

            // Return updated ticket with details
            return await ServiceTicket.findByPk(id, {
                include: [{
                    model: ServiceTicketDetail,
                    as: 'details'
                }]
            });
        } catch (error) {
            throw error;
        }
    }

    static async deleteServiceTicket(id) {
        try {
            // Delete related service ticket details first
            await ServiceTicketDetail.destroy({
                where: { SoPhieuDV: id }
            });

            // Then delete the main service ticket
            const deleted = await ServiceTicket.destroy({
                where: { SoPhieuDV: id }
            });

            if (!deleted) {
                throw new Error('Service ticket not found');
            }

            return { message: 'Service ticket deleted successfully' };
        } catch (error) {
            throw error; 
        }
    }
}

module.exports = ServiceTicketService;