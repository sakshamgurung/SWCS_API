const express = require("express");
const router = express.Router();
const { WasteDumpController } = require("../controllers/wasteDumpController");
const catchAsync = require("../error/catchAsync");

const wasteDumpController = new WasteDumpController();

router.post("/customers/waste-dump", catchAsync(wasteDumpController.createNewWasteDump)); // id not used
router.get("/waste-dump/:id", catchAsync(wasteDumpController.getWasteDumpById));
// r: companyId, customerId, geoObjectId, wasteListId
router.get("/waste-dump/:ref/:id", catchAsync(wasteDumpController.getWasteDumpByRef));
router.put("/waste-dump/:id", catchAsync(wasteDumpController.updateWasteDumpById));
router.delete("/waste-dump/:id", catchAsync(wasteDumpController.deleteWasteDumpById));
module.exports = router;
