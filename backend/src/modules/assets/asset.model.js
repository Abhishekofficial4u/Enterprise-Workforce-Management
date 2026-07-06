const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
    assetTag: {
        type: String,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['Hardware', 'Software', 'Accessory'],
        default: 'Hardware'
    },
    status: {
        type: String,
        enum: ['Available', 'Assigned', 'Under Maintenance', 'Retired'],
        default: 'Available'
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        default: null
    },
    purchaseDate: {
        type: Date
    },
    cost: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

// Pre-save hook to generate an asset tag if not provided
assetSchema.pre('save', async function() {
    if (this.isNew && !this.assetTag) {
        const count = await this.constructor.countDocuments();
        this.assetTag = `AST-${1000 + count}`;
    }
});

module.exports = mongoose.model('Asset', assetSchema);
