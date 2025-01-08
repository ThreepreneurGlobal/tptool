import express from 'express';

import adminDash from '../controllers/dashboard/admin.js';
import { importStudent } from '../controllers/import.js';
import { exportStudent, generateTemplate, getStudents } from '../controllers/student.js';
import { createAdmin, createStudent, editStudent, loginUser, logoutUser, myProfile, studentById, updateProfile } from '../controllers/user.js';
import { isAuthenticatedUser, isAutherizeRole } from '../middlewares/auth.js';
import upload from '../utils/upload.js';
import xlxUpload from '../utils/xlxUpload.js';


const router = express.Router();


router.post('/admin/create', createAdmin);

router.post('/login', loginUser);

// Auth Routes
router.use(isAuthenticatedUser);

// User
router.get('/myprofile', myProfile);

router.get('/logout', logoutUser);

router.put('/update/myprofile', upload.single('avatar'), updateProfile);


// Student
router.post('/student/create', isAutherizeRole('admin'), createStudent);

router.put('/student/update/:id', isAutherizeRole('admin'), editStudent);

router.get('/student/get', isAutherizeRole('admin'), getStudents);

router.get('/student/get/:id', isAutherizeRole('admin'), studentById);

router.post('/student/import', isAutherizeRole('admin'), xlxUpload.single('file'), importStudent);

router.post('/student/export', isAutherizeRole('admin'), exportStudent);

router.get('/student/template', isAutherizeRole('admin'), generateTemplate);


// Dashboard
router.get('/admin/dashboard', isAutherizeRole('admin'), adminDash);


export default router;