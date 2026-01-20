const mongoose = require('mongoose');
const schema = mongoose.Schema;


const adminSchema = new mongoose.Schema({
    snippets: {
        type: String,
        trim: true,
    }, 
    img: {
        type: String,
        trim: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('AdminSchema', adminSchema);