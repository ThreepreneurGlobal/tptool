import express from 'express';

import adminDash from '../controllers/dashboard/admin/index.js';
import userDash from '../controllers/dashboard/user/index.js';
import { isAuthenticatedUser, isAutherizeRole } from '../middlewares/auth.js';
import applicationRouter from './application.js';
import collegeRouter from './college.js';
import companyRouter from './company.js';
import eventRouter from './event.js';
import placementRouter from './placement.js';
import skillRouter from './skill.js';
import userRouter from './user.js';


const router = express.Router();


router.use('/user', userRouter);

router.use('/college', collegeRouter);

router.use('/company', companyRouter);

router.use('/skill', skillRouter);

router.use('/placement', placementRouter);

router.use('/application', applicationRouter);

router.use('/event', eventRouter);


// DASHBOARD
router.get('/admin/dashboard', isAuthenticatedUser, isAutherizeRole('admin'), adminDash);

router.get('/student/dashboard', isAuthenticatedUser, userDash);


export default router;