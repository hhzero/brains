/**
 * 认证中间件
 * 用于检查用户是否已认证，控制对需要认证的路由的访问
 */

/**
 * 检查用户是否已认证
 * 如果未认证，重定向到登录页面
 */
exports.isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  
  // 存储当前URL，以便在登录后重定向回来
  req.session.returnTo = req.originalUrl;
  
  // 如果是API请求，返回401状态码
  if (req.originalUrl.startsWith('/api')) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'You need to be logged in to access this resource'
    });
  }
  
  // 重定向到登录页
  res.redirect('/auth/login');
};

/**
 * 检查用户是否未认证
 * 如果已认证，重定向到首页
 */
exports.isNotAuthenticated = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return next();
  }
  
  // 如果是API请求，返回403状态码
  if (req.originalUrl.startsWith('/api')) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'You are already logged in'
    });
  }
  
  // 重定向到首页
  res.redirect('/');
};

/**
 * 检查用户角色是否有访问权限
 * @param {string[]} roles - 允许访问的角色数组
 */
exports.hasRole = (roles) => {
  return (req, res, next) => {
    if (!req.isAuthenticated()) {
      // 存储当前URL，以便在登录后重定向回来
      req.session.returnTo = req.originalUrl;
      
      // 如果是API请求，返回401状态码
      if (req.originalUrl.startsWith('/api')) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'You need to be logged in to access this resource'
        });
      }
      
      // 重定向到登录页
      return res.redirect('/auth/login');
    }
    
    if (!roles.includes(req.user.role)) {
      // 如果是API请求，返回403状态码
      if (req.originalUrl.startsWith('/api')) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'You do not have permission to access this resource'
        });
      }
      
      // 如果是普通请求，重定向到403页面
      return res.status(403).render('403', {
        title: '403 - Forbidden',
        user: req.user
      });
    }
    
    return next();
  };
}; 