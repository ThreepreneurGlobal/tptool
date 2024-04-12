const express = require("express");
const { isAutherizeRole, isAuthenticatedUser } = require("../middleware/auth");
const { createCollage, myCollage, updateCollage, createComp, getAllCollages } = require("../controllers/org");


const router = express.Router();

router.post("/create", isAuthenticatedUser, isAutherizeRole("super"), createCollage);

router.get("/get", isAuthenticatedUser, isAutherizeRole("super"), getAllCollages);

router.get("/get/my", isAuthenticatedUser, isAutherizeRole("admin"), myCollage);

router.put("/update", isAuthenticatedUser, isAutherizeRole("admin"), updateCollage);


module.exports = router;