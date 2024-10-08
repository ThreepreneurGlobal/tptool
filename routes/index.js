const express = require("express");
const userRouter = require("./user");
const orgRouter = require("./org");
const skillRouter = require("./skill");
const academyRouter = require("./academy");
const universityRouter = require("./university");
const companyRouter = require("./company");
const placementRouter = require("./placement");
const appRouter = require("./application");
const projectRouter = require("./project");
const docRouter = require("./document");
const optRouter = require("./option");

const router = express.Router();

router.use("/user", userRouter);

router.use("/collage", orgRouter);

router.use("/skill", skillRouter);

router.use("/academy", academyRouter);

router.use("/university", universityRouter);

router.use("/company", companyRouter);

router.use("/placement", placementRouter);

router.use("/app", appRouter);

router.use("/project", projectRouter);

router.use("/document", docRouter);

router.use("/option", optRouter);

module.exports = router;