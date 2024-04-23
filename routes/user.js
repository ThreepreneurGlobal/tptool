const express = require("express");
const { isAuthenticatedUser, isAutherizeRole } = require("../middleware/auth");
const { registerUser, loginUser, logoutUser, myProfile, addAdmin, addStudent, allStudent, updateProfile, deleteStudent, getAdmins } = require("../controllers/user");
const upload = require("../utils/upload");
const { getStudentById, exportAllStud, importStudent } = require("../controllers/student");


const router = express.Router();

// Only For Super Admin
router.post("/register", registerUser);

router.post("/login", loginUser);

router.get("/logout", isAuthenticatedUser, logoutUser);

router.get("/myprofile", isAuthenticatedUser, myProfile);

router.post("/admin/add", isAuthenticatedUser, isAutherizeRole("super"), addAdmin);

router.post("/student/add", isAuthenticatedUser, isAutherizeRole("admin"), addStudent);

router.get("/get/students", isAuthenticatedUser, isAutherizeRole("admin"), allStudent);

router.get("/get/student/:id", isAuthenticatedUser, isAutherizeRole("admin"), getStudentById);

router.get("/admin/get", isAuthenticatedUser, isAutherizeRole("super"), getAdmins);

router.get("/export/students", isAuthenticatedUser, isAutherizeRole('admin'), exportAllStud);

router.post("/import/students", isAuthenticatedUser, isAutherizeRole("admin"), upload.single("file"), importStudent);

router.put("/update/profile", isAuthenticatedUser, upload.single("avatar"), updateProfile);

router.put("/delete/student/:id", isAuthenticatedUser, isAutherizeRole("admin"), deleteStudent);


module.exports = router;