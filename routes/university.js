const express = require("express");
const { isAutherizeRole, isAuthenticatedUser } = require("../middleware/auth");
const { createUniversity, getAllUniversities, updateUniversity, getUniversityById, getDrpUniversities } = require("../controllers/university");
const upload = require("../utils/upload");


const router = express.Router();

router.post("/create", isAuthenticatedUser, isAutherizeRole("super"), upload.single("logo"), createUniversity);

router.get("/get", isAuthenticatedUser, isAutherizeRole("admin", "super"), getAllUniversities);

router.get("/dd/get", isAuthenticatedUser, isAutherizeRole("admin", "super"), getDrpUniversities);

router.put("/update/:id", isAuthenticatedUser, isAutherizeRole("super"), upload.single("logo"), updateUniversity);

router.get("/get/:id", isAuthenticatedUser, isAutherizeRole("super"), getUniversityById);


module.exports = router;