const ApiError = require("../error/ApiError");

function checkForWriteErrors(result, returnType = "none", errorMsg) {
	if (result.hasOwnProperty("writeErrors")) {
		throw ApiError.serverError(errorMsg);
	}
	if (returnType == "none") {
		return false;
	} else if (returnType == "status") {
		return { statusCode: 200, status: "Success" };
	} else if (returnType == "result") {
		return result;
	} else {
		throw ApiError.badRequest("return type not defined");
	}
}

function checkTransactionResults(tResults, returnType = "none", errorMsg) {
	if (tResults) {
		if (returnType == "none") {
			return true;
		} else if (returnType == "status") {
			return { statusCode: 200, status: "Success" };
		} else {
			throw ApiError.badRequest("return type not defined");
		}
	} else {
		throw ApiError.serverError(errorMsg);
	}
}

module.exports = {
	checkForWriteErrors,
	checkTransactionResults,
};
