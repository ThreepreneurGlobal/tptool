import express from 'express';

import { isAuthenticatedUser, isAutherizeRole } from '../middlewares/auth.js';
import { batchOpt, branchesOpt, coursesOpt, diplomaOpt, diplomaStreamOpt, edYearOpt, getCoursesBranches, tenBoardOpt, tenStreamOpt, twelveBoardOpt, twelveStreamOpt } from '../controllers/college.js';


const router = express.Router();

// Auth Routes
router.use(isAuthenticatedUser);

router.get('/course/opts', isAutherizeRole('admin'), coursesOpt);

router.get('/branch/opts', isAutherizeRole('admin'), branchesOpt);

router.get('/edyear/opts', isAutherizeRole('admin'), edYearOpt);

router.get('/tenstream/opts', isAutherizeRole('admin'), tenStreamOpt);

router.get('/twelvestream/opts', isAutherizeRole('admin'), twelveStreamOpt);

router.get('/tenboard/opts', isAutherizeRole('admin'), tenBoardOpt);

router.get('/twelveboard/opts', isAutherizeRole('admin'), twelveBoardOpt);

router.get('/diploma/opts', isAutherizeRole('admin'), diplomaOpt);

router.get('/diplomastream/opts', isAutherizeRole('admin'), diplomaStreamOpt);

router.get('/batch/opts', isAutherizeRole('admin'), batchOpt);

router.get('/course-branch/get', isAutherizeRole('admin'), getCoursesBranches);


export default router;