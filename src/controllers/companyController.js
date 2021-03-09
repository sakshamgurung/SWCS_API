const {CompanyServices} = require("../service/companyServices");

class CompanyController{
    async newCompanyInfo(request, response, next){
        try {
            const { companyDetail, companyServiceDetail } = request.body;
            
            const companyServices = new CompanyServices();
            const result = await companyServices.newCompanyInfo(companyDetail, companyServiceDetail);// two database will be created
            
            response.json(result);
        } catch (error) {
            console.error(error.message);
            response.json({error:500}); 
        }
    }

    async getAllCompany(request, response, next){
        try{
            const companyInfoType = request.params.type;
            
            const companyServices = new CompanyServices();
            const result = await companyServices.getAllCompany(companyInfoType);

            response.json(result);
        }catch(error){
            console.error(error.message);
            response.json({error:500});
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
            console.error(error.message);
            response.json({error:500});
        }
    }

    async updateCompanyById(request, response, next){
        try{
            const companyInfoType = request.params.type;
            const companyId = request.params.id;
            const { body } = request;

            const companyServices = new CompanyServices();
            const result = await companyServices.updateCompanyById(companyInfoType, companyId, body);
            
            response.json(result);
        }catch(error){
            console.error(error.message);
            response.json({error:500});
        }
    }

    async deleteCompanyById(request, response, next){
        try {
            const companyId = request.params.id;
            
            const companyServices = new CompanyServices();
            const result = await companyServices.deleteCompanyById(companyId);

            response.json(result);
        } catch (error) {
            console.error(error.message);
            response.json({error:500});
        }
    }
}

exports.CompanyController = CompanyController;