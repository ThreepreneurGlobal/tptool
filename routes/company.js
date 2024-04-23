const express = require("express");
const { isAutherizeRole, isAuthenticatedUser } = require("../middleware/auth");
const { getAllCompanies, createComp, getCompById, addLocationCompany, removeLocation, getAllDDCompanies } = require("../controllers/company");
const { addCompanyInCollage } = require("../controllers/collageCompany");


const router = express.Router();


router.get("/get", isAuthenticatedUser, getAllCompanies);

router.get("/dd/get", isAuthenticatedUser, getAllDDCompanies);

router.get("/get/:id", isAuthenticatedUser, getCompById);

router.post("/create", isAuthenticatedUser, isAutherizeRole("super"), createComp);

router.put("/location/add/:id", isAuthenticatedUser, isAutherizeRole("super"), addLocationCompany);

router.put("/location/delete/:id", isAuthenticatedUser, isAutherizeRole("super"), removeLocation);


// Relation Route Between Company and Collage
router.post("/collage/add", isAuthenticatedUser, isAutherizeRole("admin"), addCompanyInCollage);


module.exports = router;