const mongoose  = require('mongoose');

const CompanyLogin = require('../models/companies/companyLogin');
const CompanyDetail = require('../models/companies/companyDetail');
const CompanyServiceDetail = require('../models/companies/companyServiceDetail');

class CompanyServices{

    constructor(){
        this.companyLogin = undefined; 
        this.companyDetail = undefined; 
        this.companyServiceDetail = undefined; 
        this.result = undefined;
    }
    
    async createNewCompany({companyLoginData, companyDetailData, companyServiceDetailData}){
        const session = await mongoose.startSession();
        try {
            await session.withTransaction(async() => {
                this.result = {};
                this.companyLogin = new CompanyLogin(companyLoginData);
                this.result.companyLogin = await this.companyLogin.save({session:session});

                this.companyDetail = new CompanyDetail(companyDetailData);
                this.result.companyDetail = await this.companyDetail.save({session:session});

                this.companyServiceDetail = new CompanyServiceDetail(companyServiceDetailData);
                this.result.companyServiceDetail = await this.companyServiceDetail.save({session:session});
            });
        }finally{
            session.endSession();
        }
        return this.result;
    }

    //company_login
    async getAllCompany(){
        this.result = await CompanyLogin.findAllCompany();
        return this.result;
    }
    async getCompanyById(id){
        this.result = await CompanyLogin.findCompanyById(id);
        return this.result;
    }
    //new
    async getCompanyByUUID(uuidArray){
        this.result = await CompanyLogin.findCompanyByUUID(uuidArray);
        return this.result;
    }
    //new
    async getCompanyByToken(token){
        this.result = await CompanyLogin.findCompanyByToken(token);
        return this.result;
    }
    //new
    async getCompanyByRefreshToken(refreshToken){
        this.result = await CompanyLogin.findCompanyByRefreshToken(refreshToken);
        return this.result;
    }
    //new
    async getCompanyByTimeStamp(timeStamp){
        this.result = await CompanyLogin.findCompanyByTimeStamp(timeStamp);
        return this.result;
    }
    async updateCompanyById(id, updateData){
        this.result = await CompanyLogin.updateCompanyById(id, updateData);
        return this.result;
    }

    //company_detail
    async getAllCompanyDetail(){
        this.result = await CompanyDetail.findAllCompanyDetail();
        return this.result;
    }
    async getCompanyDetailById(id){
        this.result = await CompanyDetail.findCompanyDetailById(id);
        return this.result;
    }
    //new
    async getCompanyDetailByRef(ref, id){
        this.result = await CompanyDetail.findCompanyDetailByRef(ref, id);
        return this.result;
    }
    async updateCompanyDetailById(id, updateData){
        this.result = await CompanyDetail.updateCompanyDetailById(id, updateData);
        return this.result;
    }
    
    //company_service_detail
    async getAllCompanyServiceDetail(){
        this.result = await CompanyServiceDetail.findAllCompanyServiceDetail();
        return this.result;
    }
    async getCompanyServiceDetailById(id){
        this.result = await CompanyServiceDetail.findCompanyServiceDetailById(id);
        return this.result;
    }
    //new
    async getCompanyServiceDetailByRef(ref, id){
        this.result = await CompanyServiceDetail.findCompanyServiceDetailByRef(ref, id);
        return this.result;
    }
    async updateCompanyServiceDetailById(id, updateData){
        this.result = await CompanyServiceDetail.updateCompanyServiceDetailById(id, updateData);
        return this.result;
    }
    //delete the entire company and its information
    async deleteCompanyById(id, updateData){//should delete entire info
        this.result = await CompanyLogin.deleteCompanyById(id);
        return this.result;
    }
}

exports.CompanyServices = CompanyServices;
