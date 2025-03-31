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
const i18nextMiddleware = require('i18next-http-middleware');
const i18nextBackend = require('i18next-fs-backend');
const dotenv = require('dotenv');
const fs = require('fs');
const expressLayouts = require('express-ejs-layouts');

// 加载配置文件
const config = require('./config/config');

// 加载环境变量
dotenv.config();

// 创建Express应用
const app = express();

// 设置开发模式标志
const isDevelopment = process.env.NODE_ENV !== 'production';
const skipMongo = process.env.SKIP_MONGO === 'true' || isDevelopment;

// 连接数据库（如果不跳过MongoDB）
if (!skipMongo) {
  require('./config/db')();
}

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
if (skipMongo) {
  // 开发模式下使用内存存储会话
  console.log('在开发模式下使用内存存储会话');
  app.use(session({
    secret: process.env.SESSION_SECRET || 'brain-training-website-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      maxAge: 14 * 24 * 60 * 60 * 1000 // 14天
    }
  }));
} else {
  // 生产模式下使用MongoDB存储会话
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
}

// 配置认证
app.use(passport.initialize());
app.use(passport.session());

// 检查并创建国际化目录
const localesPath = path.join(__dirname, 'locales');
const languages = ['en', 'zh', 'ja', 'ko', 'ar'];
const namespaces = ['common', 'home', 'games', 'auth', 'user', 'footer'];

// 确保目录存在
languages.forEach(lang => {
  const langPath = path.join(localesPath, lang);
  if (!fs.existsSync(langPath)) {
    fs.mkdirSync(langPath, { recursive: true });
    console.log(`创建语言目录: ${langPath}`);
  }
  
  // 确保每个命名空间的文件存在
  namespaces.forEach(ns => {
    const filePath = path.join(langPath, `${ns}.json`);
    if (!fs.existsSync(filePath)) {
      // 为home命名空间创建默认内容
      const defaultContent = ns === 'home' ? JSON.stringify({
        heroTitle: "Train Your Brain",
        heroDescription: "Enhance your cognitive abilities through scientifically designed brain training games",
        startTraining: "Start Training",
        learnMore: "Learn More",
        trainingPrograms: "Training Programs",
        viewGames: "View Games",
        whyChooseUs: "Why Choose Us",
        features: {
          scientific: {
            title: "Scientific Design",
            description: "Based on cognitive science research"
          },
          personalized: {
            title: "Personalized Training",
            description: "Adapts to your performance"
          },
          progress: {
            title: "Progress Tracking",
            description: "Monitor your improvement"
          },
          flexible: {
            title: "Flexible Schedule",
            description: "Train anytime, anywhere"
          }
        },
        userFeedback: "User Feedback",
        testimonials: [
          {
            initial: "J",
            name: "John Doe",
            comment: "Great improvement in memory after just two months of training!"
          },
          {
            initial: "M",
            name: "Mary Smith",
            comment: "The games are fun and challenging. I can feel the difference!"
          },
          {
            initial: "D",
            name: "Dr. Brown",
            comment: "As a cognitive scientist, I highly recommend this platform."
          }
        ],
        ctaTitle: "Start Your Brain Training Journey Today",
        ctaDescription: "Just 15 minutes a day to keep your brain at its best"
      }, null, 2) : '{}';
      
      fs.writeFileSync(filePath, defaultContent, 'utf8');
      console.log(`创建语言文件: ${filePath}`);
    }
  });
});

// 配置国际化
const initI18next = async () => {
  await i18next
    .use(i18nextBackend)
    .use(i18nextMiddleware.LanguageDetector)
    .init({
      backend: {
        loadPath: path.join(__dirname, 'locales/{{lng}}/{{ns}}.json'),
        addPath: path.join(__dirname, 'locales/{{lng}}/{{ns}}.missing.json')
      },
      detection: {
        order: ['cookie', 'querystring', 'header'],
        lookupQuerystring: 'lng',
        lookupCookie: 'i18next',
        lookupHeader: 'accept-language',
        caches: ['cookie']
      },
      fallbackLng: 'en',
      preload: ['en', 'zh', 'ja', 'ar', 'ko'],
      ns: ['common', 'home', 'games', 'auth', 'user', 'footer'],
      defaultNS: 'common',
      saveMissing: true,
      debug: process.env.NODE_ENV !== 'production',
      keySeparator: false, // 使用扁平格式的JSON翻译文件
      load: 'languageOnly', // 只加载主语言代码
      // 语言映射
      languageMap: {
        'zh-CN': 'zh',
        'zh-TW': 'zh',
        'zh-HK': 'zh'
      },
      // 设置默认语言为英文
      lng: 'en'
    });
  
  console.log('i18next 初始化完成');
};

// 配置视图引擎
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// 配置EJS布局中间件
app.use(expressLayouts);
app.set('layout', 'layouts/main');
app.set("layout extractScripts", true);
app.set("layout extractStyles", true);

// 设置全局变量，对所有视图可用
app.use((req, res, next) => {
  res.locals.config = config;
  res.locals.user = req.user || null;
  res.locals.currentLanguage = req.language || config.defaultLanguage;
  res.locals.currentUrl = req.originalUrl;
  next();
});

// 静态文件
app.use(express.static(path.join(__dirname, '../public')));

// 引入路由
const indexRoutes = require('./routes/index');
const gamesRoutes = require('./routes/games');
const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');

// 启动服务器
const startServer = async (port) => {
  try {
    // 等待i18next初始化完成
    await initI18next();
    
    // 添加i18next中间件
    app.use(i18nextMiddleware.handle(i18next));
    
    // 使用路由
    app.use('/', indexRoutes);
    app.use('/games', gamesRoutes);
    app.use('/auth', authRoutes);
    app.use('/api', apiRoutes);
    
    // 404错误处理
    app.use((req, res, next) => {
      res.status(404).render('404', { 
        title: req.t('common:notFound'),
        description: req.t('common:notFoundDescription')
      });
    });
    
    // 全局错误处理
    app.use((err, req, res, next) => {
      console.error(err.stack);
      res.status(500).render('error', { 
        title: req.t('common:serverError'),
        description: req.t('common:serverErrorDescription'),
        error: process.env.NODE_ENV === 'production' ? {} : err 
      });
    });
    
    return new Promise((resolve, reject) => {
      const server = app.listen(port)
        .on('listening', () => {
          console.log(`服务器运行在 http://localhost:${port}`);
          resolve(server);
        })
        .on('error', (err) => {
          if (err.code === 'EADDRINUSE') {
            console.log(`端口 ${port} 已被占用，尝试使用端口 ${port + 1}`);
            server.close();
            resolve(startServer(port + 1));
          } else {
            console.error('启动服务器时出错:', err);
            reject(err);
          }
        });
    });
  } catch (err) {
    console.error('服务器启动失败:', err);
    throw err;
  }
};

const PORT = process.env.PORT || 3001;
startServer(PORT).catch(err => {
  console.error('无法启动服务器:', err);
  process.exit(1);
});

module.exports = app; 