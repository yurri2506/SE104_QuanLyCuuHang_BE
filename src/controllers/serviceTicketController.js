
const ServiceTicketService = require('../services/serviceTicketService');

const createServiceTicket = async (req, res) => {
    try {
        const { ticketData, details } = req.body;
        const ticket = await ServiceTicketService.createServiceTicket(ticketData, details);
        return res.status(201).json(ticket);
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

const getAllServiceTickets = async (req, res) => {
    try {
        const tickets = await ServiceTicketService.getAllServiceTickets();
        return res.status(200).json(tickets);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const getServiceTicketById = async (req, res) => {
    try {
        const ticket = await ServiceTicketService.getServiceTicketById(req.params.id);
        if (!ticket) return res.status(404).json({ message: 'Service ticket not found' });
        return res.status(200).json(ticket);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createServiceTicket,
    getAllServiceTickets,
    getServiceTicketById
};