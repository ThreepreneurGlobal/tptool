const express = require("express");
const { isAuthenticatedUser } = require("../middleware/auth");
const { uploadDocument, deleteDocument } = require("../controllers/document");
const upload = require("../utils/upload");


const router = express.Router();


router.post("/upload", isAuthenticatedUser, upload.single("url"), uploadDocument);

router.put("/delete/:id", isAuthenticatedUser, deleteDocument);


module.exports = router;