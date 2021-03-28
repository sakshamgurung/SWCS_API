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
            const {query} = request;

            const companyServices = new CompanyServices();
            const result = await companyServices.getAllCompany(companyInfoType, query);

            response.json(result);
        }catch(error){
            throw ApiError.serverError("All Company Error: " + error.message);
        }
    }

    async getCompanyById(request, response, next){
        try{
            const companyInfoType = request.params.type;
            const companyId = request.params.id;

            const companyServices = new CompanyServices();
            const result = await companyServices.getCompanyById(companyInfoType, companyId);

            response.json(result);
        }catch(error){
            throw ApiError.serverError("Company by id Error: " + error.message);
        }
    }
    
    async getCompanyByRef(request, response, next){
        try {
            const companyInfoType = request.params.type;
            const {ref, id} = request.params;
            const {query} = request;

            const companyServices = new CompanyServices();
            const result = await companyServices.getCompanyByRef(companyInfoType, ref, id, query);
            
            response.json(result);
        } catch (error) {
            throw ApiError.serverError("Company by ref Error: " + error.message);
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