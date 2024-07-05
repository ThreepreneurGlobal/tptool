const express = require("express");
const { isAuthenticatedUser, isAutherizeRole } = require("../middleware/auth");
const { createSkill, getAllSkills, getSkillById, updateSkill, getAllBranches, getAllCourses, createBranch, createCourse, getDrpCourses, getDrpSkills, getDrpBranches } = require("../controllers/skill");
const { addSkill } = require("../controllers/studentSkill");


const router = express.Router();

//Skill
router.post("/create", isAuthenticatedUser, isAutherizeRole("super", "admin"), createSkill);

router.get("/get", isAuthenticatedUser, getAllSkills);

router.get("/dd/get", isAuthenticatedUser, isAutherizeRole("super", "admin"), getDrpSkills);

router.post("/user/add", isAuthenticatedUser, addSkill);


//Branch
router.get("/branch/get", isAuthenticatedUser, getAllBranches);

router.get("/branch/dd/get", isAuthenticatedUser, isAutherizeRole("admin", "super"), getDrpBranches);

router.post("/branch/create", isAuthenticatedUser, isAutherizeRole("super", "admin"), createBranch);


//Course
router.get("/course/get", isAuthenticatedUser, isAutherizeRole("super"), getAllCourses);

router.get("/course/dd/get", isAuthenticatedUser, isAutherizeRole("super", "admin"), getDrpCourses);

router.post("/course/create", isAuthenticatedUser, isAutherizeRole("super", "admin"), createCourse);


// General Routes
router.get("/get/:id", isAuthenticatedUser, getSkillById);

router.put("/update/:id", isAuthenticatedUser, isAutherizeRole("super", "admin"), updateSkill);


module.exports = router;