const express = require("express");
const { isAutherizeRole, isAuthenticatedUser } = require("../middleware/auth");
const { getAllApps, getApplicationById, applyApp, getAllCollageApps, updateApp } = require("../controllers/application");


const router = express.Router();

router.get("/get", isAuthenticatedUser, isAutherizeRole("super"), getAllApps);

router.get("/collage/get", isAuthenticatedUser, isAutherizeRole("admin"), getAllCollageApps);

router.get("/get/:id", isAuthenticatedUser, getApplicationById);

router.post("/apply", isAuthenticatedUser, isAutherizeRole("user"), applyApp);

router.put("/update/:id", isAuthenticatedUser, isAutherizeRole("admin"), updateApp);

module.exports = router;