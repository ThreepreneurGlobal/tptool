import express from 'express';

import { addSkillOpts, createSkill, editSkill, getSkillById, getSkillOpts, getSkills } from '../controllers/skill.js';
import { isAuthenticatedUser, isAutherizeRole } from '../middlewares/auth.js';
import { addSkill as studentAddSkill, deleteSkill as studentDeleteSkill, editSkill as studentEditSkill } from '../controllers/student/my/skill.js';


const router = express.Router();

// Auth Routes
router.use(isAuthenticatedUser);


// STUDENT
router.post('/student/add', studentAddSkill);

router.put('/student/edit/:id', studentEditSkill);

router.put('/student/delete/:id', studentDeleteSkill);

router.get('/add/options', addSkillOpts);


// ADMIN
router.post('/create', isAutherizeRole('admin'), createSkill);

router.put('/update/:id', isAutherizeRole('admin'), editSkill);

router.get('/get/:id', isAutherizeRole('admin'), getSkillById);

router.get('/get', isAutherizeRole('admin'), getSkills);

router.get('/options', isAutherizeRole('admin'), getSkillOpts);


export default router;