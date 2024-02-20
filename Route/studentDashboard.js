const express = require('express');
const authenticateRole  = require('../middelware/auth'); 
const studentDashboard = require('../Controller/studentDashboard'); 

const router = express.Router();


router.get('/api/v1/user/get-recruiter-details', authenticateRole(['student']), studentDashboard.displayReruiter);
router.get('/api/v1/user/get-user-details', authenticateRole(['student']), studentDashboard.displayProfile);
router.put('/api/v1/user/update-user', authenticateRole(['student']), studentDashboard.editProfile)

module.exports = router 