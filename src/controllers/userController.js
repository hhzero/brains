/**
 * 用户控制器
 * 处理与用户相关的逻辑，如注册、登录、资料更新等
 */

const User = require('../models/User');
const Progress = require('../models/Progress');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const config = require('../config/config');

/**
 * 用户注册
 * 处理用户注册请求
 */
exports.register = async (req, res) => {
  try {
    // 检查验证错误
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('auth/register', {
        title: req.t('auth:registerTitle'),
        description: req.t('auth:registerDescription'),
        user: req.user,
        config,
        errors: errors.array(),
        formData: {
          username: req.body.username,
          email: req.body.email
        }
      });
    }

    // 检查用户名是否已存在
    const existingUsername = await User.findOne({ username: req.body.username });
    if (existingUsername) {
      return res.render('auth/register', {
        title: req.t('auth:registerTitle'),
        description: req.t('auth:registerDescription'),
        user: req.user,
        config,
        errors: [{ msg: 'auth:usernameExists' }],
        formData: {
          username: req.body.username,
          email: req.body.email
        }
      });
    }

    // 检查邮箱是否已存在
    const existingEmail = await User.findOne({ email: req.body.email });
    if (existingEmail) {
      return res.render('auth/register', {
        title: req.t('auth:registerTitle'),
        description: req.t('auth:registerDescription'),
        user: req.user,
        config,
        errors: [{ msg: 'auth:emailExists' }],
        formData: {
          username: req.body.username,
          email: req.body.email
        }
      });
    }

    // 创建新用户
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
      preferredLanguage: req.language || config.defaultLanguage
    });

    // 保存用户
    await newUser.save();

    // 创建用户进度记录
    const newProgress = new Progress({
      user: newUser._id
    });
    await newProgress.save();

    // 注册成功后重定向到登录页面
    res.redirect('/auth/login?success=registered');
  } catch (error) {
    console.error('注册错误:', error);
    res.render('auth/register', {
      title: req.t('auth:registerTitle'),
      description: req.t('auth:registerDescription'),
      user: req.user,
      config,
      errors: [{ msg: 'auth:serverError' }],
      formData: {
        username: req.body.username,
        email: req.body.email
      }
    });
  }
};

/**
 * 更新用户资料
 * 处理用户资料更新请求
 */
exports.updateProfile = async (req, res) => {
  try {
    // 检查验证错误
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('user/profile', {
        title: req.t('user:profileTitle'),
        description: req.t('user:profileDescription'),
        user: req.user,
        config,
        errors: errors.array()
      });
    }

    // 获取要更新的字段
    const { firstName, lastName, preferredLanguage } = req.body;

    // 更新用户资料
    const user = await User.findById(req.user._id);
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (preferredLanguage) user.preferredLanguage = preferredLanguage;

    await user.save();

    // 如果语言已更改，设置新的语言cookie
    if (preferredLanguage && preferredLanguage !== req.language) {
      res.cookie('i18next', preferredLanguage, { maxAge: 365 * 24 * 60 * 60 * 1000 }); // 365天
    }

    // 更新成功后重定向到资料页面
    res.redirect('/user/profile?success=profile_updated');
  } catch (error) {
    console.error('更新资料错误:', error);
    res.render('user/profile', {
      title: req.t('user:profileTitle'),
      description: req.t('user:profileDescription'),
      user: req.user,
      config,
      errors: [{ msg: 'user:serverError' }]
    });
  }
};

/**
 * 更改密码
 * 处理用户密码更改请求
 */
exports.changePassword = async (req, res) => {
  try {
    // 检查验证错误
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('user/change-password', {
        title: req.t('user:changePasswordTitle'),
        description: req.t('user:changePasswordDescription'),
        user: req.user,
        config,
        errors: errors.array()
      });
    }

    // 获取当前密码和新密码
    const { currentPassword, newPassword } = req.body;

    // 验证当前密码
    const user = await User.findById(req.user._id);
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.render('user/change-password', {
        title: req.t('user:changePasswordTitle'),
        description: req.t('user:changePasswordDescription'),
        user: req.user,
        config,
        errors: [{ msg: 'user:currentPasswordIncorrect' }]
      });
    }

    // 更新密码
    user.password = newPassword;
    await user.save();

    // 更新成功后重定向到资料页面
    res.redirect('/user/profile?success=password_changed');
  } catch (error) {
    console.error('更改密码错误:', error);
    res.render('user/change-password', {
      title: req.t('user:changePasswordTitle'),
      description: req.t('user:changePasswordDescription'),
      user: req.user,
      config,
      errors: [{ msg: 'user:serverError' }]
    });
  }
};

/**
 * 忘记密码
 * 处理忘记密码请求
 */
exports.forgotPassword = async (req, res) => {
  try {
    // 检查验证错误
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('auth/forgot-password', {
        title: req.t('auth:forgotPasswordTitle'),
        description: req.t('auth:forgotPasswordDescription'),
        user: req.user,
        config,
        errors: errors.array(),
        formData: {
          email: req.body.email
        }
      });
    }

    // 检查邮箱是否存在
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      // 为安全起见，不显示邮箱不存在的错误
      // 而是显示成功页面，假装已发送邮件
      return res.render('auth/forgot-password-confirm', {
        title: req.t('auth:forgotPasswordConfirmTitle'),
        description: req.t('auth:forgotPasswordConfirmDescription'),
        user: req.user,
        config,
        email: req.body.email
      });
    }

    // 生成密码重置令牌
    // 在实际应用中，这里需要生成令牌并发送密码重置邮件

    // 显示确认页面
    res.render('auth/forgot-password-confirm', {
      title: req.t('auth:forgotPasswordConfirmTitle'),
      description: req.t('auth:forgotPasswordConfirmDescription'),
      user: req.user,
      config,
      email: req.body.email
    });
  } catch (error) {
    console.error('忘记密码错误:', error);
    res.render('auth/forgot-password', {
      title: req.t('auth:forgotPasswordTitle'),
      description: req.t('auth:forgotPasswordDescription'),
      user: req.user,
      config,
      errors: [{ msg: 'auth:serverError' }],
      formData: {
        email: req.body.email
      }
    });
  }
};

/**
 * 重置密码
 * 处理重置密码请求
 */
exports.resetPassword = async (req, res) => {
  try {
    // 检查验证错误
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('auth/reset-password', {
        title: req.t('auth:resetPasswordTitle'),
        description: req.t('auth:resetPasswordDescription'),
        user: req.user,
        config,
        errors: errors.array(),
        token: req.body.token
      });
    }

    // 验证令牌并查找用户
    // 在实际应用中，这里需要验证令牌的有效性并查找对应的用户

    // 如果令牌无效，显示错误
    // 为演示目的，假设令牌总是无效
    return res.render('auth/reset-password', {
      title: req.t('auth:resetPasswordTitle'),
      description: req.t('auth:resetPasswordDescription'),
      user: req.user,
      config,
      errors: [{ msg: 'auth:invalidToken' }],
      token: req.body.token
    });

    // 如果令牌有效，更新密码
    // 在实际应用中，这里需要更新用户的密码

    // 密码重置成功后重定向到登录页面
    // res.redirect('/auth/login?success=password_reset');
  } catch (error) {
    console.error('重置密码错误:', error);
    res.render('auth/reset-password', {
      title: req.t('auth:resetPasswordTitle'),
      description: req.t('auth:resetPasswordDescription'),
      user: req.user,
      config,
      errors: [{ msg: 'auth:serverError' }],
      token: req.body.token
    });
  }
}; 