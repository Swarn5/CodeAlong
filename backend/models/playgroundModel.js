const mongoose = require('mongoose');

//CodePlayground Schema
const playgroundSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    code: {
        type: String,
    },
    language: {
        type: String,
        required: true
    },
    participatedUsers: [
        {
            type: mongoose.Schema.Types.ObjectId, ref: 'User' 
        }
    ],
    input: {
        type: String,
        required: false
    },
    roomId: {
        type: String,
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User'
    },
    createdAt: {
        type: String,
        required: true,
    },
    isActive: {
        type: Boolean,
    },
    activeUsers: [
        {
            type: mongoose.Schema.Types.ObjectId, ref: 'User'
        }
    ]
});

playgroundSchema.methods.addParticipatedUser = async function (userId) {
    if (!this.participatedUsers.includes(userId)) {
        this.participatedUsers.push(userId);
        return this.save();
    }
};

module.exports = mongoose.model('Playground', playgroundSchema);
