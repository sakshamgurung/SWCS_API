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
        const {email} = signUpData;
        if(role == "company"){
            const tempCompanyLogin = await CompanyLogin.findCompanyByEmail(email);
            if(tempCompanyLogin.length != 0){
                throw ApiError.badRequest("Email already exist");
            }else{
                this.companyLogin = new CompanyLogin(signUpData);
                this.result = await this.companyLogin.save();
            }
        }else if(role == "staff"){
            const tempStaffLogin = await StaffLogin.findStaffByEmail(email);
            if(tempStaffLogin.length != 0){
                throw ApiError.badRequest("Email already exist");
            }else{
                this.staffLogin = new StaffLogin(signUpData);
                this.result = await this.staffLogin.save();
            }
        }else if(role == "customer"){
            const tempCustomerLogin = await CustomerLogin.findCustomerByEmail(email);
            if(tempCustomerLogin.length != 0){
                throw ApiError.badRequest("Email already exist");
            }else{
                this.customerLogin = new CustomerLogin(signUpData);
                this.result = await this.customerLogin.save();
            }
        }else{
            throw ApiError.badRequest("Role not found!!!");
        }
        return this.result;
    }

    async login(role, loginData){

    }

    async passwordReset(role, resetData){

    }

}

exports.AccountServices = AccountServices;