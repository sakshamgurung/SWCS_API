const ApiError = require("../error/ApiError");
const _ = require("lodash");
const config = require("../config");
const { checkForWriteErrors } = require("../utilities/errorUtil");
const moment = require("moment");

const Vehicle = require("../models/companies/vehicle");
const Subscription = require("../models/common/subscription");
const CompanyLogin = require("../models/companies/companyLogin");
const StaffLogin = require("../models/staff/staffLogin");
const CustomerLogin = require("../models/customers/customerLogin");
const jwtToken = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const SuperAdmin = require("../models/superadmin/superadmin");
const GraphData = require("../models/graph/graphData");
const { AddToken, AddTokenV2 } = require("../utilities/tokenUtil");
const validator = require("validator").default;

class AccountServices {
	constructor() {
		this.companyLogin = undefined;
		this.staffLogin = undefined;
		this.customerLogin = undefined;
		this.result = undefined;
	}

	async signUp(role, signUpData) {
		const { email, mobileNo, password } = signUpData;
		if (!validator.isEmail(email)) {
			throw ApiError.badRequest("Email is not valid");
		}
		if (_.isEmpty(password)) {
			throw ApiError.badRequest("Password is empty");
		}
		if (_.isEmpty(mobileNo)) {
			throw ApiError.badRequest("Mobile number is empty");
		}
		const encryptedPass = await bcrypt.hash(password, 12);

		const updatedData = await { ...signUpData, password: encryptedPass };

		if (role == "company") {
			//company sign up
			const tempCompanyLoginWithEmail = await CompanyLogin.find({ email }, { email: 1 });
			const tempCompanyLoginWithMobileNo = await CompanyLogin.find({ mobileNo }, { mobileNo: 1 });

			if (tempCompanyLoginWithEmail.length != 0) {
				throw ApiError.badRequest("Email already exist");
			} else if (tempCompanyLoginWithMobileNo.length != 0) {
				throw ApiError.badRequest("Mobile no already exist");
			}

			updatedData["firstTimeLogin"] = true;
			updatedData["isCompanyAccepted"] = false;
			updatedData["isCompanyDeleted"] = false;
			this.companyLogin = new CompanyLogin(updatedData);
			this.result = await this.companyLogin.save();
		} else if (role == "staff") {
			this.result = {};
			if (!updatedData.hasOwnProperty("companyId")) {
				throw ApiError.badRequest("Company id is needed for staff sign up");
			}

			const tempStaffLogin = await StaffLogin.find({ email }, { email: 1 });
			const tempStaffLoginWithMobileNo = await StaffLogin.find({ mobileNo }, { mobileNo: 1 });

			if (tempStaffLogin.length != 0) {
				throw ApiError.badRequest("Email already exist");
			} else if (tempStaffLoginWithMobileNo.length != 0) {
				throw ApiError.badRequest("Mobile not already exist");
			}

			this.staffLogin = new StaffLogin(updatedData);
			this.result.staffLogin = await this.staffLogin.save();

			// logs
			const totalVehicle = await Vehicle.find({
				companyId: signUpData.companyId,
			}).count();
			const totalStaff = await StaffLogin.find({
				companyId: signUpData.companyId,
			}).count();
			const subs = await Subscription.find({
				companyId: signUpData.companyId,
			}).count();

			this.graph = new GraphData({
				companyId: signUpData.companyId,
				subscribers: subs,
				staff: totalStaff,
				vehicle: totalVehicle,
			});

			this.result.logResult = await this.graph.save();
		} else if (role == "customer") {
			//Customer sign up
			const tempCustomerLogin = await CustomerLogin.find({ email }, { email: 1 });
			const tempCustomerLoginWithMobileNo = await CustomerLogin.find({ mobileNo }, { mobileNo: 1 });

			if (tempCustomerLogin.length != 0) {
				throw ApiError.badRequest("Email already exist");
			} else if (tempCustomerLoginWithMobileNo != 0) {
				throw ApiError.badRequest("Mobile not already exist");
			}

			updatedData["firstTimeLogin"] = true;
			this.customerLogin = new CustomerLogin(updatedData);
			this.result = await this.customerLogin.save();
		} else {
			throw ApiError.badRequest("Role not found!!!");
		}

		return this.result;
	}

