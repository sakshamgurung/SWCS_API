const express = require("express");
const router = express.Router();
const {AccountController} = require('../controllers/accountController');
const catchAsync = require('../error/catchAsync');

router.post('/:role/sign-up',catchAsync( new AccountController().signUp ));//role:company,staff,customer body:signUpData{}
router.post('/:role/login', catchAsync( new AccountController().login ));
// route.post('/:role/password-reset', catchAsync());

module.exports = router;