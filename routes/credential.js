import { Router } from 'express';

import { createCredential, editCredential, getCredentialById, getCredentials } from '../controllers/credential/index.js';
import { isAuthenticatedUser, isAutherizeRole } from '../middlewares/auth.js';



const router = Router();

// AUTH ROUTES
router.use(isAuthenticatedUser);

router.get('/get', isAutherizeRole('super'), getCredentials);

router.get('/get/:id', isAutherizeRole('super'), getCredentialById);

router.post('/create', isAutherizeRole('super'), createCredential);

router.put('/update/:id', isAutherizeRole('super'), editCredential);



export default router;