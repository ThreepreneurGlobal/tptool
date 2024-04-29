const express = require("express");
const { isAutherizeRole, isAuthenticatedUser } = require("../middleware/auth");
const { getAllCompanies, createComp, getCompById, addLocationCompany, removeLocation, getAllDDCompanies, updateCompany } = require("../controllers/company");
const { addCompanyInCollage } = require("../controllers/collageCompany");
const upload = require("../utils/upload");


const router = express.Router();


router.get("/get", isAuthenticatedUser, getAllCompanies);

router.get("/dd/get", isAuthenticatedUser, getAllDDCompanies);

router.get("/get/:id", isAuthenticatedUser, getCompById);

router.post("/create", isAuthenticatedUser, isAutherizeRole("super", "admin"), createComp);

router.put("/location/add/:id", isAuthenticatedUser, isAutherizeRole("super", "admin"), addLocationCompany);

router.put("/location/delete/:id", isAuthenticatedUser, isAutherizeRole("super", "admin"), removeLocation);

router.put("/update/:id", isAuthenticatedUser, isAutherizeRole("super"), upload.single("logo"), updateCompany);


// Relation Route Between Company and Collage
router.post("/collage/add", isAuthenticatedUser, isAutherizeRole("admin"), addCompanyInCollage);


module.exports = router;