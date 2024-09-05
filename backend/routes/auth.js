const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

const { register, login, logout, refreshToken, getUserData } = require('../controllers/auth');
const { isAuth } = require('../middlewares/isAuth');
const User = require('../models/userModel');
const { validate } = require('../middlewares/validate');

const userLoginValidationRules = () => [
    body('email').trim().isEmail().normalizeEmail().withMessage('Invalid email')
];

const userRegisterValidationRules = () => [
    body('email').trim()
        .isEmail()
        .withMessage("Invalid email format")
        .normalizeEmail()
        .custom(async (value) => {
            const user = await User.findOne({ email: value });
            if (user) {
                throw new Error("E-Mail already exists");
            }
        }),
    body('password').isLength({ min: 8 }).withMessage("Password must be at least 6 characters long"),
    body('confirmPassword').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error("Passwords do not match");
        }
        return true;
    }),
    body('username').trim().isLength({ min: 3, max: 20 }).withMessage("Username must be between 3 and 20 characters long")
        .matches(/^[A-Za-z][A-Za-z0-9]*$/).withMessage("Username must start with a letter and contain only letters and numbers")
];



router.post('/register',
    userRegisterValidationRules(),
    validate,
    register
);
router.post('/login',
    userLoginValidationRules(),
    validate,
    login
);
router.post('/logout', isAuth, logout);
router.patch('/refresh_token', refreshToken);
router.route('/user-data').get(isAuth, getUserData);


module.exports = router;