const {AccountServices} = require("../service/accountServices");
const ApiError = require('../error/ApiError');

class AccountController{
    async signUp(request, response, next){
        try {
            const { signUpData } = request.body;
            const { role } = request.params;

            const accountServices = new AccountServices();
            const result = await accountServices.signUp(role, signUpData);
            response.json(result);
        } catch (error) {
            throw ApiError.serverError("Account Error: " + error.message);
        }
    }
    async login(request, response, next){
        try {
            const { loginData } = request.body;
            const { role } = request.params;
            
            const result = {loginStatus:"success"};
            response.json(result);
        } catch (error) {
            throw ApiError.serverError("Account Error: " + error.message);
        }
    }
}
exports.AccountController = AccountController;