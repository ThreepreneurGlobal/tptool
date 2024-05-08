const express = require("express");
const { isAutherizeRole, isAuthenticatedUser } = require("../middleware/auth");
const { createUniversity, getAllUniversities, getGenAllUni, updateUniversity, getUniversityById } = require("../controllers/university");
const upload = require("../utils/upload");


const router = express.Router();

router.post("/create", isAuthenticatedUser, isAutherizeRole("super"), createUniversity);

router.get("/get", isAuthenticatedUser, isAutherizeRole("admin", "super"), getAllUniversities);

router.get("/gen/get", isAuthenticatedUser, isAutherizeRole("admin", "super"), getGenAllUni);

router.put("/update/:id", isAuthenticatedUser, isAutherizeRole("super"), upload.single("logo"), updateUniversity);

router.get("/get/:id", isAuthenticatedUser, isAutherizeRole("super"), getUniversityById);


module.exports = router;