import express from 'express';

import { createPlacement, editPlacement, getPlaceFilterOpts, getPlacementById, getPlacements, getPlaceOptions } from '../controllers/placement/index.js';
import { myPlaceById, myPlacements } from '../controllers/placement/student.js';
import { isAuthenticatedUser, isAutherizeRole } from '../middlewares/auth.js';
import upload from '../utils/upload.js';


const router = express.Router();

// Auth Routes
router.use(isAuthenticatedUser);

router.get('/student/get', myPlacements);

router.get('/student/get/:id', myPlaceById);


// ADMIN
router.get('/get', isAutherizeRole('admin'), getPlacements);

router.get('/get/:id', isAutherizeRole('admin'), getPlacementById);

router.post('/create', isAutherizeRole('admin'),
    upload.fields([{ name: 'attach_student' }, { name: 'attach_tpo' }]), createPlacement);

router.put('/update/:id', isAutherizeRole('admin'),
    upload.fields([{ name: 'attach_student' }, { name: 'attach_tpo' }]), editPlacement);

router.get('/options', isAutherizeRole('admin'), getPlaceOptions);

router.get('/filter/opts', isAutherizeRole('admin'), getPlaceFilterOpts);


export default router;