/**
 * 主路由文件
 * 处理网站的基本路由，如首页、关于页等
 */

const express = require('express');
const router = express.Router();
const config = require('../config/config');

/**
 * 首页路由
 * 显示网站的主页
 */
router.get('/', (req, res) => {
  res.render('index', { 
    title: req.t('common:title'),
    description: req.t('common:description'),
    user: req.user,
    config
  });
});

/**
 * 关于页路由
 * 显示网站的关于页面
 */
router.get('/about', (req, res) => {
  res.render('about', { 
    title: req.t('about:title'),
    description: req.t('about:description'),
    user: req.user,
    config
  });
});

/**
 * 联系页路由
 * 显示网站的联系页面
 */
router.get('/contact', (req, res) => {
  res.render('contact', { 
    title: req.t('contact:title'),
    description: req.t('contact:description'),
    user: req.user,
    config
  });
});

/**
 * 隐私政策路由
 * 显示网站的隐私政策页面
 */
router.get('/privacy', (req, res) => {
  res.render('privacy', { 
    title: req.t('privacy:title'),
    description: req.t('privacy:description'),
    user: req.user,
    config
  });
});

/**
 * 服务条款路由
 * 显示网站的服务条款页面
 */
router.get('/terms', (req, res) => {
  res.render('terms', { 
    title: req.t('terms:title'),
    description: req.t('terms:description'),
    user: req.user,
    config
  });
});

/**
 * 语言切换路由
 * 处理用户语言切换请求
 */
router.get('/language/:lang', (req, res) => {
  const lang = req.params.lang;
  
  // 验证语言代码是否有效
  const validLanguage = config.languages.find(l => l.code === lang);
  
  if (validLanguage) {
    // 如果用户已登录，更新其语言偏好
    if (req.user) {
      // 这里只设置cookie，实际更新用户的语言偏好应该在用户控制器中处理
      res.cookie('i18next', lang, { maxAge: 365 * 24 * 60 * 60 * 1000 }); // 365天
    } else {
      // 未登录用户仅设置cookie
      res.cookie('i18next', lang, { maxAge: 30 * 24 * 60 * 60 * 1000 }); // 30天
    }
  }
  
  // 重定向回上一页或首页
  const referer = req.get('Referer') || '/';
  res.redirect(referer);
});

module.exports = router; 