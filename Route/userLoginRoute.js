const path = require('path');

const express = require('express');

const UserController = require('../Controller/userLogin');

const router = express.Router();


router.post('/api/v1/user/login', UserController.loginUser);
// router.post('/user/signup', UserController.signupUser);
  
module.exports = router; 