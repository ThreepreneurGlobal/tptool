import express from 'express';

import { createSkill, editSkill, getCategoriesOpts, getSkillById, getSkills, getSkillsOpts, getSubCategoriesOpts } from '../controllers/skill.js';
import { isAuthenticatedUser, isAutherizeRole } from '../middlewares/auth.js';


const router = express.Router();

// Auth Routes
router.use(isAuthenticatedUser);

router.post('/create', isAutherizeRole('admin'), createSkill);

router.put('/update/:id', isAutherizeRole('admin'), editSkill);

router.get('/get/:id', isAutherizeRole('admin'), getSkillById);

router.get('/get', isAutherizeRole('admin'), getSkills);

router.get('/opts', isAutherizeRole('admin'), getSkillsOpts);

router.get('/category/opts', isAutherizeRole('admin'), getCategoriesOpts);

router.get('/subcategory/opts', isAutherizeRole('admin'), getSubCategoriesOpts);


export default router;