	async login(role, loginData) {
		const { email, password, deviceId } = loginData;
		if (!validator.isEmail(email)) {
			throw ApiError.badRequest("Email is not valid");
		}
		if (_.isEmpty(password)) {
			throw ApiError.badRequest("Password is empty");
		}
		if (role === "company") {
			const currentCompanyUser = await CompanyLogin.find({ email });

			if (!_.isEmpty(currentCompanyUser)) {
				const isPasswordCorrect = await bcrypt.compare(password, currentCompanyUser[0].password);

				if (isPasswordCorrect) {
					// create and return token
					const authToken = await jwtToken.sign(
						{
							user: currentCompanyUser[0]._id,
							email: currentCompanyUser[0].email,
							firstTimeLogin: currentCompanyUser[0].firstTimeLogin,
							isCompanyAccepted: currentCompanyUser[0].isCompanyAccepted,
							createdDate: moment().format("YYYY-MM-DDTHH:mm:ss[Z]"),
						},
						config.jwtSecret
					);

					// const refreshToken = await jwtToken.sign(
					// 	{
					// 		user: currentCompanyUser[0]._id,
					// 		email: currentCompanyUser[0].email,
					// 		refreshTokenCreatedDate: moment().format("YYYY-MM-DDTHH:mm:ss[Z]"),
					// 	},
					// 	config.jwtSecret
					// );

					// save token to database
					const addTokenResult = await AddToken(currentCompanyUser[0].toObject(), authToken, deviceId);
					//const addTokenResult = await AddTokenV2(role, currentCompanyUser[0].toObject(), authToken, refreshToken, deviceId);
					//checkForWriteErrors(addTokenResult, "none", "Company login failed");

					//this.result = {};

					if (addTokenResult.length !== 0) {
						this.result = authToken;
						// this.result.authToken = authToken;
						// this.result.refreshToken = refreshToken;
					} else {
						throw ApiError.badRequest(" Token update failed ");
					}
				} else {
					throw ApiError.badRequest(" Password does not match ");
				}
			} else {
				throw ApiError.badRequest(" Email not found ");
			}
			return this.result;
		} else if (role === "superadmin") {
			//  handle super admin
			const isAdminValid = await SuperAdmin.find({ email });
			if (isAdminValid.length !== 0) {
				if (isAdminValid[0].password === password) {
					// success
					const authToken = await jwtToken.sign(
						{
							user: isAdminValid[0]._id,
							email: isAdminValid[0].email,
						},
						config.jwtSecret
					);

					const updateToken = await SuperAdmin.updateOne({ _id: isAdminValid[0]._id }, { token: { webDevice: authToken } });
					if (updateToken.length !== 0) {
						this.result = authToken;
					} else {
						throw ApiError.badRequest(" Token update failed ");
					}
				} else {
					throw ApiError.badRequest("Password doesnot match");
				}
			} else {
				throw ApiError.badRequest("Email doesnot match");
			}

			return this.result;
		} else if (role === "staff") {
			const currentStaffUser = await StaffLogin.find({ email });
			if (!_.isEmpty(currentStaffUser)) {
				const isPasswordCorrect = await bcrypt.compare(password, currentStaffUser[0].password);

				if (isPasswordCorrect) {
					const authToken = await jwtToken.sign(
						{
							user: currentStaffUser[0]._id,
							email: currentStaffUser[0].email,
							createdDate: moment().format("YYYY-MM-DDTHH:mm:ss[Z]"),
						},
						config.jwtSecret
					);

					const refreshToken = await jwtToken.sign(
						{
							user: currentStaffUser[0]._id,
							email: currentStaffUser[0].email,
							refreshTokenCreatedDate: moment().format("YYYY-MM-DDTHH:mm:ss[Z]"),
						},
						config.jwtSecret
					);

					// save token to database
					const addTokenResult = await AddTokenV2(role, currentStaffUser[0].toObject(), authToken, refreshToken, deviceId);
					checkForWriteErrors(addTokenResult, "none", "Customer login failed");

					this.result = {};

					if (addTokenResult.length !== 0) {
						this.result.authToken = authToken;
						this.result.refreshToken = refreshToken;
					} else {
						throw ApiError.badRequest(" Token update failed ");
					}
				} else {
					throw ApiError.badRequest(" Password does not match ");
				}
			} else {
				throw ApiError.badRequest(" Email not found ");
			}
			return this.result;
		} else if (role === "customer") {
			const currentCustomerUser = await CustomerLogin.find({ email });

			if (!_.isEmpty(currentCustomerUser)) {
				const isPasswordCorrect = await bcrypt.compare(password, currentCustomerUser[0].password);

				if (isPasswordCorrect) {
					const authToken = await jwtToken.sign(
						{
							user: currentCustomerUser[0]._id,
							email: currentCustomerUser[0].email,
							firstTimeLogin: currentCustomerUser[0].firstTimeLogin,
							createdDate: moment().format("YYYY-MM-DDTHH:mm:ss[Z]"),
						},
						config.jwtSecret
					);

					const refreshToken = await jwtToken.sign(
						{
							user: currentCustomerUser[0]._id,
							email: currentCustomerUser[0].email,
							refreshTokenCreatedDate: moment().format("YYYY-MM-DDTHH:mm:ss[Z]"),
						},
						config.jwtSecret
					);

					// save token to database
					const addTokenResult = await AddTokenV2(role, currentCustomerUser[0].toObject(), authToken, refreshToken, deviceId);
					checkForWriteErrors(addTokenResult, "none", "Customer login failed");

					this.result = {};

					if (addTokenResult.length !== 0) {
						this.result.authToken = authToken;
						this.result.refreshToken = refreshToken;
					} else {
						throw ApiError.badRequest(" Token update failed ");
					}
				} else {
					throw ApiError.badRequest(" Password does not match ");
				}
			} else {
				throw ApiError.badRequest(" Email not found ");
			}
			return this.result;
		}
	}

