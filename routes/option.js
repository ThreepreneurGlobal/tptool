const express = require("express");
const { isAuthenticatedUser } = require("../middleware/auth");
const { getAllOpts, createOption, getOptById } = require("../controllers/option");


const router = express.Router();

router.get("/get", isAuthenticatedUser, getAllOpts);

router.post("/create", isAuthenticatedUser, createOption);

router.get("/get/:id", isAuthenticatedUser, getOptById);


module.exports = router;