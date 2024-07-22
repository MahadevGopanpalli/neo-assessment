const AuthService = require('../services/authService');
const CLIENT_URL = process.env.CLIENT_URL;

class AuthController {

   async login(req, res) {
        try {
            const data = await AuthService.login(req.body);
            return res.json(data);
        } catch (error) {
            return res.json({ status: 1, msg: error.message, data: {} });
        }
    }
    async logout(req, res)  {
      try{
        req.logout();
        return res.redirect(CLIENT_URL);
      }
      catch(e)
      {
        console.log(e)
        return res.json({});
      }
    }
    async register(req, res) {
        try {
            const data = await AuthService.register(req.body);
            return res.json(data);
        } catch (error) {
            return res.json({ status: 1, msg: error.message, data: {} });
        }
    }

    async verifyCode(req, res) {
      try {
          const data = await AuthService.verifyCode(req.body);
          return res.json(data);
      } catch (error) {
          return res.json({ status: 1, msg: error.message, data: {} });
      }
    }

    async resendCode(req, res) {
      try {
          const data = await AuthService.resendCode(req.body);
          return res.json(data);
      } catch (error) {
          return res.json({ status: 1, msg: error.message, data: {} });
      }
    }

  async loginSuccess(req, res) {
    AuthService.getLoginSuccess(req, res);
  }

  async loginFailed(req, res) {
    AuthService.getLoginFailed(req, res);
  }

  googleAuth(req, res) {
    AuthService.authenticateWithProvider('google',["profile", "email"])(req, res);
  }

  googleAuthCallback(req, res) {
    AuthService.authenticateCallback('google', CLIENT_URL, '/login/failed')(req, res);
  }

  githubAuth(req, res) {
    AuthService.authenticateWithProvider('github',['user:email'])(req, res);
  }

  githubAuthCallback(req, res) {
    AuthService.authenticateCallback('github', CLIENT_URL, '/login/failed')(req, res);
  }

  facebookAuth(req, res) {
    AuthService.authenticateWithProvider('facebook', ["profile"])(req, res);
  }

  facebookAuthCallback(req, res) {
    AuthService.authenticateCallback('facebook', CLIENT_URL, '/login/failed')(req, res);
  }
}

module.exports = new AuthController();
