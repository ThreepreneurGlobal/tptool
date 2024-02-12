const path = require('path');

const express = require('express');
const router = express.Router();
const authenticateRole  = require('../middelware/auth');
const collegeController = require('../Controller/collageController');
const loginSuperUserController = require('../Controller/superUserAdminController');

router.post('/api/v1/collage/onboardCollege', authenticateRole([ "superUser" ]), collegeController.onboardCollege);

router.post('/api/v1/collage/saveCollageDetails', authenticateRole([ "superUser" ]), collegeController.collageDetails);

router.get('/api/v1/collage/colleges', authenticateRole([ "superUser" ]), collegeController.getColleges);

router.post('/api/v1/user/loginSuper', loginSuperUserController.loginSuperUser); 

module.exports = router;   