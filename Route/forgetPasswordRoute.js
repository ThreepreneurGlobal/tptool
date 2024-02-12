const express = require('express');
const authenticateRole  = require('../middelware/auth'); 
const Password = require('../Controller/forgetPassword'); 

const router = express.Router();

router.post('/forgetPassword', Password.forgetPassword );
router.get('/password/reset-password/:id', Password.resetPasswordForm);
router.get('/password/updatePassword/:resetpasswordid', Password.resetPassword);


module.exports = router 