import { Router } from 'express';

import superDashboard from '../controllers/dashboard/index.js';
import { isAuthenticatedUser, isAutherizeRole } from '../middlewares/auth.js';
import college_router from './college.js';
import credential_router from './credential.js';
import user_router from './user.js';



const router = Router();


router.use('/user', user_router);

router.use('/college', college_router);

router.use('/credential', credential_router);

// DASHBOARD
router.get('/dashboard', isAuthenticatedUser, isAutherizeRole('super'), superDashboard);



export default router;