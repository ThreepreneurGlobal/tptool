import express from 'express';

import { createCompany, createCompanyOpts, editCompany, getCompanies, getCompanyById } from '../controllers/company.js';
import { isAuthenticatedUser, isAutherizeRole } from '../middlewares/auth.js';
import upload from '../utils/upload.js';


const router = express.Router();

// Auth Routes
router.use(isAuthenticatedUser);

router.post('/create', isAutherizeRole('admin'), upload.single('logo'), createCompany);

router.get('/get', isAutherizeRole('admin'), getCompanies);

router.get('/get/:id', isAutherizeRole('admin'), getCompanyById);

router.put('/update/:id', isAutherizeRole('admin'), upload.single('logo'), editCompany);

router.get('/options', isAutherizeRole('admin'), createCompanyOpts);


export default router;