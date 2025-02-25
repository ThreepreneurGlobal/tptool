import express from 'express';

import { createSkill, editSkill, getSkillById, getSkillOpts, getSkills } from '../controllers/skill.js';
import { isAuthenticatedUser, isAutherizeRole } from '../middlewares/auth.js';


const router = express.Router();

// Auth Routes
router.use(isAuthenticatedUser);

router.post('/create', isAutherizeRole('admin'), createSkill);

router.put('/update/:id', isAutherizeRole('admin'), editSkill);

router.get('/get/:id', isAutherizeRole('admin'), getSkillById);

router.get('/get', isAutherizeRole('admin'), getSkills);

router.get('/options', isAutherizeRole('admin'), getSkillOpts);


export default router;