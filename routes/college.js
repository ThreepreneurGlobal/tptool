import { Router } from 'express';

import { activeCollege, createCollege, deactiveCollege, editCollege, getCollegeById, getCollegeOptions, getColleges, getUniversityOptions } from '../controllers/college/index.js';
import { isAuthenticatedUser, isAutherizeRole } from '../middlewares/auth.js';



const router = Router();


// AUTH ROUTES
router.use(isAuthenticatedUser);


// SUPER ADMIN
router.post('/create', isAutherizeRole('super'), createCollege);

router.get('/get', isAutherizeRole('super'), getColleges);

router.get('/get/:id', isAutherizeRole('super'), getCollegeById);

router.put('/status/active/:id', isAutherizeRole('super'), activeCollege);

router.put('/status/deactive/:id', isAutherizeRole('super'), deactiveCollege);

router.get('/option/get', isAutherizeRole('super'), getCollegeOptions);

router.get('/option/university', isAutherizeRole('super'), getUniversityOptions);


// ADMIN
router.put('/edit/profile', isAutherizeRole('admin'), editCollege);


export default router;