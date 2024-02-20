const path = require('path');

const express = require('express');
const router = express.Router();
const authenticateRole  = require('../middelware/auth');
const collegeController = require('../Controller/collegeController');
const loginSuperUserController = require('../Controller/superUserAdminController');


router.post('/api/v1/college/onboard-college', authenticateRole([ "superUser" ]), collegeController.onboardCollege);
router.post('/api/v1/college/save-college-details', authenticateRole([ "superUser" ]), collegeController.collegeDetails);
router.get('/api/v1/college/colleges', authenticateRole([ "superUser" ]), collegeController.getColleges);
router.post('/api/v1/user/login-super', loginSuperUserController.loginSuperUser); 

module.exports = router;   