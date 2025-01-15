const express = require("express");
const router = express.Router();
const {logIn, signUp, refresh, logOut} = require("../controller/Auth.controller")

router.post('/signup', signUp);
router.post('/login', logIn);
router.post('/refresh', refresh);
router.post('/logout', logOut);

module.exports = router;