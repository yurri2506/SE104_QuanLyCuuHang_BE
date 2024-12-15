
const ServiceTicket = require('../models/serviceTicket');
const ServiceTicketDetail = require('../models/serviceTicketDetail');

class ServiceTicketService {
    static async createServiceTicket(ticketData, details) {
        const serviceTicket = await ServiceTicket.create(ticketData);
        if (details && details.length > 0) {
            for (let detail of details) {
                detail.SoPhieuDV = serviceTicket.SoPhieuDV;
                await ServiceTicketDetail.create(detail);
            }
        }
        return serviceTicket;
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

    static async updateServiceTicket(id, updateData) {
        const [updated] = await ServiceTicket.update(updateData, {
            where: { SoPhieuDV: id }
        });
        if (!updated) throw new Error('Service ticket not found');
        return await ServiceTicket.findByPk(id);
    }
}

module.exports = ServiceTicketService;