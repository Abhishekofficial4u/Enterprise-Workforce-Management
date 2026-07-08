const Document = require('./document.model');
const Employee = require('./employee.model');

// @desc    Get all documents for an employee
// @route   GET /api/v1/hr/employees/:employeeId/documents
// @access  Private
exports.getDocumentsByEmployee = async (req, res) => {
    try {
        const documents = await Document.find({ 
            employeeId: req.params.employeeId,
            status: 'Active'
        }).populate('uploadedBy', 'name');
        
        res.status(200).json({ success: true, count: documents.length, data: documents });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Add a document
// @route   POST /api/v1/hr/employees/:employeeId/documents
// @access  Private
exports.addDocument = async (req, res) => {
    try {
        const { title, type, url } = req.body;
        
        let finalUrl = url;
        // If a file was uploaded, construct local url
        if (req.file) {
            finalUrl = `http://localhost:5000/uploads/${req.file.filename}`;
        }
        
        const document = await Document.create({
            employeeId: req.params.employeeId,
            title,
            type,
            url: finalUrl,
            uploadedBy: req.user.id
        });
        
        res.status(201).json({ success: true, data: document });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete (Archive) a document
// @route   DELETE /api/v1/hr/documents/:id
// @access  Private
exports.deleteDocument = async (req, res) => {
    try {
        const document = await Document.findById(req.params.id);
        
        if (!document) {
            return res.status(404).json({ success: false, message: 'Document not found' });
        }
        
        document.status = 'Archived';
        await document.save();
        
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
