import express from 'express';

// import { addSkillOpts, createSkill, editSkill, getSkillById, getSkillOpts, getSkills, skillFilterOpts } from '../controllers/skill.js';
import { addSkill as studentAddSkill, deleteSkill as studentDeleteSkill, editSkill as studentEditSkill } from '../controllers/student/my/skill.js';
import { isAuthenticatedUser } from '../middlewares/auth.js';


const router = express.Router();

// AUTH ROUTES
router.use(isAuthenticatedUser);


// // STUDENT
// router.post('/create', createSkill);

router.post('/student/add', studentAddSkill);

// router.get('/get', getSkills);

router.put('/student/edit/:id', studentEditSkill);

router.put('/student/delete/:id', studentDeleteSkill);

// router.get('/add/options', addSkillOpts);

// router.get('/options', getSkillOpts);


// // ADMIN
// router.put('/update/:id', isAutherizeRole('admin'), editSkill);

// router.get('/get/:id', isAutherizeRole('admin'), getSkillById);

// router.get('/filter/opts', isAutherizeRole('admin'), skillFilterOpts);


export default router;