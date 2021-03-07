const {AccountServices} = require("../service/accountServices");

class AccountController{
    async signUp(request, response, next){
        try {
            const { signUpData } = request.body;
            const { role } = request.params;

            const accountServices = new AccountServices();
            const result = accountServices.signUp(role, signUpData);
            response.json(result);
        } catch (error) {
            console.error(error.message);
            response.json({error:500}); 
        }
    }
    async login(request, response, next){
        try {
            const { loginData } = request.body;
            const { role } = request.params;
            
            const result = {loginStatus:"success"};
            response.json(result);
        } catch (error) {
            console.error(error.message);
            response.json({error:500}); 
        }
    }
}
exports.AccountController = AccountController;