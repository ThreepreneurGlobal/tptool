const express = require("express");
const { isAuthenticatedUser, isAutherizeRole } = require("../middleware/auth");
const { createSkill, getAllSkills, getSkillById, updateSkill, getAllBranches, getAllCourses, createBranch, getSuperCourses, createCourse, getSuperSkills, getGenBranches } = require("../controllers/skill");


const router = express.Router();

//Skill
router.post("/create", isAuthenticatedUser, isAutherizeRole("super"), createSkill);

router.get("/get", isAuthenticatedUser, getAllSkills);

router.get("/super/get", isAuthenticatedUser, isAutherizeRole("super"), getSuperSkills);


//Branch
router.get("/branch/get", isAuthenticatedUser, getAllBranches);

router.get("/branch/dd/get", isAuthenticatedUser, getGenBranches);

router.post("/branch/create", isAuthenticatedUser, isAutherizeRole("super"), createBranch);


//Course
router.get("/course/get", isAuthenticatedUser, getAllCourses);

router.get("/course/super/get", isAuthenticatedUser, isAutherizeRole("super"), getSuperCourses);

router.post("/course/create", isAuthenticatedUser, isAutherizeRole("super"), createCourse);


// General Routes
router.get("/get/:id", isAuthenticatedUser, getSkillById);

router.put("/update/:id", isAuthenticatedUser, isAutherizeRole("super"), updateSkill);


module.exports = router;