const CompanyLogin = require("../models/companies/companyLogin");
const _ = require("lodash");

async function UpdateToken(userData, token, isMobile) {
	if (userData.hasOwnProperty("token")) {
		if (
			userData.token.hasOwnProperty("mobileDevice") &&
			!_.isEmpty(isMobile)
		) {
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
	return CompanyLogin.updateOne(
		{ _id: userData._id },
		{ token: userData.token }
	);
}

module.exports = {
	UpdateToken,
};
