const express = require("express");
const { isAutherizeRole, isAuthenticatedUser } = require("../middleware/auth");
const { createUniversity, getAllUniversities, getGenAllUni } = require("../controllers/university");


const router = express.Router();

router.post("/create", isAuthenticatedUser, isAutherizeRole("super"), createUniversity);

router.get("/get", isAuthenticatedUser, isAutherizeRole("admin", "super"), getAllUniversities);

router.get("/gen/get", isAuthenticatedUser, isAutherizeRole("admin", "super"), getGenAllUni);


module.exports = router;