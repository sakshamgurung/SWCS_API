const express = require("express");
const router = express.Router();
const { CompanyController } = require("../controllers/companyController");
const catchAsync = require("../error/catchAsync");
const multer = require("multer");
const companyController = new CompanyController();

// image upload multer
const fileStorage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, "assets/images/");
	},
	filename: (req, file, cb) => {
		cb(null, "companyimage" + file.originalname);
	},
});

const fileFilter = (req, file, cb) => {
	if (file.mimetype === "image/png" || file.mimetype === "image/jpg" || file.mimetype === "image/jpeg") {
		cb(null, true);
	} else {
		cb(null, false);
	}
};

const upload = multer({ storage: fileStorage, fileFilter: fileFilter, limits: { fileSize: 5048576 } });

router.post("/companies", catchAsync(companyController.newCompanyInfo));
router.get("/companies/:type", catchAsync(companyController.getAllCompany)); //type: company-detail, company-service-detail
router.get("/companies/:type/:id", catchAsync(companyController.getCompanyById));
//type:company-detail, company-service-detail
//r:companyId
router.get("/companies/:type/:ref/:id", catchAsync(companyController.getCompanyByRef));
router.put("/companies/:type/:id", catchAsync(companyController.updateCompanyById));
router.delete("/companies/:id", catchAsync(companyController.deleteCompanyById));
// image upload routes
// iamgetype:profileimage, staffimage
router.post("/companies/:imagetype/:id", upload.single("photo"), catchAsync(companyController.uploadProfileImageById));

module.exports = router;
