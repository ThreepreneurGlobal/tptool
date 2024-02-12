const express = require('express');
const authenticateRole  = require('../middelware/auth'); 
const studentDashboard = require('../Controller/studentDashboard'); 

const router = express.Router();

router.get('/getRecruiterDetails', authenticateRole(['student']), studentDashboard.displayReruiter);
router.get('/getUserDetails', authenticateRole(['student']), studentDashboard.displayProfile);
router.put('/updateUser', authenticateRole(['student']), studentDashboard.editProfile)

module.exports = router 