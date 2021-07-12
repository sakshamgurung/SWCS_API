const express = require("express");
const router = express.Router();

const { TestController } = require("../controllers/testController");
const catchAsync = require("../error/catchAsync");

const testController = new TestController();

router.delete("/clean-test-entries", catchAsync(testController.cleanTestEntries));

module.exports = router;
