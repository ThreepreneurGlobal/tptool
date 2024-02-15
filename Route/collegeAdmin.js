const express = require('express');
const authenticateRole  = require('../middelware/auth'); 
const adminController = require('../Controller/studentDataController'); 

const router = express.Router();

router.post('/api/v1/org/upload-data', authenticateRole(['admin']), adminController.uploadExcel);
router.post('/api/v1/org/upload-form-data', authenticateRole(['admin']), adminController.UploadIndivisualStudent);
router.get('/api/v1/org/view-uploaded-data', authenticateRole(['admin']), adminController.viewUploadedData); 
router.get('/api/v1/org/export-data-in-excel', authenticateRole(['admin']), adminController.exportDataToExcel);
router.put('/api/v1/org/update-college-details', authenticateRole([ 'admin']), adminController.updateCollegeDetails);
router.get('/api/v1/org/search-users-by-name', authenticateRole(['admin']), adminController.searchUsersByName);
router.post('/api/v1/org/post-recruiter', authenticateRole(['admin']), adminController.postRecruiter);
router.get('/api/v1/org/display-recruiters', authenticateRole(['admin']), adminController.displayRecruiter);
router.put('/api/v1/org/delete-student/:studentId', authenticateRole(['admin']), adminController.deleteStudent);
router.put('/api/v1/org/delete-recruiter/:recruiterId', authenticateRole(['admin']), adminController.deleteRecruiter);
router.put('/api/v1/org/students/:studentId', authenticateRole(['admin']), adminController.updateStudentPassword);

module.exports = router;