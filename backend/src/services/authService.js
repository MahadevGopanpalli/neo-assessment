const passport = require('passport');
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require('dotenv').config();

const User = require('../models/user'); 
const { generateRandomCode } = require("../config/utilities")
const emailQueue = require('../config/emailQueue'); 
const UserService = require('./userService');
 
const JWT_SECRET = process.env.JWT_SECRET || 'Testing18';

class AuthService {

    async login(body) {
        try {
          let { email, password } = body;
          email = email ? email : `${body.name.replace(/\s/g,'').toLowerCase()}@neodev.com`;
          let user = await User.findOne({ email, isDeleted : false }).lean();
          if(body.provider=='FACEBOOK' && !user)
          {
              let obj = {
                name : body.name,
                email : email,
                profile : body.response.picture.data.url,
                sm : 'facebook',
                smId : body.id,
                isActive : true
              } 
              let res = await UserService.createUser(obj);
              user = JSON.parse(JSON.stringify(res.data));
          }
          if (!user) {
            throw new Error("User not found");
          }
          if(user.isActive==false)
          {
            return { status: 2, msg: "Verification Required", data: { userData: user } };
          }
          const isMatch = (user.sm=='facebook') ? true : await bcrypt.compare(password, user.password);
          if (!isMatch) {
            throw new Error("Invalid credentials");
          }
    
          delete user.password;  // Remove password from user data
          const token = jwt.sign(user, JWT_SECRET, { expiresIn: "1h" });
    
          return { status: 0, msg: "Login successful", data: { token, userData: user } };
        } catch (e) {  console.log(e)
          return { status: 1, msg: e.message, data: {} };
        }
      }

    async registerOld(body) {
    try {
        const { name, email, password, profile } = body;
        const dupUser = await User.findOne({ email });
        if (dupUser) {
          throw new Error("User already registered");
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ name, email, password: hashedPassword,profile });
        await user.save();

        const resData = {
                _id: user._id,
                name,
                email,
                profile
          };

        return { status: 0, msg: "Registration successful", data: { userData: resData } };
    } catch (e) {  console.log(e)
        return { status: 1, msg: e.message, data: {} };
    }
    }

    async register(body) {
      try {
        const { name, email, password, profile } = body;
        const dupUser = await User.findOne({ email });
        if (dupUser && dupUser.isActive) {
          throw new Error("User already registered");
        }

        if(dupUser && !dupUser.isActive)
        {
          await User.deleteOne({ email })
        }
    
        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationCode = generateRandomCode();
        const user = new User({ name, email, password: hashedPassword, profile, verificationCode });
        await user.save();
    
        emailQueue.emit('sendEmail', {
          to: email,
          subject: 'Verification Code',
          htmlContent: `Your verification code is: ${verificationCode}`
        });

        const resData = {
          _id: user._id,
          name,
          email,
          profile
        };
    
        return { status: 0, msg: "Registration successful, please check your email for the verification code", data: { userData: resData } };
      } catch (e) {
        console.log(e);
        return { status: 1, msg: e.message, data: {} };
      }
    }
    
    async verifyCode(body) {
      const { email, code } = body;
    
      try {
        const user = await User.findOne({ email });
        if (!user) {
          return { status: 1, msg: 'User not found' };
        }
    
        if (user.verificationCode !== code) {
          return { status: 1, msg: 'Invalid verification code' };
        }
    
        user.isActive = true;
        user.verificationCode = undefined; 
        await user.save();

        const token = jwt.sign(JSON.parse(JSON.stringify(user)), JWT_SECRET, { expiresIn: "5m" });

        return { status: 0, msg: 'User verified successfully', data: { id: user._id, token : token } };
      } catch (e) {
        console.log(e);
        return { status: 1, msg: e.message, data: {} };
      }
  }

  async resendCode(body) {
    const { email } = body;
  
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return { status: 1, msg: 'User not found' };
      }
  
      const newCode = generateRandomCode();
      user.verificationCode = newCode;
      await user.save();

      emailQueue.emit('sendEmail', {
        to: email,
        subject: 'New Verification Code',
        htmlContent: `Your new verification code is: ${newCode}`
      });
  
      return { status: 0, msg: 'Verification code resent successfully' };
    } catch (e) {
      console.log(e);
      return { status: 1, msg: e.message, data: {} };
    }
  }
  
    
  getLoginSuccess(req, res) {
    if (req.user) {
      const user = JSON.parse(JSON.stringify(req.user));
      const token = jwt.sign(user, JWT_SECRET, { expiresIn: "1h" });

      res.json({
        status: 0,
        msg: "Successful",
        data: { token, userData: user },
        cookies: req.cookies,
      });
    } else {
      res.json({
        status: 1,
        msg: "Login required",
      });
    }
  }

  getLoginFailed(req, res) {
    res.json({
      status: 0,
      msg: "Failure",
    });
  }

  authenticateWithProvider(provider,scope) {
    return passport.authenticate(provider, { scope: scope });
  }

  authenticateCallback(provider, successRedirect, failureRedirect) {
    return passport.authenticate(provider, {
      successRedirect: successRedirect,
      failureRedirect: failureRedirect,
    });
  }
}

module.exports = new AuthService();
