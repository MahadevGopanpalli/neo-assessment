const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');

router.post('/login', AuthController.login);
router.get('/logout', AuthController.logout);

router.post('/register', AuthController.register);

router.post('/verifyCode', AuthController.verifyCode);
router.post('/resendCode', AuthController.resendCode);

router.get('/login/success', AuthController.loginSuccess);
router.get('/login/failed', AuthController.loginFailed);

router.get('/google', AuthController.googleAuth);
router.get('/google/callback', AuthController.googleAuthCallback);

router.get('/github', AuthController.githubAuth);
router.get('/github/callback', AuthController.githubAuthCallback);

router.get('/facebook', AuthController.facebookAuth);
router.get('/facebook/callback', AuthController.facebookAuthCallback);

module.exports = router;
