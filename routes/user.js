import { Router } from 'express';

import { createAdmin, createPassword, verifyOtp } from '../controllers/admin/create.js';
import { getAdminById, getAdmins } from '../controllers/admin/index.js';
import { editMyProfile, loginUser, logoutUser, myProfileUser, registerUser } from '../controllers/user.js';
import { isAuthenticatedUser, isAutherizeRole } from '../middlewares/auth.js';
import upload from '../utils/upload.js';



const router = Router();


// PUBLIC ROUTES
router.post('/register', registerUser);

router.post('/login', loginUser);


// AUTH ROUTES
router.use(isAuthenticatedUser);

router.get('/myprofile', myProfileUser);

router.get('/logout', logoutUser);

router.put('/update/myprofile', upload.single('avatar'), editMyProfile);


// SUPER ADMIN ROUTES
router.get('/admin/get', isAutherizeRole('super'), getAdmins);

router.get('/admin/get/:id', isAutherizeRole('super'), getAdminById);

router.post('/admin/create', isAutherizeRole('super'), createAdmin);

router.put('/admin/otp-verify', isAutherizeRole('super'), verifyOtp);

router.put('/admin/password/create', isAutherizeRole('super'), createPassword);


export default router;