const mongoose = require('mongoose');

//CodePlayground Checkpoint schema
const checkpointSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    playgroundId: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Playground',
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User',
        required: true
    },
    code: {
        type: String,
        required: true
    },
    createdAt: {
        type: String,
        required: true
    },
    language: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Checkpoint', checkpointSchema);