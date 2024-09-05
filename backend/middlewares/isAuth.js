const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const asyncHandler = require('express-async-handler');
const NewError = require('../utils/NewError');

exports.isAuth = asyncHandler(async (req, res, next) => {
    

    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        console.log(req.originalUrl);
        throw new NewError('Not authorized to access this route', 401);
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const user = await User.findById(decoded.userId).select('-password -refreshToken');
        if(!user) {
            throw new NewError('User not found', 404, { userNotFound: true });
        }
        req.userId = decoded.userId;
        req.username = user.username;
        next();
    } catch (err) {
        console.error(err.message);
        res.status(401).json({ msg: 'Token is not valid' });
    }
}
);

