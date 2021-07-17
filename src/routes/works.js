const express = require("express");
const router = express.Router();
const { WorkController } = require("../controllers/workController");
const catchAsync = require("../error/catchAsync");

const workController = new WorkController();

router.post("/companies/works", catchAsync(workController.createNewWork)); //id not used
router.get("/:role/:id/works", catchAsync(workController.getAllWork)); //role:company, id: company id or staff_group id
router.get("/works/:id", catchAsync(workController.getWorkById));
//r:companyId, staffGroupId, vehicleId, geoObjectTrackId
router.get("/works/:ref/:id", catchAsync(workController.getWorkByRef));
router.put("/works/:id", catchAsync(workController.updateWorkById));
router.delete("/works/:id", catchAsync(workController.deleteWorkById));
module.exports = router;
