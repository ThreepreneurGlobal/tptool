const express = require('express');
const authenticateRole  = require('../middelware/auth'); 
const adminController = require('../Controller/studentDataController'); 

const router = express.Router();


router.post('/api/v1/org/uploadData', authenticateRole(['admin']), adminController.uploadExcel);
router.post('/api/v1/org/uploadFormData', authenticateRole(['admin']), adminController.UploadIndivisualStudent);
router.get('/api/v1/org/viewUploadedData', authenticateRole(['admin']), adminController.viewUploadedData);
router.get('/api/v1/org/exportDataInExcel', authenticateRole(['admin']), adminController.exportDataToExcel);

router.get('/api/v1/org/searchUsersByName', authenticateRole(['admin']), adminController.searchUsersByName);
router.post('/postRecruiter', authenticateRole(['admin']), adminController.postContent);
router.get('/displayRecruiters', authenticateRole(['admin']), adminController.displayRecruiter);
router.delete('/deleteStudent/:studentId', authenticateRole(['admin']), adminController.deletePost);
router.delete('/deleteRecruiter/:recruiterId', authenticateRole(['admin']), adminController.deleteRecruiter);

module.exports = router;
     

