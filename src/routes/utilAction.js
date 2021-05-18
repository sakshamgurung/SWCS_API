const express = require("express");
const router = express.Router();
const { UtilActionController } = require("../controllers/utilActionController");
const catchAsync = require("../error/catchAsync");

const utilActionController = new UtilActionController();

router.post("/verify", catchAsync(utilActionController.verify));
module.exports = router;
