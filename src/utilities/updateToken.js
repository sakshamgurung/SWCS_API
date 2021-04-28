const CompanyLogin = require("../models/companies/companyLogin");

async function UpdateToken(id, token, isMobile) {
	if (isMobile) {
		return CompanyLogin.updateOne(
			{ _id: id },
			{ token: { mobileDevice: token } }
		);
	} else {
		return CompanyLogin.updateOne({ _id: id }, { token: { webDevice: token } });
	}
}

module.exports = {
	UpdateToken
};
