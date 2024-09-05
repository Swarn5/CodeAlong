const NewError = require("../utils/NewError");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const Playground = require("../models/playgroundModel");


const mountLeaveRoom = (socket) => {
    socket.on('leaveRoom', async ({roomId,userId}) => {
        try {
            console.log('leaveRoom:', roomId);
            const room = await Playground.findOne({
                roomId
            });
            if (!room) {
                throw new NewError('Room not found', 404, { roomNotFound: true });
            }
            const user = await User.findById(userId);
            if (!user) {
                throw new NewError('User not found', 404, { userNotFound: true });
            }
            const username = user.username;
            socket.leave(roomId);
            // console.log('user left room:', roomId);
            socket.to(roomId).emit('userLeft', { username, userId });
        }
        catch (error) {
            console.error(error);
            socket.emit('error', { message: error.message });
        }
    }
    );
}

const mountJoinRoom = (socket) => {
    socket.on('joinRoom', async ({roomId,userId}) => {
        try {
           
            const room = await Playground.findOne({
                roomId
            });
            if (!room) {
                throw new NewError('Room not found', 404, { roomNotFound: true });
            }
            const user = await User.findById (userId);
            if (!user) {
                throw new NewError('User not found', 404, { userNotFound: true });
            }
            const username = user.username;
            socket.join(roomId);
            console.log('user joined the coding room:', roomId, 'username:', username);
            // console.log('user joined room:', roomId);
            socket.to(roomId).emit('userJoined',  {username, userId});
        }
        catch (error) {
            console.error(error);
            socket.emit('error', { message: error.message });
        }
    }
    );
}

const mountSetIntialCode = (socket) => {
    socket.on('setInitialCode', async ({code,roomId}) => {
        try {
            // console.log('setting initial code:', code);
            socket.to(roomId).emit('settingInitialCode', { code,roomId });
        }
        catch (error) {
            console.error(error);
            socket.emit('error', { message: error.message });
        }
    }
    );
}


const mountApproveJoinRequest = (socket) => {
    socket.on('approveJoinRequest', async (roomId, userId) => {
        try {
            const room = await Playground.findOne({
                roomId
            });
            if (!room) {
                throw new NewError('Room not found', 404, { roomNotFound: true });
            }
            if (room.participatedUsers.includes(userId)) {
                throw new NewError('User has already joined this room', 400, { alreadyJoined: true });
            }
            if (room.createdBy === userId) {
                throw new NewError('User is the creator of this room', 400, { creator: true });
            }
            room.participatedUsers.push(userId);
            await room.save();
            socket.to(userId).emit('joinRequestApproved', { roomId });
        }
        catch (error) {
            console.error(error);
            socket.emit('error', { message: error.message });
        }
    }
    );
}

const mountRejectJoinRequest = (socket) => {
    socket.on('rejectJoinRequest', async (roomId, userId) => {
        try {
            const room = await Playground.findOne({
                roomId
            });
            if (!room) {
                throw new NewError('Room not found', 404, { roomNotFound: true });
            }
            if (room.participatedUsers.includes(userId)) {
                throw new NewError('User has already joined this room', 400, { alreadyJoined: true });
            }
            if (room.createdBy === userId) {
                throw new NewError('User is the creator of this room', 400, { creator: true });
            }
            socket.to(userId).emit('joinRequestRejected', { roomId });
        }
        catch (error) {
            console.error(error);
            socket.emit('error', { message: error.message });
        }
    }
    );
}

const mountCodeChange = (socket) => {
    socket.on('codeChange', ({ roomId, code }) => {
        // console.log('codeChange:', code);
        // Emit the code change to all other clients in the same room
        socket.in(roomId).emit('codeChange', { code });
    }
    );
}


const initializeSocket = (io) => {
    io.on('connection', async (socket) => {
        // console.log('a user connected');
        let user;
        let userId;
        try {
            const token = socket.handshake.auth?.token;

            if (!token) {
                throw new NewError('Token is missing', 401);
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            userId = decoded?.userId;
            const user = await User.findById(userId).select('-password -refreshToken');

            if (!user) {
                throw new NewError('User not found', 404, { userNotFound: true });
            }


            socket.user = user;
            
            socket.join(userId);
            socket.emit("connected");
            console.log('user joined room : ', userId);

            mountJoinRoom(socket);
            mountCodeChange(socket);
            mountApproveJoinRequest(socket);
            mountRejectJoinRequest(socket);
            mountSetIntialCode(socket);
            mountLeaveRoom(socket);

            socket.on('disconnect', () => {
                console.log('user disconnected');
            });
        }
        catch (error) {
            console.error(error);
            socket.emit('error', { message: error.message });
        }


        
    });

    // io.on('codeChange', ({roomId,code}) => {
    //     console.log('codeChange:', code);
    //     // Emit the code change to all other clients in the same room
    //     socket.in(roomId).emit('codeChange', {code});
    // });


}

const emitSocketEvent = (req, event, data, roomID) => {
    // console.log('emitting event:', event, 'to room:', roomID);
    // console.log('data:', data);
    req.app.get('io').to(roomID).emit(event, data);
}

module.exports = {
    initializeSocket,
    emitSocketEvent
}