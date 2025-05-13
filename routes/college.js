import express from 'express';

import { editMyCollege, myCollege } from '../controllers/college/index.js';
import { getCollegeOpts, getCoursesBranches } from '../controllers/my_college.js';
import { isAuthenticatedUser, isAutherizeRole } from '../middlewares/auth.js';
import upload from '../utils/upload.js';


const router = express.Router();

router.get('/options', getCollegeOpts)


// AUTH ROUTES
router.use(isAuthenticatedUser);

router.get('/myorg', isAutherizeRole('admin'), myCollege);

router.put('/edit/myorg', isAutherizeRole('admin'), upload.single('logo'), editMyCollege);

router.get('/course-branch/get', isAutherizeRole('admin'), getCoursesBranches);


export default router;