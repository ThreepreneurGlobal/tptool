import express from 'express';

import { getCollegeOpts, getCoursesBranches } from '../controllers/college.js';
import { isAuthenticatedUser, isAutherizeRole } from '../middlewares/auth.js';


const router = express.Router();

// Auth Routes
router.use(isAuthenticatedUser);

router.get('/options', isAutherizeRole('admin'), getCollegeOpts)

router.get('/course-branch/get', isAutherizeRole('admin'), getCoursesBranches);


export default router;