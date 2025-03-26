import express from 'express';
import { isAuthenticatedUser, isAutherizeRole } from '../middlewares/auth.js';
import { createEvent, editEvent, getEventAppById, getEventApps, getEventById, getEventFilterOpts, getEventOpts, getEvents } from '../controllers/event/index.js';
import { applyEvent } from '../controllers/event/student.js';
import upload from '../utils/upload.js';



const router = express.Router();


// Public Routes
router.get('/get/:id', getEventById);

router.post('/app/create', upload.single('resume'), applyEvent);


// Auth Routes
router.use(isAuthenticatedUser);

router.get('/get', getEvents);

router.get('/filter/opts', getEventFilterOpts);

router.post('/create', isAutherizeRole('admin'), createEvent);

router.put('/edit/:id', isAutherizeRole('admin'), editEvent);

router.get('/app/get', isAutherizeRole('admin'), getEventApps);

router.get('/app/get/:id', isAutherizeRole('admin'), getEventAppById);

router.get('/options', isAutherizeRole('admin'), getEventOpts);


export default router;