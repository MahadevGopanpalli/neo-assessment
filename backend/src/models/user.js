const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name : { type: String, default: '' },
  email: { type: String, unique: true },
  isDeleted: { type: Boolean, default: false },
  isActive: { type: Boolean, default: false },
  password : { type: String, default: '' },
  gender: { type: String, default: 'Other' },
  strength: { type: Array, default: [] },
  about : { type: String, default: '' },
  profile : { type: String, default: '' },
  role: { type: String, default: 'user' },
  sm : { type: String, default: 'normal' },
  smId : { type: String, default: null },

  verificationCode: { type: String }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
