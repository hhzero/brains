/**
 * 大脑训练网站应用入口文件
 * 配置Express服务器、中间件和路由
 */

// 引入依赖
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const i18next = require('i18next');
const i18nextMiddleware = require('i18next-express-middleware');
const i18nextBackend = require('i18next-node-fs-backend');
const dotenv = require('dotenv');

// 加载环境变量
dotenv.config();

// 创建Express应用
const app = express();

// 连接数据库
require('./config/db')();

// 基础中间件
app.use(helmet({
  contentSecurityPolicy: false // 在开发环境中禁用CSP
}));
app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// 配置会话
app.use(session({
  secret: process.env.SESSION_SECRET || 'brain-training-website-secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ 
    mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/brain-training',
    ttl: 14 * 24 * 60 * 60 // 14天
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 14 * 24 * 60 * 60 * 1000 // 14天
  }
}));

// 配置认证
app.use(passport.initialize());
app.use(passport.session());

// 配置国际化
i18next
  .use(i18nextBackend)
  .use(i18nextMiddleware.LanguageDetector)
  .init({
    backend: {
      loadPath: path.join(__dirname, '../public/locales/{{lng}}/{{ns}}.json'),
      addPath: path.join(__dirname, '../public/locales/{{lng}}/{{ns}}.missing.json')
    },
    detection: {
      order: ['querystring', 'cookie', 'header'],
      lookupQuerystring: 'lng',
      lookupCookie: 'i18next',
      lookupHeader: 'accept-language'
    },
    fallbackLng: 'en',
    preload: ['en', 'zh', 'ja', 'ar', 'ko'],
    saveMissing: true,
    debug: process.env.NODE_ENV !== 'production'
  });

app.use(i18nextMiddleware.handle(i18next));

// 配置视图引擎
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// 静态文件
app.use(express.static(path.join(__dirname, '../public')));

// 引入路由
const indexRoutes = require('./routes/index');
const gamesRoutes = require('./routes/games');
const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');

// 使用路由
app.use('/', indexRoutes);
app.use('/games', gamesRoutes);
app.use('/auth', authRoutes);
app.use('/api', apiRoutes);

// 404错误处理
app.use((req, res, next) => {
  res.status(404).render('404', { title: '404 - Not Found' });
});

// 全局错误处理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { 
    title: '500 - Server Error',
    error: process.env.NODE_ENV === 'production' ? {} : err 
  });
});

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});

module.exports = app; 