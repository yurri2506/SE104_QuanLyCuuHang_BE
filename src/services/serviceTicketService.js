const { v4: uuidv4 } = require('uuid');
const ServiceTicket = require('../models/serviceTicket.model');
const ServiceTicketDetail = require('../models/serviceTicketDetail.model');

class ServiceTicketService {
    static async createServiceTicket(ticketData, details) {
        try {
            // Validate ticket status
            if (ticketData.TinhTrang && !['Đã giao', 'Chưa giao'].includes(ticketData.TinhTrang)) {
                throw new Error('Tình trạng chỉ có thể là "Đã giao" hoặc "Chưa giao"');
            }

            // Create the service ticket with auto-generated ID if not provided
            const ticket = await ServiceTicket.create({
                SoPhieuDV: ticketData.SoPhieuDV || `DV${uuidv4().substring(0, 8)}`,
                NgayLap: ticketData.NgayLap,
                MaKhachHang: ticketData.MaKhachHang,
                TongTien: ticketData.TongTien,
                TongTienTraTruoc: ticketData.TongTienTraTruoc,
                TinhTrang: ticketData.TinhTrang || 'Chưa giao'
            });
            
            // Create details with validation
            if (details && details.length > 0) {
                const detailsWithIds = details.map(detail => {
                    // Calculate final price including special costs
                    const finalPrice = detail.DonGiaDuocTinh + (detail.ChiPhiRieng || 0);
                    
                    // Calculate total amount
                    const thanhTien = detail.SoLuong * finalPrice;
                    
                    // Validate minimum prepayment (50% rule)
                    const minPrepayment = thanhTien * 0.5;
                    const traTruoc = detail.TraTruoc || 0; // Default to 0 if not provided
                    if (traTruoc < minPrepayment) {
                        throw new Error(`Số tiền trả trước phải >= 50% thành tiền (${minPrepayment})`);
                    }

                    return {
                        MaChiTietDV: detail.MaChiTietDV || `CTDV${uuidv4().substring(0, 8)}`,
                        SoPhieuDV: ticket.SoPhieuDV,
                        MaLoaiDichVu: detail.MaLoaiDichVu,
                        SoLuong: detail.SoLuong,
                        DonGiaDuocTinh: finalPrice,
                        ThanhTien: thanhTien,
                        TraTruoc: traTruoc,
                        ConLai: thanhTien - traTruoc,
                        NgayGiao: detail.NgayGiao || null,
                        TinhTrang: detail.TinhTrang || 'Chưa giao',
                        ChiPhiRieng: detail.ChiPhiRieng || 0
                    };
                });
                
                await ServiceTicketDetail.bulkCreate(detailsWithIds);

                // Recalculate total with special costs
                const totalWithAllCosts = detailsWithIds.reduce((sum, detail) => 
                    sum + detail.ThanhTien, 0
                );

                // Update ticket with final total
                await ticket.update({ TongTien: totalWithAllCosts });
            }
            
            // Return complete ticket with details
            return await ServiceTicket.findByPk(ticket.SoPhieuDV, {
                include: [{ model: ServiceTicketDetail, as: 'details' }]
            });

        } catch (error) {
            throw new Error(`Lỗi tạo phiếu dịch vụ: ${error.message}`);
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
}

module.exports = ServiceTicketService;