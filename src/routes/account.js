const express = require("express");
const router = express.Router();
const {AccountController} = require('../controllers/accountController');
const catchAsync = require('../error/catchAsync');

const accountController = new AccountController();

router.post('/:role/sign-up',catchAsync( accountController.signUp ));//role:company,staff,customer body:signUpData{}
router.post('/:role/login', catchAsync( accountController.login ));
// route.post('/:role/password-reset', catchAsync());

module.exports = router;