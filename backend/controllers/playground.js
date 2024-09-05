const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');

const Playground = require('../models/playgroundModel');
const User = require('../models/userModel');
const { validationResult } = require('express-validator');
const { capitalize } = require('../utils/functions');
const { emitSocketEvent } = require('../scoket/socket');
const NewError = require('../utils/NewError');
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();
const EXEC_PORT = process.env.EXECUTOR_URL;

exports.createPlayground = asyncHandler(async (req, res) => {
    // const validationErrors = validationResult(req);
    // console.log(validationErrors);
    // if (!validationErrors.isEmpty()) {
    //     console.log(validationErrors);
    // }

    const { name, code, language, input, roomId, createdAt } = req.body;
    const createdBy = req.userId;
    const user
        = await User.findById(createdBy);
    if (!user) {
        throw new NewError('User not found', 404, { userNotFound: true });
    }

    const room = await Playground.findOne({
        roomId,
    });

    if (room) {
        throw new NewError('Room Id is already taken', 400, { roomExists: true });
    }

    const newName = capitalize(name);

    const playground = new Playground({
        name: newName,
        code,
        language,
        input,
        roomId,
        createdBy,
        createdAt,
        isActive: true
    });
    await playground.save();

    res.status(200).json({
        status: 'success',
        message: 'Playground created successfully',
        data: {
            playground
        }
    });

}
);

exports.checkIfParticipated = asyncHandler(async (req, res) => {
    const { roomId } = req.query;
    const userId = req.userId;

    const playground = await Playground.findOne({ roomId });

    if (!playground) {
        throw new NewError('Room not found', 404, { roomNotFound: true });
    }

    

    if (playground.createdBy.toString() !== userId && !playground.participatedUsers.includes(userId)) {
        throw new NewError('You have not joined this room', 400, { notJoined: true });
    }



    if (playground.isActive !== true && playground.createdBy.toString() !== userId) {
        throw new NewError('Room is not active', 400, { roomNotActive: true });
    }

    if (!playground.activeUsers.includes(userId)) {
        playground.activeUsers.push(userId);
        await playground.save(); 
    }

    playground.isActive = true;

    await playground.save();

    const populatedPlayground = await Playground.findById(playground._id)
        .populate({
            path: 'participatedUsers',
            select: 'username'
        })
        .populate({
            path: 'activeUsers',
            select: 'username'
        });

    res.status(200).json({
        status: 'success',
        message: 'You have joined this room',
        data: {
            playground: populatedPlayground
        }
    });
});

exports.joinRequest = asyncHandler(async (req, res) => {
    const { roomId } = req.body;
    const userId = req.userId;

    const playground = await Playground.findOne({ roomId });
    if (!playground) {
        throw new NewError('Room not found', 404, { roomNotFound: true });
    }

    // console.log(playground);
    const owner = playground.createdBy.toString();
    const user = await User.findById(userId);
    const username = user.username;

    // console.log(owner);
    // console.log(userId);

    // console.log(playground.participatedUsers);

    if (playground.participatedUsers.includes(userId)) {
        throw new NewError('You have already joined this room', 400, { alreadyJoined: true });
    }

    if (owner === userId) {
        throw new NewError('You are the creator of this room', 400, { creator: true });
    }

    if (playground.isActive !== true) {
        throw new NewError('Room is not active', 400, { roomNotActive: true });
    }

    emitSocketEvent(req, 'wantsToJoin', { roomId, username, ownerId: owner, userId }, owner);

    res.status(200).json({
        status: 'success',
        message: 'Join request sent successfully',
    });

});

exports.kickUser = asyncHandler(async (req, res) => {
    const { roomId, userId } = req.body;

    const playground = await Playground.findOne({ roomId });

    if (!playground) {
        throw new NewError('Room not found', 404, { roomNotFound: true });
    }

    if (playground.createdBy.toString() !== req.userId) {
        throw new NewError('You are not the creator of this room', 400, { notCreator: true });
    }

    if (!playground.activeUsers.includes(userId)) {
        throw new NewError('User is not in this room', 400, { notInRoom: true });
    }

    const user = await User.findById(userId);
    if (!user) {
        throw new NewError('User not found', 404, { userNotFound: true });
    }
    const username = user.username;

    playground.activeUsers = playground.activeUsers.filter((user) => user.toString() !== userId);
    playground.participatedUsers = playground.participatedUsers.filter((user) => user.toString() !== userId);
    
    await playground.save();

    req.app.get('io').in(userId).socketsLeave(roomId);
    emitSocketEvent(req, 'kickedUser', { roomId, userId , username}, roomId);
    console.log("emitting");
    emitSocketEvent(req, 'kicked', { roomId }, userId);

    res.status(200).json({
        status: 'success',
        message: 'User kicked successfully',
    });

});



