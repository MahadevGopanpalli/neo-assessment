const bcrypt = require("bcryptjs");
const User = require('../models/user'); 
const { sendEmail } = require('../config/emailUtil');
const { generateRandomCode } = require('../config/utilities');
const emailQueue = require('../config/emailQueue'); 

class UserService {
  async createUserOld(userData) {
    try {
      const newUser = new User(userData);
      const data = await newUser.save();
      return { status: 0, msg: "User Created", data: data };
    } catch (e) {  console.log(e)
      return { status: 1, msg: e.message, data: {} };
    }
  }

  async createUser(userData) {
    try {
      const { name, email } = userData;
      const dupUser = await User.findOne({ email });
      if (dupUser) {
        throw new Error("User already registered");
      }
  
      const password = generateRandomCode();
      const hashedPassword = await bcrypt.hash(password, 10);
      userData['password'] = hashedPassword;
      const newUser = new User(userData);
      const data = await newUser.save();
      
      if(userData.sm=='facebook')
      {
        return { status: 0, msg: 'User Created', data: data };
      }
      const emailContent = `
        <h1>Welcome to NeoDev, ${name}!</h1>
        <p>We are excited to have you on board. Here are your login details:</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Password:</strong> ${password}</p>
        <p>You can reset your password using the "Forgot Password" option on the login page.</p>
        <p>Best Regards,<br>NeoDev</p>
      `;
      // await sendEmail(email, , emailContent);
      emailQueue.emit('sendEmail', {
        to: email,
        subject: 'Welcome to Our Application',
        htmlContent: emailContent
      });
      return { status: 0, msg: 'User Created', data: data };
    } catch (e) {
      console.log(e);
      return { status: 1, msg: e.message, data: {} };
    }
  }
  
  async getAllNormal(page, size, sortBy, order) {
    try {
      const skip = (page - 1) * size;
      const sortObj = {};
      sortObj[sortBy] = order;
      const [users, totalUsers] = await Promise.all([
        User.find({ isDeleted: false }).sort(sortObj).skip(skip).limit(size),
        User.countDocuments({ isDeleted: false })
      ]);

      return { status: 0, msg: "All Users", data: { users, total: totalUsers, page, size } };
    } catch (e) {  console.log(e)
      return { status: 1, msg: e.message, data: {} };
    }
  }

  async getAllUsers(body) {
    try {
      const page = body.page ? body.page : 1;
      const size = body.size ? body.size : 10;

      const skip = (page - 1) * size;
      const sortObj = {};
      sortObj[body.sortBy] = body.order;

      const match = { isDeleted: false };
      if(body.searchF && body.searchV)
      {
        match[body.searchF] = { $regex: body.searchV, $options: 'i' };
      }
      console.log(match);
      const [users, totalUsers] = await Promise.all([
        User.find(match).sort(sortObj).skip(skip).limit(size),
        User.countDocuments(match)
      ]);

      return { status: 0, msg: "All Users", data: { users, total: totalUsers, page, size } };
    } catch (e) {  console.log(e)
      return { status: 1, msg: e.message, data: {} };
    }
  }

  async updateUser(userId, updateData) {
    try {
      if(updateData['password'])
      {
        const hashedPassword = await bcrypt.hash(updateData['password'], 10);
        updateData['password'] = hashedPassword;
      }
      const data = await User.findByIdAndUpdate(userId, updateData, { new: true });
      if (!data) {
        return { status: 1, msg: "User Not Found", data: {} };
      }
      return { status: 0, msg: "User Updated", data: data };
    } catch (e) {  console.log(e)
      return { status: 1, msg: e.message, data: {} };
    }
  }

  async deleteUser(userId) {
    try {
      const data = await User.findByIdAndUpdate(userId, { isDeleted: true });
      if (!data) {
        return { status: 1, msg: "User Not Found", data: {} };
      }
      return { status: 0, msg: "User Deleted", data: data };
    } catch (e) {  console.log(e)
      return { status: 1, msg: e.message, data: {} };
    }
  }

  async getUserById(userId) {
    try {
      const data = await User.findById(userId);
      if (!data) {
        return { status: 1, msg: "User Not Found", data: {} };
      }
      return { status: 0, msg: "User Data", data: data };
    } catch (e) {  console.log(e)
      return { status: 1, msg: e.message, data: {} };
    }
  }
}

module.exports = new UserService();
