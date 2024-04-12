const express = require("express");
const userRouter = require("./user");
const orgRouter = require("./org");
const skillRouter = require("./skill");
const academyRouter = require("./academy");
const universityRouter = require("./university");
const companyRouter = require("./company");

const router = express.Router();

router.use("/user", userRouter);

router.use("/collage", orgRouter);

router.use("/skill", skillRouter);

router.use("/academy", academyRouter);

router.use("/university", universityRouter);

router.use("/company", companyRouter);

module.exports = router;