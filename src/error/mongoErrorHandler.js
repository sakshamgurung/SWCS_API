const ApiError = require('./ApiError');

const handleCastErrorDB = (err) => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return ApiError.badRequest(message);
};

const handleDuplicateFieldsDB = (err) => {
    const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
    const message = `Duplicate field value: ${value}. Please use anothe value!`;
    return ApiError.badRequest(message);
};

const handleValidationErrorDB = (err) => {
    const errors = Object.values(err.errors).map(el => el.message);
  
    const message = `Invalid input data. ${errors.join('. ')}`;
    return ApiError.badRequest(message);
};

module.exports  = {
    handleCastErrorDB,
    handleDuplicateFieldsDB,
    handleValidationErrorDB
};