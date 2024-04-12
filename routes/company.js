const express = require("express");
const { isAutherizeRole, isAuthenticatedUser } = require("../middleware/auth");
const { getAllCompanies, createComp } = require("../controllers/company");


const router = express.Router();


router.get("/get", isAuthenticatedUser, isAutherizeRole("super"), getAllCompanies);

router.post("/create", isAuthenticatedUser, isAutherizeRole("super", "admin"), createComp);


module.exports = router;