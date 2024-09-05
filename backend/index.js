const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/connectDB.js');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const userRoutes = require('./routes/auth.js');
const playgroundRoutes = require('./routes/playground.js');
const checkpointRoutes = require('./routes/checkpoint.js');
const { initializeSocket, emitSocketEvent } = require('./scoket/socket.js');
const axios = require('axios'); // Import axios for making HTTP requests to executor server
const { error } = require('console');
const ErrorHandler = require('./middlewares/ErrorHandler.js');
const NewError = require('./utils/NewError.js');


dotenv.config();

const PORT = process.env.PORT || 5000;
const EXEC_PORT = process.env.EXECUTOR_URL;


connectDB();

const app = express();

app.use(cors({
    origin: "*",
    //credentials: true
}));

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const httpServer = createServer(app);

const io = new Server(httpServer, {
    pingTimeout: 60000,
    cors: {
        origin: "*", // TODO: change this to the frontend URL
        credentials: true
    }
});

app.set('io', io);

initializeSocket(io);

// app.get("/",function(req,res){
//     res.send("Hello");
// });

app.use('/api/users', userRoutes);
app.use('/api/playground', playgroundRoutes);
app.use('/api/checkpoint', checkpointRoutes);

app.use(ErrorHandler);



httpServer.listen(PORT, () => {
    console.log(`listening on ${PORT}`);
});

