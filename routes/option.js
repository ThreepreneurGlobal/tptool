const express = require("express");
const { isAuthenticatedUser, isAutherizeRole } = require("../middleware/auth");
const { getAllOpts, createOption, getOptById, getDrpOpts, editOpt } = require("../controllers/option");


const router = express.Router();

router.get("/get", isAuthenticatedUser, getAllOpts);

router.get("/drp/get", isAuthenticatedUser, isAutherizeRole("admin", "super"), getDrpOpts);

router.post("/create", isAuthenticatedUser, createOption);

router.get("/get/:id", isAuthenticatedUser, getOptById);

router.put("/update/:id", isAuthenticatedUser, isAutherizeRole("super"), editOpt);


module.exports = router;