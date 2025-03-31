/**
 * 用户模型
 * 存储用户信息，包括用户名、电子邮件、密码哈希、首选语言等
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../config/config');

// 定义用户模式
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  firstName: {
    type: String,
    trim: true
  },
  lastName: {
    type: String,
    trim: true
  },
  preferredLanguage: {
    type: String,
    enum: config.languages.map(lang => lang.code),
    default: config.defaultLanguage
  },
  role: {
    type: String,
    enum: Object.values(config.userRoles),
    default: config.userRoles.USER
  },
  profilePicture: {
    type: String,
    default: '/images/default-avatar.png'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  }
}, {
  timestamps: true // 自动添加 createdAt 和 updatedAt 字段
});

// 加密密码的中间件
userSchema.pre('save', async function(next) {
  // 只有在密码被修改时才进行哈希
  if (!this.isModified('password')) return next();
  
  try {
    // 生成盐值
    const salt = await bcrypt.genSalt(10);
    // 使用盐值哈希密码
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// 验证密码的方法
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// 创建用户模型
const User = mongoose.model('User', userSchema);

module.exports = User; 