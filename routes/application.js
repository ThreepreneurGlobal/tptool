import express from 'express';

import { appFilterOpts, applicationById, editApplication, getApplications } from '../controllers/application/index.js';
import { createApplication, myAppById, myApplications } from '../controllers/application/student.js';
import { isAuthenticatedUser, isAutherizeRole } from '../middlewares/auth.js';


const router = express.Router();

// AUTH ROUTES
router.use(isAuthenticatedUser);

router.get('/my/get', myApplications);

router.get('/my/get/:id', myAppById);

router.post('/create', createApplication);


// ADMIN
router.get('/get', isAutherizeRole('admin'), getApplications);

router.get('/get/:id', isAutherizeRole('admin'), applicationById);

router.put('/edit/:id', isAutherizeRole('admin'), editApplication);

router.get('/filter/opts', isAutherizeRole('admin'), appFilterOpts);


export default router;