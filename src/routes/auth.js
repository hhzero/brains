/**
 * 认证路由文件
 * 处理用户登录、注册、密码重置等认证相关路由
 */

const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const passport = require('passport');
const config = require('../config/config');
const { isAuthenticated, isNotAuthenticated } = require('../middleware/auth');

/**
 * 登录页面路由
 * 显示用户登录页面
 */
router.get('/login', isNotAuthenticated, (req, res) => {
  res.render('auth/login', {
    title: req.t('auth:loginTitle'),
    description: req.t('auth:loginDescription'),
    user: req.user,
    config,
    error: req.query.error,
    success: req.query.success
  });
});

/**
 * 登录处理路由
 * 处理用户登录请求
 */
router.post('/login', isNotAuthenticated, [
  // 验证表单数据
  body('username')
    .trim()
    .notEmpty().withMessage('auth:usernameRequired'),
  body('password')
    .notEmpty().withMessage('auth:passwordRequired')
], (req, res, next) => {
  // 检查验证错误
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('auth/login', {
      title: req.t('auth:loginTitle'),
      description: req.t('auth:loginDescription'),
      user: req.user,
      config,
      errors: errors.array(),
      formData: {
        username: req.body.username
      }
    });
  }

  // 使用Passport进行认证
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.render('auth/login', {
        title: req.t('auth:loginTitle'),
        description: req.t('auth:loginDescription'),
        user: req.user,
        config,
        error: req.t(info.message),
        formData: {
          username: req.body.username
        }
      });
    }
    
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      
      // 更新用户的最后登录时间（在实际应用中，这会在用户控制器中处理）
      
      // 重定向到之前的页面或默认页面
      const redirectTo = req.session.returnTo || '/';
      delete req.session.returnTo;
      return res.redirect(redirectTo);
    });
  })(req, res, next);
});

/**
 * 注册页面路由
 * 显示用户注册页面
 */
router.get('/register', isNotAuthenticated, (req, res) => {
  res.render('auth/register', {
    title: req.t('auth:registerTitle'),
    description: req.t('auth:registerDescription'),
    user: req.user,
    config
  });
});

/**
 * 注册处理路由
 * 处理用户注册请求
 */
router.post('/register', isNotAuthenticated, [
  // 验证表单数据
  body('username')
    .trim()
    .notEmpty().withMessage('auth:usernameRequired')
    .isLength({ min: 3, max: 30 }).withMessage('auth:usernameLength')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('auth:usernameFormat'),
  body('email')
    .trim()
    .notEmpty().withMessage('auth:emailRequired')
    .isEmail().withMessage('auth:emailFormat'),
  body('password')
    .notEmpty().withMessage('auth:passwordRequired')
    .isLength({ min: 6 }).withMessage('auth:passwordLength'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('auth:passwordsNotMatch');
      }
      return true;
    })
], (req, res) => {
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

  // 这里处理注册逻辑
  // 在实际应用中，这会在用户控制器中处理
  
  // 注册成功后重定向到登录页面
  res.redirect('/auth/login?success=registered');
});

/**
 * 忘记密码页面路由
 * 显示忘记密码页面
 */
router.get('/forgot-password', isNotAuthenticated, (req, res) => {
  res.render('auth/forgot-password', {
    title: req.t('auth:forgotPasswordTitle'),
    description: req.t('auth:forgotPasswordDescription'),
    user: req.user,
    config
  });
});

/**
 * 忘记密码处理路由
 * 处理忘记密码请求
 */
router.post('/forgot-password', isNotAuthenticated, [
  // 验证表单数据
  body('email')
    .trim()
    .notEmpty().withMessage('auth:emailRequired')
    .isEmail().withMessage('auth:emailFormat')
], (req, res) => {
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

  // 这里处理忘记密码逻辑
  // 在实际应用中，这会在用户控制器中处理

  // 发送密码重置邮件后，显示确认页面
  res.render('auth/forgot-password-confirm', {
    title: req.t('auth:forgotPasswordConfirmTitle'),
    description: req.t('auth:forgotPasswordConfirmDescription'),
    user: req.user,
    config,
    email: req.body.email
  });
});

/**
 * 重置密码页面路由
 * 显示重置密码页面
 */
router.get('/reset-password/:token', isNotAuthenticated, (req, res) => {
  const token = req.params.token;
  
  // 在实际应用中，这里需要验证token的有效性
  
  res.render('auth/reset-password', {
    title: req.t('auth:resetPasswordTitle'),
    description: req.t('auth:resetPasswordDescription'),
    user: req.user,
    config,
    token
  });
});

/**
 * 重置密码处理路由
 * 处理重置密码请求
 */
router.post('/reset-password', isNotAuthenticated, [
  // 验证表单数据
  body('token')
    .notEmpty().withMessage('auth:tokenRequired'),
  body('password')
    .notEmpty().withMessage('auth:passwordRequired')
    .isLength({ min: 6 }).withMessage('auth:passwordLength'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('auth:passwordsNotMatch');
      }
      return true;
    })
], (req, res) => {
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

  // 这里处理重置密码逻辑
  // 在实际应用中，这会在用户控制器中处理

  // 密码重置成功后重定向到登录页面
  res.redirect('/auth/login?success=password_reset');
});

/**
 * 登出路由
 * 处理用户登出请求
 */
router.get('/logout', isAuthenticated, (req, res) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect('/');
  });
});

module.exports = router; 