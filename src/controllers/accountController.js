const { AccountServices } = require("../service/accountServices");
const ApiError = require("../error/ApiError");

class AccountController {
	async signUp(request, response, next) {
		try {
			const { signUpData } = request.body;
			const { role } = request.params;

			const accountServices = new AccountServices();
			const result = await accountServices.signUp(role, signUpData);
			response.json(result);
		} catch (error) {
			throw ApiError.serverError("Account Error:" + error.message);
		}
	}

	async login(request, response, next) {
		try {
			const { loginData } = request.body;
			const { role } = request.params;

			let result = {};

			const accountServices = new AccountServices();
			const loginResults = await accountServices.login(role, loginData);

			if (loginResults.length > 1) {
				result = { loginStatus: "success", token: loginResults };
				response.json(result);
			} else {
				result = { loginStatus: "failed" };
				response.json(result);
			}
		} catch (error) {
			throw ApiError.serverError("Account Error: " + error.message);
		}
	}

	async createSuperAdmin(request, response, next) {
		try {
			const { SuperAdminData } = request.body;
			const accountServices = new AccountServices();
			let result = {};
			const resp = await accountServices.SignUpSuperAdmin(SuperAdminData);
			console.log(" Create super admin result : ", resp);
			result = { status: "super admin create success" };
			response.json(result);
		} catch (err) {
			throw ApiError.serverError("Super Admin Error : " + err.message);
		}
	}
}
exports.AccountController = AccountController;
