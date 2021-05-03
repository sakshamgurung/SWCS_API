const CompanyLogin = require("../models/companies/companyLogin");
const StaffLogin = require("../models/staff/staffLogin");
const CustomerLogin = require("../models/customers/customerLogin");
const _ = require("lodash");
const jwt = require("jsonwebtoken");
const config = require("../config");

async function AddToken(userData, token, isMobile) {
	if (userData.hasOwnProperty("token")) {
		if (userData.token.hasOwnProperty("mobileDevice") && !_.isEmpty(isMobile)) {
			userData.token.mobileDevice.push(token);
		}
		if (userData.token.hasOwnProperty("webDevice") && _.isEmpty(isMobile)) {
			userData.token.webDevice.push(token);
		}
	} else {
		if (!_.isEmpty(isMobile)) {
			userData.token.mobileDevice = [token];
		} else {
			userData.token.webDevice = [token];
		}
	}
	return CompanyLogin.updateOne({ _id: userData._id }, { token: userData.token });
}

async function AddTokenV2(userType, userData, token, refreshToken, mobileDeviceId) {
	if (userData.hasOwnProperty("token")) {
		if (userData.token.hasOwnProperty("mobileDevice") && !_.isEmpty(mobileDeviceId)) {
			//mobile device
			const isMobileExist = _.findIndex(userData.token.mobileDevice, (e) => e.uuid == mobileDeviceId);

			if (!_.isEmpty(isMobileExist)) {
				//mobile uuid already exist
				userData.token.mobileDevice[isMobileExist].token = token;

				jwt.verify(token, config.jwtSecret, (err, decodedToken) => {
					userData.token.mobileDevice[isMobileExist].createdDate = decodedToken.createdDate;
				});

				userData.token.mobileDevice[isMobileExist].refreshToken = refreshToken;

				jwt.verify(refreshToken, config.jwtSecret, (err, decodedToken) => {
					userData.token.mobileDevice[isMobileExist].refreshTokenCreatedDate = decodedToken.refreshTokenCreatedDate;
				});
			} else {
				//new mobile uuid
				let createdDate, refreshTokenCreatedDate;

				jwt.verify(token, config.jwtSecret, (err, decodedToken) => {
					createdDate = decodedToken.createdDate;
				});

				jwt.verify(refreshToken, config.jwtSecret, (err, decodedToken) => {
					refreshTokenCreatedDate = decodedToken.refreshTokenCreatedDate;
				});

				userData.token.mobileDevice.push({
					uuid: mobileDeviceId,
					token,
					createdDate,
					refreshToken,
					refreshTokenCreatedDate,
				});
			}
		}

		//web devices
		if (userData.token.hasOwnProperty("webDevice") && _.isEmpty(mobileDeviceId)) {
			let createdDate;

			jwt.verify(token, config.jwtSecret, (err, decodedToken) => {
				createdDate = decodedToken.createdDate;
			});

			userData.token.webDevice.push({
				token,
				createdDate,
			});
		}
	} else {
		//complete new token
		if (!_.isEmpty(mobileDeviceId)) {
			let createdDate, refreshTokenCreatedDate;

			jwt.verify(token, config.jwtSecret, (err, decodedToken) => {
				createdDate = decodedToken.createdDate;
			});

			jwt.verify(refreshToken, config.jwtSecret, (err, decodedToken) => {
				refreshTokenCreatedDate = decodedToken.refreshTokenCreatedDate;
			});

			userData.token.mobileDevice = [
				{
					uuid: mobileDeviceId,
					token,
					createdDate,
					refreshToken,
					refreshTokenCreatedDate,
				},
			];
		} else {
			let createdDate;
			jwt.verify(token, config.jwtSecret, (err, decodedToken) => {
				createdDate = decodedToken.createdDate;
			});

			userData.token.webDevice = [{ token, createdDate }];
		}
	}
	if (userType == "company") {
		return CompanyLogin.findOneAndUpdate({ _id: userData._id }, userData);
	} else if (userType == "customer") {
		return CustomerLogin.findOneAndUpdate({ _id: userData._id }, userData);
	} else if (userType == "staff") {
		return StaffLogin.findOneAndUpdate({ _id: userData._id }, userData);
	}
}

module.exports = {
	AddToken,
	AddTokenV2,
};
