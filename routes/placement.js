import express from 'express';

import { createPlacement, editPlacement, getDriveOpts, getPlacementById, getPlacements, getPositionOpts, getStatusOpts } from '../controllers/placement.js';
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

router.get('/status/opts', isAutherizeRole('admin'), getStatusOpts);

router.get('/drive/opts', isAutherizeRole('admin'), getDriveOpts);

router.get('/position/opts', isAutherizeRole('admin'), getPositionOpts);


export default router;