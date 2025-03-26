import express from 'express';

import applicationRouter from './application.js';
import collegeRouter from './college.js';
import companyRouter from './company.js';
import eventRouter from './event.js';
import placementRouter from './placement.js';
import skillRouter from './skill.js';
import userRouter from './user.js';


const router = express.Router();


router.use('/user', userRouter);

router.use('/college', collegeRouter);

router.use('/company', companyRouter);

router.use('/skill', skillRouter);

router.use('/placement', placementRouter);

router.use('/application', applicationRouter);

router.use('/event', eventRouter);


export default router;