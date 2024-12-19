import express from 'express';

import collegeRouter from './college.js';
import companyRouter from './company.js';
import placementRouter from './placement.js';
import skillRouter from './skill.js';
import userRouter from './user.js';


const router = express.Router();


router.use('/user', userRouter);

router.use('/college', collegeRouter);

router.use('/company', companyRouter);

router.use('/skill', skillRouter);

router.use('/placement', placementRouter);


export default router;