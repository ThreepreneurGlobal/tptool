const express = require('express');
const authenticateRole  = require('../middelware/auth'); 
const adminController = require('../Controller/studentDataController'); 

const router = express.Router();


router.post('/uploadData', authenticateRole(['admin']), adminController.uploadExcel);
router.post('/uploadFormData', authenticateRole(['admin']), adminController.UploadIndivisualStudent);
router.get('/viewUploadedData', authenticateRole(['admin']), adminController.viewUploadedData);
router.get('/exportDataInExcel', authenticateRole(['admin']), adminController.exportDataToExcel);
router.post('/postRecruiter', authenticateRole(['admin']), adminController.postContent);
router.get('/displayRecruiters', authenticateRole(['admin']), adminController.displayRecruiter);
router.delete('/deleteStudent/:studentId', authenticateRole(['admin']), adminController.deletePost);
router.delete('/deleteRecruiter/:recruiterId', authenticateRole(['admin']), adminController.deleteRecruiter);

module.exports = router;
     

