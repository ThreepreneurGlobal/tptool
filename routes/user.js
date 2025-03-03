import express from 'express';

import adminDash from '../controllers/dashboard/admin.js';
import { exportStudent, generateTemplate } from '../controllers/student/export.js';
import { importStudent } from '../controllers/student/import.js';
import { createStudent, editStudent, getFilterOpts, getStudents, studentById } from '../controllers/student/index.js';
import { addCertificate, deleteCertificate } from '../controllers/student/my/certificate.js';
import { myStudentProfile, registerStudent } from '../controllers/student/my/index.js';
import { addProject, editProject } from '../controllers/student/my/project.js';
import { createAdmin, loginUser, logoutUser, myProfile, updateProfile } from '../controllers/user.js';
import { isAuthenticatedUser, isAutherizeRole } from '../middlewares/auth.js';
import upload from '../utils/upload.js';
import xlxUpload from '../utils/xlxUpload.js';


const router = express.Router();


router.post('/admin/create', createAdmin);

router.post('/login', loginUser);

router.post('/student/register', registerStudent);


// Auth Routes
router.use(isAuthenticatedUser);

// User
router.get('/myprofile', myProfile);

router.get('/logout', logoutUser);

router.put('/update/myprofile', upload.single('avatar'), updateProfile);


// STUDENT
router.get('/student/myprofile', myStudentProfile);

router.post('/student/certificate/add', upload.array('certificates[]'), addCertificate);

router.put('/student/certificate/delete', deleteCertificate);

router.post('/student/project/add', upload.single('prev_img'), addProject);

router.put('/student/project/edit/:id', editProject);


// ADMIN FOR STUDENT
router.post('/student/create', isAutherizeRole('admin'), createStudent);

router.put('/student/update/:id', isAutherizeRole('admin'), editStudent);

router.get('/student/get', isAutherizeRole('admin'), getStudents);

router.get('/student/get/:id', isAutherizeRole('admin'), studentById);

router.get('/student/options', isAutherizeRole('admin'), getFilterOpts);

router.post('/student/import', isAutherizeRole('admin'), xlxUpload.single('file'), importStudent);

router.post('/student/export', isAutherizeRole('admin'), exportStudent);

router.get('/student/template', isAutherizeRole('admin'), generateTemplate);


// Dashboard
router.get('/admin/dashboard', isAutherizeRole('admin'), adminDash);


export default router;