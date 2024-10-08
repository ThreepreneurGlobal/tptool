const express = require("express");
const { isAuthenticatedUser, isAutherizeRole } = require("../middleware/auth");
const { registerUser, loginUser, logoutUser, myProfile, addAdmin, addStudent, allStudent, updateProfile, deleteStudent, getAdmins, getAdminById } = require("../controllers/user");
const upload = require("../utils/upload");
const xlxUpload = require("../utils/xlxUpload");
const { getStudentById, exportAllStud, updateStudentProfile, editCollageStudent } = require("../controllers/student");
const { generateTemplate, importStudent } = require("../controllers/importStudent");


const router = express.Router();

// Only For Super Admin
router.post("/register", registerUser);

router.post("/login", loginUser);

router.get("/logout", isAuthenticatedUser, logoutUser);

router.get("/myprofile", isAuthenticatedUser, myProfile);

router.post("/admin/add", isAuthenticatedUser, isAutherizeRole("super"), addAdmin);

router.post("/student/add", isAuthenticatedUser, isAutherizeRole("admin"), addStudent);

router.put("/student/update/:id", isAuthenticatedUser, isAutherizeRole("admin"), editCollageStudent);

router.get("/get/students", isAuthenticatedUser, isAutherizeRole("admin"), allStudent);

router.get("/get/student/:id", isAuthenticatedUser, isAutherizeRole("admin"), getStudentById);

router.get("/admin/get", isAuthenticatedUser, isAutherizeRole("super"), getAdmins);

router.get("/admin/get/:id", isAuthenticatedUser, isAutherizeRole("super"), getAdminById);

router.get("/student/excel/generate", isAuthenticatedUser, isAutherizeRole("admin"), generateTemplate);

router.get("/export/students", isAuthenticatedUser, isAutherizeRole('admin'), exportAllStud);

router.post("/import/students", isAuthenticatedUser, isAutherizeRole("admin"), xlxUpload.single("file"), importStudent);

router.put("/update/profile", isAuthenticatedUser, upload.single("avatar"), updateProfile);

router.put("/student/update", isAuthenticatedUser, updateStudentProfile);

router.put("/delete/student/:id", isAuthenticatedUser, isAutherizeRole("admin"), deleteStudent);


module.exports = router;