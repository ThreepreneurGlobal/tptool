const express = require("express");
const { isAutherizeRole, isAuthenticatedUser } = require("../middleware/auth");
const { getAllPlacements, addPlacement, getCollagePlacement, getCollagePlacementById, updatePlacement, deletePlacement, getPlacementById } = require("../controllers/placement");
const upload = require("../utils/upload");


const router = express.Router();

router.get("/get", isAuthenticatedUser, isAutherizeRole("super"), getAllPlacements);

router.get("/get/:id",isAuthenticatedUser,isAutherizeRole("super"), getPlacementById);

router.get("/collage/get", isAuthenticatedUser, isAutherizeRole("admin", "user"), getCollagePlacement);

router.get("/collage/get/:id", isAuthenticatedUser, getCollagePlacementById);

router.post("/create", isAuthenticatedUser, isAutherizeRole("admin"),
    upload.fields([{ name: "attach_student" }, { name: "attach_tpo" }]), addPlacement);

router.put("/update/:id", isAuthenticatedUser, isAutherizeRole("admin"),
    upload.fields([{ name: "attach_student" }, { name: "attach_tpo" }]), updatePlacement);

router.put("/delete/:id", isAuthenticatedUser, isAutherizeRole("admin"), deletePlacement);


module.exports = router;