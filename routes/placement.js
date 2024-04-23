const express = require("express");
const { isAutherizeRole, isAuthenticatedUser } = require("../middleware/auth");
const { getAllPlacements, addPlacement, getCollagePlacement, getCollagePlacementById } = require("../controllers/placement");
const upload = require("../utils/upload");


const router = express.Router();

router.get("/get", isAuthenticatedUser, isAutherizeRole("super"), getAllPlacements);

router.get("/collage/get", isAuthenticatedUser, isAutherizeRole("admin"), getCollagePlacement);

router.get("/collage/get/:id", isAuthenticatedUser, isAutherizeRole("admin"), getCollagePlacementById);

router.post("/create", isAuthenticatedUser, isAutherizeRole("admin"),
    upload.fields([{ name: "attach_student" }, { name: "attach_tpo" }]), addPlacement);


module.exports = router;