import express from 'express';

import { applicationById, editApplication, getApplications } from '../controllers/application/index.js';
import { createApplication, myAppById, myApplications } from '../controllers/application/student.js';
import { isAuthenticatedUser, isAutherizeRole } from '../middlewares/auth.js';


const router = express.Router();

// Auth Routes
router.use(isAuthenticatedUser);

router.get('/my/get', myApplications);

router.get('/my/get/:id', myAppById);

router.post('/create', createApplication);


// ADMIN
router.get('/get', isAutherizeRole('admin'), getApplications);

router.get('/get/:id', isAutherizeRole('admin'), applicationById);

router.put('/edit/:id', isAutherizeRole('admin'), editApplication);


export default router;