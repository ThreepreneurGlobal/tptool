const express = require("express");
const { isAuthenticatedUser } = require("../middleware/auth");
const { createProject, updateProject } = require("../controllers/project");
const upload = require("../utils/upload");


const router = express.Router();

router.post("/create", isAuthenticatedUser, upload.fields([{ name: "logo" }, { name: "demo_img" }]), createProject);

router.put("/update/:id", isAuthenticatedUser, upload.fields([{ name: "logo" }, { name: "demo_img" }]), updateProject);


module.exports = router;