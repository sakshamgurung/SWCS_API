const mongoErrorHandler = require("./mongoErrorHandler");

const sendErrorDev = (err, res) => {
	// Operational/trusted error
	// alternative: if(err instanceof ApiError)
	if (err.isOperational) {
		res.status(err.statusCode).json({
			status: err.status,
			message: err.message,
			// error:err,
			// stack:err.stack
		});
		// Programming/other error
	} else {
		console.error("Error: ", err);
		//sending generic message
		res.status(500).json({
			status: "error",
			message: "Something went wrong!",
		});
	}
};

const sendErrorProd = (err, res) => {
	res.status(err.statusCode).json({
		status: err.status,
		message: err.message,
	});
};

module.exports = (err, req, res, next) => {
	//assigning default value
	err.statusCode = err.statusCode || 500;
	err.status = err.status || "error";
	if (process.env.NODE_ENV === "development") {
		console.log("[dev env]");
		sendErrorDev(err, res);
	} else if (process.env.NODE_ENV === "production") {
		console.log("[prod env]");
		let error = { ...err };
		if (error.name === "CastError") {
			error = mongoErrorHandler.handleCastErrorDB(error);
		}
		if (error.code === 11000) {
			error = mongoErrorHandler.handleDuplicateFieldsDB(error);
		}
		if ((error.name = "ValidationError")) {
			error = mongoErrorHandler.handleValidationErrorDB(error);
		}
		sendErrorProd(err, res);
	}
};
