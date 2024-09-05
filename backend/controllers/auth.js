const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const NewError = require("../utils/NewError");


const generateAccessAndRefreshTokens = async (user) => {
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
        expiresIn: "3d",
    });

    const refreshToken = jwt.sign({ userId: user._id }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: "7d",
    });

    user.refreshToken = refreshToken;
    await user.save();
    return { token, refreshToken };
};


exports.register = asyncHandler(async (req, res) => {
    console.log("register");
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;
    console.log(username, email, password);
    
        let user = await User.findOne({ email });
        if (user) {
            throw new NewError("User already exists", 400, true);
        }

        const userByUsername = await User.findOne({ username });

        if (userByUsername) {
            throw new NewError("Username already exists", 400, true);
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({
            username,
            email,
            password: hashedPassword,
        });


        await user.save();

        // const payload = {
        //     user: {
        //         id: user.id,
        //     },
        // };

        // jwt.sign(
        //     payload,
        //     process.env.JWT_SECRET,
        //     {
        //         expiresIn: 3600,
        //     },
        //     (err, token) => {
        //         if (err) throw err;
        //         res.json({ token });
        //     }
        // );
        res.status(200).json({ message: "User registered successfully" });
    
});

exports.login = asyncHandler(async (req, res) => {
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new NewError("Enter a valid email", 400, true, errors.array());
    }

    const { email, password } = req.body;


    if (!email || !password) {
        throw new NewError("Both fields are required!", 400, true);
    }

    let user = await User.findOne({ email });
    if (!user) {
        throw new NewError("User Not Found", 400, true);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new NewError("Wrong Password", 400, true);
    }

    const { token, refreshToken } = await generateAccessAndRefreshTokens(user);
    console.log(token, refreshToken);
    console.log("Logged in successfully");
    res.status(200).json({
        status: "success",
        message: "Logged in successfully",
        data: { token, refreshToken }
    });

});

exports.logout = asyncHandler(async (req, res) => {
    const userId = req.userId;

    await User.findByIdAndUpdate(
        userId,
        { $set: { refreshToken: null } },
        { new: true }
    );

    return res.status(200).json({ message: "Logged out successfully" });
});

exports.getUserData = asyncHandler(async (req, res) => {
    // console.log("getUserData");
    // console.log(req);
    const userId = req.userId;
    const user = await User.findById(userId).select("-password -refreshToken");

    if (!user) return res.status(400).json({ message: "User not found" });

    return res.status(200).json({ user });

});

exports.refreshToken = asyncHandler(async (req, res) => {
    const { refreshToken: incomingToken } = req.body;

    if (!incomingToken) return res.status(400).json({ message: "Refresh token not found" });

    // decoded is the payload of the token which is achieved by decoding the token

    const decoded = jwt.verify(incomingToken, process.env.JWT_REFRESH_SECRET);
    if (!decoded) return res.status(400).json({ message: "Invalid refresh token" });

    const user = await User.findById(decoded.userId);

    if (!user) return res.status(400).json({ message: "User not found" });
    if (user.refreshToken !== incomingToken) return res.status(400).json({ message: "Invalid refresh token" });

    const { token, refreshToken } = await generateAccessAndRefreshTokens(user);

    res.status(200).json({
        message: "Token refreshed successfully",
        data: { token, refreshToken }
    });
}
);