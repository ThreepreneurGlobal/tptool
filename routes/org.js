const express = require("express");
const { isAuthenticatedUser, isAutherizeRole } = require("../middleware/auth");
const upload = require("../utils/upload");
const { createCollage, updateCollage, getAllCollages, getDropDownCollages, getCollageById, myCollage, collageCourseDrp } = require("../controllers/org");
const { addBranchInCollage, addCourseInCollage } = require("../controllers/collageSkilll");
const { addCompanyInCollage } = require("../controllers/collageCompany");
const { getAdminStats } = require("../controllers/adminDash");


const router = express.Router();

router.post("/create", isAuthenticatedUser, isAutherizeRole("super"), createCollage);

router.get("/dashboard", isAuthenticatedUser, isAutherizeRole("admin"), getAdminStats);

router.get("/get", isAuthenticatedUser, isAutherizeRole("super"), getAllCollages);

router.get("/get/:id", isAuthenticatedUser, isAutherizeRole("super"), getCollageById);

router.get("/dd/get", isAuthenticatedUser, isAutherizeRole("super"), getDropDownCollages);

router.put("/update", isAuthenticatedUser, isAutherizeRole("admin"), upload.single("logo"), updateCollage);

router.post("/branch/add", isAuthenticatedUser, isAutherizeRole("admin"), addBranchInCollage);

router.post("/course/add", isAuthenticatedUser, isAutherizeRole("admin"), addCourseInCollage);

router.post("/company/add", isAuthenticatedUser, isAutherizeRole("admin"), addCompanyInCollage);

router.put("/get/mycollage", isAuthenticatedUser, isAutherizeRole("admin"), myCollage);

router.get("/course/dd/get", isAuthenticatedUser, isAutherizeRole("admin", "super"), collageCourseDrp);


module.exports = router;