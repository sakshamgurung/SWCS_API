const ApiError = require('../error/ApiError');

const CompanyLogin = require('../models/companies/companyLogin');
const StaffLogin = require('../models/staff/staffLogin');
const CustomerLogin = require('../models/customers/customerLogin');

class AccountServices{
    constructor(){
        this.companyLogin = undefined;
        this.staffLogin = undefined;
        this.customerLogin = undefined;
        this.result = undefined;
    }

    async signUp(role, signUpData){
        if(role == "company"){
            this.companyLogin = new CompanyLogin(signUpData);
            this.result = await this.companyLogin.save();
        }else if(role == "staff"){
            this.staffLogin = new StaffLogin(signUpData);
            this.result = await this.staffLogin.save();
        }else if(role == "customer"){
            this.customerLogin = new CustomerLogin(signUpData);
            this.result = await this.customerLogin.save();
        }else{
            throw ApiError.badRequest("role not found!!!");
        }
        return this.result;
    }

    async login(role, loginData){

    }

    async passwordReset(role, resetData){

    }

}

exports.AccountServices = AccountServices;