	async SignUpSuperAdmin(data) {
		const { email } = data;
		const isSuperAdminExist = await SuperAdmin.find({ email });
		if (isSuperAdminExist.length === 0) {
			const newSuperAdmin = new SuperAdmin(data);
			this.result = await newSuperAdmin.save();
		} else {
			throw ApiError.serverError(" SuperAdmin already exist ");
		}

		return this.result;
	}

	async logout(role, logoutData) {
		const { roleId, token, deviceId } = logoutData;

		if (role === "company") {
			let tempCompany = await CompanyLogin.findById(roleId);

			//identify mobile or web
			if (!_.isEmpty(deviceId)) {
				_.remove(tempCompany.token.mobileDevice, (e) => e == token);
			} else {
				_.remove(tempCompany.token.webDevice, (e) => e == token);
			}
			// if (!_.isEmpty(deviceId)) {
			// 	const tokenIndex = _.findIndex(tempCompany.token.mobileDevice, (e) => e.token == token);

			// 	tempCompany.token.mobileDevice[tokenIndex].token = "";
			// 	tempCompany.token.mobileDevice[tokenIndex].createdDate = moment().format("YYYY-MM-DDTHH:mm:ss[Z]");
			// 	tempCompany.token.mobileDevice[tokenIndex].refreshToken = "";
			// 	tempCompany.token.mobileDevice[tokenIndex].refreshTokenCreatedDate = moment().format("YYYY-MM-DDTHH:mm:ss[Z]");
			// } else {
			// 	_.remove(tempCompany.token.webDevice, (e) => e.token == token);
			// }

			const companyLogoutResult = await CompanyLogin.findByIdAndUpdate(roleId, tempCompany);
			return checkForWriteErrors(companyLogoutResult, "status", "Company logout failed");
		} else if (role === "superadmin") {
		} else if (role === "staff") {
			let tempStaff = await StaffLogin.findById(roleId);

			//identify mobile or web
			if (!_.isEmpty(deviceId)) {
				const tokenIndex = _.findIndex(tempStaff.token.mobileDevice, (e) => e.token == token);

				tempStaff.token.mobileDevice[tokenIndex].token = "";
				tempStaff.token.mobileDevice[tokenIndex].createdDate = moment().format("YYYY-MM-DDTHH:mm:ss[Z]");
				tempStaff.token.mobileDevice[tokenIndex].refreshToken = "";
				tempStaff.token.mobileDevice[tokenIndex].refreshTokenCreatedDate = moment().format("YYYY-MM-DDTHH:mm:ss[Z]");
			} else {
				_.remove(tempStaff.token.webDevice, (e) => e.token == token);
			}

			const staffLogoutResult = await StaffLogin.findByIdAndUpdate(roleId, tempStaff);
			return checkForWriteErrors(staffLogoutResult, "status", "Company logout failed");
		} else if (role === "customer") {
			let tempCustomer = await CustomerLogin.findById(roleId);

			//identify mobile or web
			if (!_.isEmpty(deviceId)) {
				const tokenIndex = _.findIndex(tempCustomer.token.mobileDevice, (e) => e.token == token);

				tempCustomer.token.mobileDevice[tokenIndex].token = "";
				tempCustomer.token.mobileDevice[tokenIndex].createdDate = moment().format("YYYY-MM-DDTHH:mm:ss[Z]");
				tempCustomer.token.mobileDevice[tokenIndex].refreshToken = "";
				tempCustomer.token.mobileDevice[tokenIndex].refreshTokenCreatedDate = moment().format("YYYY-MM-DDTHH:mm:ss[Z]");
			} else {
				_.remove(tempCustomer.token.webDevice, (e) => e.token == token);
			}

			const customerLogoutResult = await CustomerLogin.findByIdAndUpdate(roleId, tempCustomer);
			return checkForWriteErrors(customerLogoutResult, "status", "Company logout failed");
		}
	}

	async passwordReset(role, resetData) {
		//const { roleId, token } = resetData;
		if (role === "company") {
		} else if (role === "superadmin") {
		} else if (role === "staff") {
		} else if (role === "customer") {
		}
	}
}

exports.AccountServices = AccountServices;
