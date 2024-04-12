const express = require("express");
const { isAutherizeRole, isAuthenticatedUser } = require("../middleware/auth");
const { createAcademy, getAllAcademy, getAllCollageAcademy, getAcademyById, updateAcademy, deleteAcademy } = require("../controllers/academy");


const router = express.Router();

router.post("/create", isAuthenticatedUser, isAutherizeRole("admin"), createAcademy);

router.get("/get", isAuthenticatedUser, isAutherizeRole("super"), getAllAcademy);

router.get("/collage/get", isAuthenticatedUser, isAutherizeRole("admin"), getAllCollageAcademy);

router.get("/get/:id", isAuthenticatedUser, getAcademyById);

router.put("/update/:id", isAuthenticatedUser, isAutherizeRole("admin"), updateAcademy);

router.put("/delete/:id", isAuthenticatedUser, isAutherizeRole("admin"), deleteAcademy);


module.exports = router;