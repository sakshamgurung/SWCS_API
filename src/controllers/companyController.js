const {CompanyServices} = require("../service/companyServices");

class CompanyController{
    async createNewCompany(request, response, next){
        try {
            const { body } = request;
            
            const companyServices = new CompanyServices();
            const result = companyServices.createNewCompany(body);
            response.json(result);
        } catch (error) {
            console.error(error.message);
            response.json({error:500}); 
        }
    }

    async getAllCompany(request, response, next){
        try{
            const companyInfoType = request.params.type;
            const result = undefined;
            
            const companyServices = new CompanyServices();
            if(companyInfoType == "company"){
                result = await companyServices.getAllCompany();
            }else if(companyInfoType == "company-detail"){
                result = await companyServices.getAllCompanyDetail();
            }else if(companyInfoType == "company-service-detail"){
                result = await companyServices.getAllCompanyServiceDetail();
            }
            response.json(result);
        }catch(error){
            console.error(error.message);
            response.json({error:500});
        }
    }

    async getCompanyById(request, response, next){
        try{
            const companyInfoType = request.params.type;
            const id = request.params.id;
            const result = undefined;

            const companyServices = new CompanyServices();
            if(companyInfoType == "company"){
                result = await companyServices.getCompanyById(id);
            }else if(companyInfoType == "company-detail"){
                result = await companyServices.getCompanyDetailById(id);
            }else if(companyInfoType == "company-service-detail"){
                result = await companyServices.getCompanyServiceDetailById(id);
            }
            response.json(result);
        }catch(error){
            console.error(error.message);
            response.json({error:500});
        }
    }

    async updateCompanyById(request, response, next){
        try{
            const companyInfoType = request.params.type;
            const id = request.params.id;
            const result = undefined;
            const updateData = request.body;

            const companyServices = new CompanyServices();
            switch(companyInfoType){
                case "company": {
                    result = await companyServices.updateCompanyById(id, updateData);
                    break;
                }
                case "company-detail": {
                    result = await companyServices.updateCompanyDetailById(id, updateData);
                    break;
                }
                case "company-service-detail": {
                    result = await companyServices.updateCompanyServiceDetailById(id, updateData);
                    break;
                }
                default:{
                    throw new Error("companyInfoType not found!!!");
                }
            }

            response.json(result);
        }catch(error){
            console.error(error.message);
            response.json({error:500});
        }
    }

    async deleteCompanyById(request, response, next){
        try {
            const id = request.params.id;
            
            const companyServices = new CompanyServices();
            const result = await companyServices.deleteCompanyById(id);
            response.json(result);
        } catch (error) {
            console.error(error.message);
            response.json({error:500});
        }
    }
}

exports.CompanyController = CompanyController;