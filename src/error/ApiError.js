class ApiError extends Error{
    constructor(statusCode, status, message){
        super(message);
        this.statusCode = statusCode;
        this.status = status;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }

    static badRequest(message){
        return new ApiError(400, "client error", message);
    }

    static serverError(message){
        return new ApiError(500, "server error", message);
    }
}

module.exports = ApiError;