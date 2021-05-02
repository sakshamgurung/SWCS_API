const companyDetails = require("../models/companies/companyDetail");

async function uploadImage(company, imagedata) {
	console.log(" Company : image data : ", company, " +++ ", imagedata);
	return "image upload on progress";
}

module.exports = { uploadImage };
