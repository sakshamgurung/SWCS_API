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
        const {email, mobileNo} = signUpData;
        if(role == "company"){
            const tempCompanyLoginWithEmail = await CompanyLogin.find({email}, {email:1});
            const tempCompanyLoginWithMobileNo = await CompanyLogin.find({mobileNo}, {mobileNo:1});
            
            if(tempCompanyLoginWithEmail.length != 0){
                throw ApiError.badRequest("Email already exist");
            }else if(tempCompanyLoginWithMobileNo.length != 0){
                throw ApiError.badRequest("Mobile no already exist");
            }

            this.companyLogin = new CompanyLogin(signUpData);
            this.result = await this.companyLogin.save();
            
        }else if(role == "staff"){
            const tempStaffLogin = await StaffLogin.find({email}, {email:1});
            const tempStaffLoginWithMobileNo = await StaffLogin.find({mobileNo}, {mobileNo:1});

            if(tempStaffLogin.length != 0){
                throw ApiError.badRequest("Email already exist");
            }else if(tempStaffLoginWithMobileNo.length != 0){
                throw ApiError.badRequest("Mobile not already exist");
            }
            
            this.staffLogin = new StaffLogin(signUpData);
            this.result = await this.staffLogin.save();
            
        }else if(role == "customer"){
            const tempCustomerLogin = await CustomerLogin.find({email}, {email:1});
            const tempCustomerLoginWithMobileNo = await CustomerLogin.find({mobileNo}, {mobileNo:1});

            if(tempCustomerLogin.length != 0){
                throw ApiError.badRequest("Email already exist");
            }else if(tempCustomerLoginWithMobileNo != 0){
                throw ApiError.badRequest("Mobile not already exist");
            }
            
            this.customerLogin = new CustomerLogin(signUpData);
            this.result = await this.customerLogin.save();
            
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