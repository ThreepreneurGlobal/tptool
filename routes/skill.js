const express = require("express");
const { isAuthenticatedUser, isAutherizeRole } = require("../middleware/auth");
const { createSkill, getAllSkills, getSkillById, updateSkill, getAllBranches, getAllCourses, createBranch, getSuperCourses, createCourse, getSuperSkills, getGenBranches } = require("../controllers/skill");
const { addSkill } = require("../controllers/studentSkill");


const router = express.Router();

//Skill
router.post("/create", isAuthenticatedUser, isAutherizeRole("super", "admin"), createSkill);

router.get("/get", isAuthenticatedUser, getAllSkills);

router.get("/super/get", isAuthenticatedUser, isAutherizeRole("super", "admin"), getSuperSkills);

router.post("/user/add", isAuthenticatedUser, addSkill);


//Branch
router.get("/branch/get", isAuthenticatedUser, getAllBranches);

router.get("/branch/dd/get", isAuthenticatedUser, getGenBranches);

router.post("/branch/create", isAuthenticatedUser, isAutherizeRole("super", "admin"), createBranch);


//Course
router.get("/course/get", isAuthenticatedUser, getAllCourses);

router.get("/course/super/get", isAuthenticatedUser, isAutherizeRole("super", "admin"), getSuperCourses);

router.post("/course/create", isAuthenticatedUser, isAutherizeRole("super", "admin"), createCourse);


// General Routes
router.get("/get/:id", isAuthenticatedUser, getSkillById);

router.put("/update/:id", isAuthenticatedUser, isAutherizeRole("super", "admin"), updateSkill);


module.exports = router;