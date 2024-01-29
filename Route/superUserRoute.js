const path = require('path');

const express = require('express');
const router = express.Router();
const authenticateRole  = require('../middelware/auth');
const collegeController = require('../Controller/collageController');
const loginSuperUserController = require('../Controller/superUserAdminController')

router.post('/onboardCollege', authenticateRole([ "superUser" ]), collegeController.onboardCollege);

router.post('/saveCollageDetails', authenticateRole([ "superUser" ]), collegeController.collageDetails);

router.get('/colleges', authenticateRole([ "superUser" ]), collegeController.getColleges);

router.post('/loginSuper', loginSuperUserController.loginSuperUser);

module.exports = router;   