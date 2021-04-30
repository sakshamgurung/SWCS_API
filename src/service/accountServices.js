const ApiError = require("../error/ApiError");
const _ = require("lodash");
const config = require("../config");
const { checkForWriteErrors } = require("../utilities/errorUtil");
const Vehicle = require("../models/companies/vehicle");
const Subscription = require("../models/common/subscription");
const CompanyLogin = require("../models/companies/companyLogin");
const StaffLogin = require("../models/staff/staffLogin");
const CustomerLogin = require("../models/customers/customerLogin");
const jwtToken = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { UpdateToken } = require("../utilities/updateToken");
const SuperAdmin = require("../models/superadmin/superadmin");
const GraphData = require("../models/graph/graphData");

class AccountServices {
	constructor() {
		this.companyLogin = undefined;
		this.staffLogin = undefined;
		this.customerLogin = undefined;
		this.result = undefined;
	}

	async signUp(role, signUpData) {
		const { email, mobileNo, password } = signUpData;
		const encryptedPass = await bcrypt.hash(password, 12);
		const updatedData = await {
			...signUpData,
			password: encryptedPass,
			firstTimeLogin: true,
		};

		if (role == "company") {
			const tempCompanyLoginWithEmail = await CompanyLogin.find(
				{ email },
				{ email: 1 }
			);
			const tempCompanyLoginWithMobileNo = await CompanyLogin.find(
				{ mobileNo },
				{ mobileNo: 1 }
			);

			if (tempCompanyLoginWithEmail.length != 0) {
				throw ApiError.badRequest("Email already exist");
			} else if (tempCompanyLoginWithMobileNo.length != 0) {
				throw ApiError.badRequest("Mobile no already exist");
			}
			updatedData["isCompanyAccepted"] = false;
			this.companyLogin = new CompanyLogin(updatedData);
			this.result = await this.companyLogin.save();
		} else if (role == "staff") {
			const tempStaffLogin = await StaffLogin.find(
				{ email },
				{ email: 1 }
			);
			const tempStaffLoginWithMobileNo = await StaffLogin.find(
				{ mobileNo },
				{ mobileNo: 1 }
			);

			if (tempStaffLogin.length != 0) {
				throw ApiError.badRequest("Email already exist");
			} else if (tempStaffLoginWithMobileNo.length != 0) {
				throw ApiError.badRequest("Mobile not already exist");
			}

			this.staffLogin = new StaffLogin(signUpData);
			this.result = await this.staffLogin.save();

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
			console.log(
				" Staff : Vehicle : Subs : From sub : ",
				totalStaff,
				totalVehicle,
				subs
			);
			this.graph = new GraphData({
				companyId: signUpData.companyId,
				subscribers: subs,
				staff: totalStaff,
				vehicle: totalVehicle,
			});

			const logResult = await this.graph.save();
			this.result = await { ...this.result, logResult };
		} else if (role == "customer") {
			const tempCustomerLogin = await CustomerLogin.find(
				{ email },
				{ email: 1 }
			);
			const tempCustomerLoginWithMobileNo = await CustomerLogin.find(
				{ mobileNo },
				{ mobileNo: 1 }
			);

			if (tempCustomerLogin.length != 0) {
				throw ApiError.badRequest("Email already exist");
			} else if (tempCustomerLoginWithMobileNo != 0) {
				throw ApiError.badRequest("Mobile not already exist");
			}

			this.customerLogin = new CustomerLogin(signUpData);
			this.result = await this.customerLogin.save();
		} else {
			throw ApiError.badRequest("Role not found!!!");
		}

		return this.result;
	}

	async login(role, loginData) {
		const { email, password, deviceId } = loginData;

		if (role === "company") {
			// check email
			const isEmailExist = await CompanyLogin.find({ email });
			//email exist
			if (isEmailExist.length !== 0) {
				const currentCompanyUser = isEmailExist;

				// check password
				const isPasswordCorrect = await bcrypt.compare(
					password,
					currentCompanyUser[0].password
				);

				if (isPasswordCorrect) {
					// create and return token
					const authToken = await jwtToken.sign(
						{
							user: currentCompanyUser[0]._id,
							email: currentCompanyUser[0].email,
							firstTimeLogin:
								currentCompanyUser[0].firstTimeLogin,
							isCompanyAccepted:
								currentCompanyUser[0].isCompanyAccepted,
						},
						config.jwtSecret
					);

					// save token to database
					const saveToken = await UpdateToken(
						currentCompanyUser[0],
						authToken,
						deviceId
					);

					if (saveToken.length !== 0) {
						this.result = authToken;
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

					const updateToken = await SuperAdmin.updateOne(
						{ _id: isAdminValid[0]._id },
						{ token: { webDevice: authToken } }
					);
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
			// handle staff
		} else if (role === "customer") {
			//   handle customer
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
		console.log("role:", role);
		console.log("logoutData:", logoutData);
		if (role === "company") {
			let tempCompany = await CompanyLogin.findById(roleId);

			//identify mobile or web
			if (!_.isEmpty(deviceId)) {
				_.remove(tempCompany.token.mobileDevice, (e) => e == token);
			} else {
				_.remove(tempCompany.token.webDevice, (e) => e == token);
			}

			const companyLogoutResult = await CompanyLogin.findByIdAndUpdate(
				roleId,
				tempCompany
			);
			return checkForWriteErrors(
				companyLogoutResult,
				"status",
				"Customer logout failed"
			);
		} else if (role === "superadmin") {
		} else if (role === "staff") {
		} else if (role === "customer") {
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
