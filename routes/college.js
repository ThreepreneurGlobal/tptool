import { Router } from 'express';

import { createCollege, editCollege, getCollegeById, getCollegeOptions, getColleges, getUniversityOptions } from '../controllers/college/index.js';
import { isAuthenticatedUser, isAutherizeRole } from '../middlewares/auth.js';



const router = Router();


// AUTH ROUTES
router.use(isAuthenticatedUser);

router.post('/create', isAutherizeRole('super'), createCollege);

router.get('/get', isAutherizeRole('super'), getColleges);

router.get('/get/:id', isAutherizeRole('super'), getCollegeById);

router.put('/edit/profile', isAutherizeRole('admin'), editCollege);

router.get('/option/get', isAutherizeRole('super'), getCollegeOptions);

router.get('/option/university', isAutherizeRole('super'), getUniversityOptions);


export default router;