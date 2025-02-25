import express from 'express';

import { createPlacement, editPlacement, getPlacementById, getPlacements, getPlaceOptions } from '../controllers/placement.js';
import { isAuthenticatedUser, isAutherizeRole } from '../middlewares/auth.js';
import upload from '../utils/upload.js';


const router = express.Router();

// Auth Routes
router.use(isAuthenticatedUser);

router.get('/get', isAutherizeRole('admin'), getPlacements);

router.get('/get/:id', isAutherizeRole('admin'), getPlacementById);

router.post('/create', isAutherizeRole('admin'),
    upload.fields([{ name: 'attach_student' }, { name: 'attach_tpo' }]), createPlacement);

router.put('/update/:id', isAutherizeRole('admin'),
    upload.fields([{ name: 'attach_student' }, { name: 'attach_tpo' }]), editPlacement);

router.get('/options', isAutherizeRole('admin'), getPlaceOptions);


export default router;