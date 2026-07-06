const Ticket = require('./ticket.model');

// @desc    Create a new ticket
// @route   POST /api/v1/helpdesk
// @access  Private
exports.createTicket = async (req, res) => {
    try {
        const { subject, description, category, priority } = req.body;
        const employeeId = req.user.employeeId;

        if (!employeeId) {
            return res.status(403).json({ success: false, message: 'You must have a linked employee profile to create a ticket.' });
        }

        const ticket = await Ticket.create({
            employeeId,
            subject,
            description,
            category,
            priority
        });

        res.status(201).json({ success: true, data: ticket });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get tickets for logged-in user
// @route   GET /api/v1/helpdesk/my
// @access  Private
exports.getMyTickets = async (req, res) => {
    try {
        const employeeId = req.user.employeeId;
        if (!employeeId) {
            return res.status(400).json({ success: false, message: 'No linked employee profile' });
        }

        const tickets = await Ticket.find({ employeeId })
            .populate('assignedTo', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: tickets.length, data: tickets });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all tickets (for Admins)
// @route   GET /api/v1/helpdesk
// @access  Private (SUPER_ADMIN, IT_ADMIN, HR_MANAGER)
exports.getAllTickets = async (req, res) => {
    try {
        const tickets = await Ticket.find()
            .populate('employeeId', 'name department designation profilePhoto')
            .populate('assignedTo', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: tickets.length, data: tickets });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update ticket status / assignment
// @route   PUT /api/v1/helpdesk/:id
// @access  Private (SUPER_ADMIN, IT_ADMIN, HR_MANAGER)
exports.updateTicket = async (req, res) => {
    try {
        const { status, assignedTo, priority } = req.body;

        const ticket = await Ticket.findById(req.params.id);
        if (!ticket) {
            return res.status(404).json({ success: false, message: 'Ticket not found' });
        }

        if (status) ticket.status = status;
        if (assignedTo) ticket.assignedTo = assignedTo;
        if (priority) ticket.priority = priority;

        await ticket.save();

        res.status(200).json({ success: true, data: ticket });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Add a response to a ticket
// @route   POST /api/v1/helpdesk/:id/respond
// @access  Private
exports.addResponse = async (req, res) => {
    try {
        const { message } = req.body;
        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({ success: false, message: 'Ticket not found' });
        }

        // Add response
        ticket.responses.push({
            sender: req.user.id,
            message
        });

        await ticket.save();
        
        // Populate sender info for the frontend to display immediately
        await ticket.populate('responses.sender', 'name email');

        res.status(200).json({ success: true, data: ticket });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
