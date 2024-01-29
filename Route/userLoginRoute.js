const path = require('path');

const express = require('express');

const UserController = require('../Controller/userLogin');

const router = express.Router();

router.post('/user/login', UserController.loginUser);

// router.post('/user/signup', UserController.signupUser);

router.put('/user/updatePassword', UserController.updatePassword);
  
module.exports = router; 