const jwt = require("jsonwebtoken");


const generateAccessAndRefreshTokens = async (account) => {
    const token = jwt.sign({ userId: account._id.toString()},process.env.JWT_SECRET, {
        expiresIn: "3d" 
    });
    const refreshToken = jwt.sign(
        { userId: account._id.toString() },
        process.env.JWT_SECRET,
        {
            expiresIn: "7d"
        }
    );
    account.refreshToken = refreshToken;
    await account.save();
    return { token, refreshToken };
};

module.exports = generateAccessAndRefreshTokens;