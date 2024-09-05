const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { isAuth } = require('../middlewares/isAuth');
const { createCheckpoint, getCheckpoints, deleteCheckpoint } = require('../controllers/checkpoint');
const { validate } = require('../middlewares/validate');

const CheckpointValidationRules = () => [
    body('playgroundId').notEmpty().withMessage('Playground Id is required'),
    body('code').notEmpty().withMessage('Code is required'),
    body('name').notEmpty().withMessage('Name is required')
];

router.use(isAuth);
router.post('/create', CheckpointValidationRules(), validate, createCheckpoint);
router.get('/get', getCheckpoints);
router.delete('/delete', deleteCheckpoint);

module.exports = router;