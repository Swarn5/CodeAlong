const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Checkpoint = require('../models/checkpointModel');
const { emitSocketEvent } = require('../scoket/socket');
const Playground = require('../models/playgroundModel');
const { check } = require('express-validator');

exports.createCheckpoint = asyncHandler(async (req, res) => {
    const { playgroundId, code, name } = req.body;
    const createdBy = req.userId;
    const createdAt = new Date().toISOString();

    const playground = await Playground.findById(playgroundId);

    if (!playground) {
        throw new NewError('Playground not found', 404, { playgroundNotFound: true });
    }

    const roomId = playground.roomId;

    const checkpoint = new Checkpoint({
        name,
        playgroundId,
        createdBy,
        code,
        createdAt,
        language: playground.language
    });
    await checkpoint.save();

    emitSocketEvent(req, "checkpointCreated", {
        username: req.username, userId: req.userId,
        checkpoint: {
            name,
            code,
            createdAt,
            createdBy: {
                _id: req.userId,
                username: req.username
            }
        }
    }, roomId);

    res.status(200).json({
        status: 'success',
        message: 'Checkpoint created successfully',
        data: {
            checkpoint
        }
    });
});

exports.getCheckpoints = asyncHandler(async (req, res) => {
    const { playgroundId } = req.query;

    const checkpoints = await Checkpoint.find({ playgroundId }).populate('createdBy', 'username').sort({ createdAt: -1 });

    res.status(200).json({
        status: 'success',
        message: 'Checkpoints fetched successfully',
        data: {
            checkpoints
        }
    });
});

exports.deleteCheckpoint = asyncHandler(async (req, res) => {
    const { checkpointId } = req.body;

    await Checkpoint.findByIdAndDelete(checkpointId);

    res.status(200).json({
        status: 'success',
        message: 'Checkpoint deleted successfully'
    });
});