const mongoose  = require('mongoose');
const ApiError = require('../error/ApiError');

const CompanyLogin = require('../models/companies/companyLogin');
const CompanyDetail = require('../models/companies/companyDetail');
const CompanyServiceDetail = require('../models/companies/companyServiceDetail');

class CompanyServices{

    constructor(){
        this.companyDetail = undefined; 
        this.companyServiceDetail = undefined; 
        this.result = undefined;
    }
    
    async newCompanyInfo(companyDetail, companyServiceDetail){
        const session = await mongoose.startSession();
        try {
            await session.withTransaction(async() => {
                this.result = {};

                this.companyDetail = new CompanyDetail(companyDetail);
                this.result.companyDetail = await this.companyDetail.save({session:session});

                this.companyServiceDetail = new CompanyServiceDetail(companyServiceDetail);
                this.result.companyServiceDetail = await this.companyServiceDetail.save({session:session});
            });
        }finally{
            session.endSession();
        }
        return this.result;
    }

    async getAllCompany(companyInfoType){
        if(companyInfoType == "company"){
            this.result = await CompanyLogin.findAllCompany();
        }else if(companyInfoType == "company-detail"){
            this.result = await CompanyDetail.findAllCompanyDetail();
        }else if(companyInfoType == "company-service-detail"){
            this.result = await CompanyServiceDetail.findAllCompanyServiceDetail();
        }else{
            throw ApiError.badRequest("companyInfoType not found!!!");
        }
        return this.result;
    }
    async getCompanyById(companyInfoType, id){
        if(companyInfoType == "company"){
            this.result = await CompanyLogin.findCompanyById(id);
        }else if(companyInfoType == "company-detail"){
            this.result = await CompanyDetail.findCompanyDetailById(id);
        }else if(companyInfoType == "company-service-detail"){
            this.result = await CompanyServiceDetail.findCompanyServiceDetailById(id);
        }else{
            throw ApiError.badRequest("companyInfoType not found!!!");
        }
        return this.result;
    }

    async updateCompanyById(companyInfoType, id, updateData){
        if(companyInfoType == "company"){
            this.result = await CompanyLogin.updateCompanyById(id, updateData);
        }else if(companyInfoType == "company-detail"){
            this.result = await CompanyDetail.updateCompanyDetailById(id, updateData);
        }else if(companyInfoType == "company-service-detail"){
            this.result = await CompanyServiceDetail.updateCompanyServiceDetailById(id, updateData);
        }else{
            throw ApiError.badRequest("companyInfoType not found!!!");
        }
        return this.result;
    }

    async deleteCompanyById(id, updateData){
        this.result = await CompanyLogin.deleteCompanyById(id);
        return this.result;
    }
}

exports.CompanyServices = CompanyServices;
