/**
 * 语言中间件
 * 用于处理语言切换功能，为视图提供语言相关的变量
 */

const config = require('../config/config');

/**
 * 语言中间件
 * 在请求对象中添加语言相关的变量，并处理RTL语言
 */
module.exports = (req, res, next) => {
  // 获取当前语言
  const currentLanguage = req.language || config.defaultLanguage;
  
  // 查找当前语言的详细信息
  const languageDetails = config.languages.find(lang => lang.code === currentLanguage) || config.languages.find(lang => lang.code === config.defaultLanguage);
  
  // 在响应本地变量中添加语言相关信息
  res.locals.currentLanguage = currentLanguage;
  res.locals.languageDetails = languageDetails;
  res.locals.languages = config.languages;
  
  // 判断是否是RTL语言
  res.locals.isRTL = languageDetails.direction === 'rtl';
  
  // 添加HTML方向属性
  res.locals.htmlDir = res.locals.isRTL ? 'rtl' : 'ltr';
  
  // 如果用户已登录且其首选语言与当前语言不同，更新用户的首选语言
  if (req.user && req.user.preferredLanguage !== currentLanguage) {
    // 这里只是设置了响应本地变量
    // 在实际应用中，应该调用用户服务来更新用户的首选语言
    res.locals.shouldUpdateUserLanguage = true;
  }
  
  next();
}; 