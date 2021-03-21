const {CompanyServices} = require("../service/companyServices");
const ApiError = require('../error/ApiError');

class CompanyController{
    async newCompanyInfo(request, response, next){
        try {
            const { companyDetail, companyServiceDetail } = request.body;
            
            const companyServices = new CompanyServices();
            const result = await companyServices.newCompanyInfo(companyDetail, companyServiceDetail);// two database will be created
            
            response.json(result);
        } catch (error) {
            throw ApiError.serverError("Company Error: " + error.message);
        }
    }

    async getAllCompany(request, response, next){
        try{
            const companyInfoType = request.params.type;
            
            const companyServices = new CompanyServices();
            const result = await companyServices.getAllCompany(companyInfoType);

            response.json(result);
        }catch(error){
            throw ApiError.serverError("All Company Error: " + error.message);
        }
    }

    async getCompanyById(request, response, next){
        try{
            const companyInfoType = request.params.type;
            const companyId = request.params.id;
            console.log("companyInfoType: ", companyInfoType);
            console.log("companyId: ", companyId);
            const companyServices = new CompanyServices();
            const result = await companyServices.getCompanyById(companyInfoType, companyId);

            response.json(result);
        }catch(error){
            throw ApiError.serverError("Company by id Error: " + error.message);
        }
    }

    async updateCompanyById(request, response, next){
        try{
            const companyInfoType = request.params.type;
            const companyId = request.params.id;
            const { body } = request;

            const companyServices = new CompanyServices();
            const {statusCode, status} = await companyServices.updateCompanyById(companyInfoType, companyId, body);
            
            response.status(statusCode).send(status);
        }catch(error){
            throw ApiError.serverError("Company Error: " + error.message);
        }
    }

    async deleteCompanyById(request, response, next){
        try {
            const companyId = request.params.id;
            
            const companyServices = new CompanyServices();
            const {statusCode, status} = await companyServices.deleteCompanyById(companyId);

            response.status(statusCode).send(status);
        } catch (error) {
            throw ApiError.serverError("Company Error: " + error.message);
        }
    }
}

exports.CompanyController = CompanyController;