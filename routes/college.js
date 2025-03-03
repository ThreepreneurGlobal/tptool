import express from 'express';

import { getCollegeOpts, getCoursesBranches } from '../controllers/college.js';
import { isAuthenticatedUser, isAutherizeRole } from '../middlewares/auth.js';


const router = express.Router();

router.get('/options', getCollegeOpts)


// Auth Routes
router.use(isAuthenticatedUser);

router.get('/course-branch/get', isAutherizeRole('admin'), getCoursesBranches);


export default router;