exports.approveJoinRequest = asyncHandler(async (req, res) => {
    const { roomId, userId } = req.body;
    const ownerId = req.userId;

    const playground = await Playground.findOne
        ({ roomId });
    // console.log(playground);
    if (!playground) {
        throw new NewError('Room not found', 404, { roomNotFound: true });
    }

    playground.participatedUsers.push(userId);

    await playground.save();

    console.log('Approving join request');
    emitSocketEvent(req, 'approveJoinRequest', { roomId, userId }, userId);

    res.status(200).json({
        status: 'success',
        message: 'Join request approved successfully',
    });

});

exports.rejectJoinRequest = asyncHandler(async (req, res) => {
    const { roomId, userId } = req.body;
    const ownerId = req.userId;

    emitSocketEvent(req, 'rejectJoinRequest', { roomId, userId }, userId);

    res.status(200).json({
        status: 'success',
        message: 'Join request rejected successfully',
    });

});


exports.getYourPlaygrounds = asyncHandler(async (req, res) => {
    const userId = req.userId;

    const playgrounds = await Playground.find({ createdBy: userId }).select('-participatedUsers -code -input');

    res.status(200).json({
        status: 'success',
        message: 'Your playgrounds fetched successfully',
        data: {
            playgrounds
        }
    });

}
);

exports.leavePlayground = asyncHandler(async (req, res) => {
    const { roomId } = req.body;
    const userId = req.userId;

    const playground = await Playground.findOne({ roomId });
    if (!playground) {
        throw new NewError('Room not found', 404, { roomNotFound: true });
    }

    if (playground.createdBy.toString() === userId) {
        emitSocketEvent(req, 'roomDeleted', { roomId }, roomId);
        req.app.get('io').in(roomId).socketsLeave(roomId);
        playground.isActive = false;
        playground.activeUsers = [];
        await playground.save();

        res.status(200).json({
            status: 'success',
            message: 'You have left this room',
        });
        return;
    }

    if (!playground.activeUsers.includes(userId)) {
        throw new NewError('You have not joined this room', 400, { notJoined: true });
    }

    playground.activeUsers = playground.activeUsers.filter((user) => user.toString() !== userId);

    await playground.save();

    res.status(200).json({
        status: 'success',
        message: 'You have left this room',
    });

});


exports.getJoinedPlaygrounds = asyncHandler(async (req, res) => {
    const userId = req.userId;

    // Find all the playgrounds where the user has joined

    const playgrounds = await Playground.find({ participatedUsers: userId })
        .select('-participatedUsers -code -input')
        .populate({
            path: 'createdBy',
            select: 'username' // Only include the username field
        });

    res.status(200).json({
        status: 'success',
        message: 'Your playgrounds fetched successfully',
        data: {
            playgrounds
        }
    });
});

exports.executeCode = asyncHandler(async (req, res) => {
    const { code, language, input, roomId } = req.body;
    // console.log(code, language, input);
    emitSocketEvent(req, 'executingCode', { input }, roomId);
    const responseFromServer = await axios.post(`${EXEC_PORT}/execute`, {
        code,
        language,
        input
    });

    emitSocketEvent(req, 'executedCode', { output: (responseFromServer.data.output || ""), error: (responseFromServer.data.error || "") }, roomId);

    if (responseFromServer.data.throwError) {
        throw new NewError(responseFromServer.data.msg, 400, { throwError: true });
    }

    res.status(200).json({
        data: responseFromServer.data
    });
}); 

exports.savePlayground = asyncHandler(async (req, res) => {
    const { code , playgroundId } = req.body;
    const playground = await Playground.findById(playgroundId);

    if (!playground) {
        throw new NewError('Playground not found', 404, { playgroundNotFound: true });
    }

    if(req.userId !== playground.createdBy.toString()){
        throw new NewError('You are not the creator of this playground', 400, { notCreator: true });
    }

    playground.code = code;
    await playground.save();

    res.status(200).json({
        status: 'success',
        message: 'Playground saved successfully',
    });
});


exports.deletePlayground = asyncHandler(async (req, res) => {
    const { playgroundId } = req.body;
    const playground = await Playground.findById(playgroundId);

    if (!playground) {
        throw new NewError('Playground not found', 404, { playgroundNotFound: true });
    }

    if(req.userId !== playground.createdBy.toString()){
        throw new NewError('You are not the creator of this playground', 400, { notCreator: true });
    }

    await Playground.findByIdAndDelete(playgroundId);

    res.status(200).json({
        status: 'success',
        message: 'Playground deleted successfully',
    });
});

exports.deleteParticipatedPlayground = asyncHandler(async (req, res) => {
    const { playgroundId } = req.body;
    const userId = req.userId;

    const playground = await Playground.findById(playgroundId);

    if (!playground) {
        throw new NewError('Playground not found', 404, { playgroundNotFound: true });
    }

    if(!playground.participatedUsers.includes(userId)){
        throw new NewError('You have not joined this playground', 400, { notJoined: true });
    }

    // playground.participatedUsers is the array of user ids who have joined the playground

    playground.participatedUsers = playground.participatedUsers.filter((user) => user.toString() !== userId);

    await playground.save();

    res.status(200).json({
        status: 'success',
        message: 'Playground deleted successfully',
    });

});