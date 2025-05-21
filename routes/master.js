import { Router } from 'express';

import { createCompany, editCompany, getCompanies, getCompanyById, getCompanyOpts, getCompCreateOpts } from '../controllers/master/company.js';
import { createCourse, editCourse, getCourseBranchOpts, getCourseById, getCourses, getCreateCourseBranchOpts } from '../controllers/master/course.js';
import { createSkill, editSkill, getCreateSkillOpts, getGrpSkillOpts, getSkillById, getSkills } from '../controllers/master/skill.js';
import { isAuthenticatedUser, isAutherizeRole } from '../middlewares/auth.js';
import upload from '../utils/upload.js';


const router = Router();


// PUBLIC OPTIONS
router.get('/course/get', getCourses);
router.get('/course/get/:id', getCourseById);
router.get('/course-branch/opts', getCourseBranchOpts);
router.get('/course/create-opts', getCreateCourseBranchOpts);

router.get('/skill/get', getSkills);
router.get('/skill/opts', getGrpSkillOpts);
router.get('/skill/get/:id', getSkillById);
router.get('/skill/create-opts', getCreateSkillOpts);

router.get('/company/get', getCompanies);
router.get('/company/opts', getCompanyOpts);
router.get('/company/get/:id', getCompanyById);
router.get('/company/create-opts', getCompCreateOpts);




// AUTH ROUTES
router.use(isAuthenticatedUser);

// COMPANY
router.post('/company/create', isAutherizeRole('super', 'admin'), upload.single('logo'), createCompany);

router.put('/company/edit/:id', isAutherizeRole('super', 'admin'), upload.single('logo'), editCompany);


// COURSE/BRANCH
router.post('/course/create', isAutherizeRole('super', 'admin'), createCourse);

router.put('/course/edit/:id', isAutherizeRole('super', 'admin'), editCourse);


// SKILL
router.post('/skill/create', isAutherizeRole('super', 'admin'), createSkill);

router.put('/skill/edit/:id', isAutherizeRole('super', 'admin'), editSkill);



export default router;