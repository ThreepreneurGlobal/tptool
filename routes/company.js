const express = require("express");
const { isAutherizeRole, isAuthenticatedUser } = require("../middleware/auth");
const { getAllCompanies, createComp } = require("../controllers/company");
const { addCompanyInCollage } = require("../controllers/collageCompany");


const router = express.Router();


router.get("/get", isAuthenticatedUser, isAutherizeRole("super"), getAllCompanies);

router.post("/create", isAuthenticatedUser, isAutherizeRole("super", "admin"), createComp);


// Relation Route Between Company and Collage
router.post("/collage/add", isAuthenticatedUser, isAutherizeRole("admin"), addCompanyInCollage);


module.exports = router;