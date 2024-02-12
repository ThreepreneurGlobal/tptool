const express = require('express');
const authenticateRole  = require('../middelware/auth'); 
const adminController = require('../Controller/studentDataController'); 

const router = express.Router();

router.post('/api/v1/org/uploadData', authenticateRole(['admin']), adminController.uploadExcel);
router.post('/api/v1/org/uploadFormData', authenticateRole(['admin']), adminController.UploadIndivisualStudent);
router.get('/api/v1/org/viewUploadedData', authenticateRole(['admin']), adminController.viewUploadedData);
router.get('/api/v1/org/exportDataInExcel', authenticateRole(['admin']), adminController.exportDataToExcel);
router.put('/api/v1/org/updateCollageDetails', authenticateRole([ 'admin']), adminController.updateCollegeDetails);
router.get('/api/v1/org/searchUsersByName', authenticateRole(['admin']), adminController.searchUsersByName);
router.post('/api/v1/org/postRecruiter', authenticateRole(['admin']), adminController.postRecruiter);
router.get('/api/v1/org/displayRecruiters', authenticateRole(['admin']), adminController.displayRecruiter);
router.put('/api/v1/org/deleteStudent/:studentId', authenticateRole(['admin']), adminController.deleteStudent);
router.put('/api/v1/org/deleteRecruiter/:recruiterId', authenticateRole(['admin']), adminController.deleteRecruiter);

module.exports = router;