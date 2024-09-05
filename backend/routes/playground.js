const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const languages = require('../utils/constants').languages;

const { createPlayground, getYourPlaygrounds, getJoinedPlaygrounds, joinRequest, approveJoinRequest, rejectJoinRequest, checkIfParticipated, executeCode, leavePlayground, kickUser, savePlayground, deletePlayground, deleteParticipatedPlayground } = require('../controllers/playground');
const { isAuth } = require('../middlewares/isAuth');
const { validate } = require('../middlewares/validate');

const PlaygroundValidationRules = () => [
    body('name').notEmpty().withMessage('Name is required'),
    body('language').notEmpty().withMessage('Language is required').custom((value) => {
        if (!languages.some((lang) => lang.name === value)) {
            throw new Error('Invalid language');
        }
        return true;
    })
    ,
    body('roomId').notEmpty().withMessage('Room Id is required'),
];

router.use(isAuth);

router.post('/create',
    PlaygroundValidationRules(),
    validate,
    createPlayground);

router.get('/get-your-playgrounds',getYourPlaygrounds)
router.get('/get-joined-playgrounds',getJoinedPlaygrounds)
router.post('/request-to-join',joinRequest)
router.post('/approve-join-request',approveJoinRequest)
router.post('/reject-join-request',rejectJoinRequest)
router.get('/check-if-participated',checkIfParticipated)
router.post('/execute',executeCode)
router.post('/leave-playground',leavePlayground)
router.post('/kick-user',kickUser)
router.post('/save-playground',savePlayground)
router.post('/delete-my-playground',deletePlayground);
router.post('/delete-participated-playground',deleteParticipatedPlayground);

module.exports = router;