const { AccountServices } = require("../service/accountServices");
const ApiError = require("../error/ApiError");
const _ = require("lodash");

class AccountController {
	async signUp(request, response, next) {
		try {
			const { signUpData } = request.body;
			const { role } = request.params;

			const accountServices = new AccountServices();
			const result = await accountServices.signUp(role, signUpData);
			response.json(result);
		} catch (error) {
			if (error.statusCode == 500) {
				throw ApiError.serverError("Account: signup Error:" + error.message);
			}
			throw error;
		}
	}

	async login(request, response, next) {
		try {
			const { loginData } = request.body;
			const { role } = request.params;

			let result = {};

			const accountServices = new AccountServices();
			const loginResults = await accountServices.login(role, loginData);

			if (!_.isEmpty(loginResults)) {
				result = { loginStatus: "success", token: loginResults };
				response.json(result);
			} else {
				result = { loginStatus: "failed" };
				response.json(result);
			}
		} catch (error) {
			if (error.statusCode == 500) {
				throw ApiError.serverError("Account: login Error: " + error.message);
			}
			throw error;
		}
	}

	async createSuperAdmin(request, response, next) {
		try {
			const { SuperAdminData } = request.body;
			let result = {};

			const accountServices = new AccountServices();
			const resp = await accountServices.SignUpSuperAdmin(SuperAdminData);

			result = { status: "super admin create success" };
			response.json(result);
		} catch (error) {
			if (error.statusCode == 500) {
				throw ApiError.serverError("Super Admin Error : " + err.message);
			}
			throw error;
		}
	}

	async logout(request, response, next) {
		try {
			const { logoutData } = request.body;
			const { role } = request.params;

			const accountServices = new AccountServices();
			const result = await accountServices.logout(role, logoutData);

			response.json(result);
		} catch (error) {
			if (error.statusCode == 500) {
				throw ApiError.serverError("Account: logout Error: " + error.message);
			}
			throw error;
		}
	}
}
exports.AccountController = AccountController;
