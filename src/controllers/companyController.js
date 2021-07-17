const { CompanyServices } = require("../service/companyServices");
const ApiError = require("../error/ApiError");

class CompanyController {
	async newCompanyInfo(request, response, next) {
		try {
			const { companyDetail, companyServiceDetail } = request.body;

			const companyServices = new CompanyServices();
			const result = await companyServices.newCompanyInfo(companyDetail, companyServiceDetail); // two database will be created

			response.json(result);
		} catch (error) {
			if (error.statusCode == 500) {
				throw ApiError.serverError("Company Error: " + error.message);
			}
			throw error;
		}
	}

	async getAllCompany(request, response, next) {
		try {
			const companyInfoType = request.params.type;
			const { query } = request;

			const companyServices = new CompanyServices();
			const result = await companyServices.getAllCompany(companyInfoType, query);

			response.json(result);
		} catch (error) {
			if (error.statusCode == 500) {
				throw ApiError.serverError("All Company Error: " + error.message);
			}
			throw error;
		}
	}

	async getCompanyById(request, response, next) {
		try {
			const companyInfoType = request.params.type;
			const companyId = request.params.id;

			const companyServices = new CompanyServices();
			const result = await companyServices.getCompanyById(companyInfoType, companyId);
			response.json(result);
		} catch (error) {
			if (error.statusCode == 500) {
				throw ApiError.serverError("Company by id Error: " + error.message);
			}
			throw error;
		}
	}

	async getCompanyByRef(request, response, next) {
		try {
			const companyInfoType = request.params.type;
			const { ref, id } = request.params;
			const { query } = request;

			const companyServices = new CompanyServices();
			const result = await companyServices.getCompanyByRef(companyInfoType, ref, id, query);

			response.json(result);
		} catch (error) {
			if (error.statusCode == 500) {
				throw ApiError.serverError("Company by ref Error: " + error.message);
			}
			throw error;
		}
	}

	async updateCompanyById(request, response, next) {
		try {
			const companyInfoType = request.params.type;
			const companyId = request.params.id;
			const { body } = request;

			const companyServices = new CompanyServices();
			const { statusCode, status } = await companyServices.updateCompanyById(companyInfoType, companyId, body);

			response.status(statusCode).send(status);
		} catch (error) {
			if (error.statusCode == 500) {
				throw ApiError.serverError("Company Error: " + error.message);
			}
			throw error;
		}
	}

	async uploadProfileImageById(request, response, next) {
		try {
			const ImageFile = request.file;
			const { id, imagetype } = request.params;
			console.log(" ID : Type : ImageFile : ", id, " +++ ", imagetype, " +++ ", ImageFile.originalname);
			const companyService = new CompanyServices();
			const result = await companyService.uploadCompanyProfileImage(ImageFile, id, imagetype);
			console.log(" Image uppp result : ", result);
			response.json(result);
		} catch (error) {
			console.log("Image upload error : ", error);
			if (error.statusCode == 500) {
				throw ApiError.serverError("Company Image Upload Error : " + error.message);
			}
			throw error;
		}
	}

	async getGraphDataByCompanyId(request, response, next) {
		try {
			const companyId = request.params.id;

			const companyServices = new CompanyServices();
			const result = await companyServices.getGraphData(companyId);
			response.json(result);
		} catch (error) {
			if (error.statusCode == 500) {
				throw ApiError.serverError("Graph Error: " + error.message);
			}
			throw error;
		}
	}

	async deleteCompanyById(request, response, next) {
		try {
			const companyId = request.params.id;

			const companyServices = new CompanyServices();
			const result = await companyServices.deleteCompanyById(companyId);
			const { statusCode, status } = result;

			response.status(statusCode).json(result);
		} catch (error) {
			if (error.statusCode == 500) {
				throw ApiError.serverError("Company Error: " + error.message);
			}
			throw error;
		}
	}
}

exports.CompanyController = CompanyController;
