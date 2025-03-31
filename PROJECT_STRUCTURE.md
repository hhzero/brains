# 项目结构说明文档

这个文档介绍大脑训练网站项目的结构和各个文件的作用。

## 项目目录结构

```
brain-training-website/
├── README.md                 # 项目需求文档
├── PROJECT_STRUCTURE.md      # 项目结构说明文档
├── package.json              # 项目依赖管理
├── .gitignore                # Git忽略文件
├── public/                   # 静态资源文件夹
│   ├── css/                  # CSS样式文件
│   │   ├── main.css          # 主要样式
│   │   ├── normalize.css     # 样式重置
│   │   └── games/            # 游戏相关样式
│   ├── js/                   # JavaScript文件
│   │   ├── main.js           # 主要脚本
│   │   ├── i18n.js           # 国际化配置
│   │   └── games/            # 游戏相关脚本
│   ├── images/               # 图片资源
│   ├── fonts/                # 字体资源
│   └── locales/              # 国际化语言文件
│       ├── en/               # 英文
│       ├── zh/               # 中文
│       ├── ja/               # 日语
│       ├── ar/               # 阿拉伯语
│       └── ko/               # 韩语
├── src/                      # 源代码目录
│   ├── app.js                # 应用入口
│   ├── config/               # 配置文件
│   │   ├── config.js         # 主配置文件
│   │   └── db.js             # 数据库配置
│   ├── routes/               # 路由
│   │   ├── index.js          # 主路由
│   │   ├── games.js          # 游戏相关路由
│   │   ├── auth.js           # 认证相关路由
│   │   └── api.js            # API路由
│   ├── controllers/          # 控制器
│   │   ├── gameController.js # 游戏控制器
│   │   └── userController.js # 用户控制器
│   ├── models/               # 数据模型
│   │   ├── User.js           # 用户模型
│   │   └── Progress.js       # 进度模型
│   ├── views/                # 视图模板
│   │   ├── layouts/          # 布局模板
│   │   ├── partials/         # 部分视图
│   │   ├── index.ejs         # 首页
│   │   ├── games/            # 游戏相关视图
│   │   ├── profile.ejs       # 用户资料页
│   │   └── auth/             # 认证相关视图
│   ├── middleware/           # 中间件
│   │   ├── auth.js           # 认证中间件
│   │   └── language.js       # 语言中间件
│   └── utils/                # 工具函数
│       ├── logger.js         # 日志工具
│       └── helpers.js        # 辅助函数
└── tests/                    # 测试目录
    ├── unit/                 # 单元测试
    └── integration/          # 集成测试
```

## 主要文件说明

### 前端文件

- `public/css/main.css`: 网站主要样式文件，定义全局样式。
- `public/css/games/`: 包含各个游戏的特定样式，每个游戏有单独的CSS文件。
- `public/js/main.js`: 网站主要JavaScript文件，处理通用功能。
- `public/js/i18n.js`: 国际化相关的JavaScript配置和函数。
- `public/js/games/`: 包含各个游戏的JavaScript实现，每个游戏有单独的JS文件。
- `public/locales/`: 包含不同语言的翻译文件，用于网站的国际化支持。

### 后端文件

- `src/app.js`: 应用程序入口文件，配置Express服务器。
- `src/config/config.js`: 存储应用程序的配置信息。
- `src/config/db.js`: 数据库连接和配置。
- `src/routes/`: 定义API和页面的路由。
- `src/controllers/`: 包含处理请求的控制器函数。
- `src/models/`: 定义数据库模型和架构。
- `src/views/`: 包含EJS模板文件用于渲染HTML页面。
- `src/middleware/`: 自定义中间件，如认证和语言选择。
- `src/utils/`: 通用工具函数和辅助方法。

### 其他文件

- `package.json`: 定义项目依赖和脚本。
- `.gitignore`: 指定Git版本控制应忽略的文件。
- `README.md`: 项目文档，包含项目概述和要求。
- `PROJECT_STRUCTURE.md`: 本文档，解释项目结构。

## 数据模型

### 用户模型 (User.js)
存储用户信息，包括用户名、电子邮件、密码哈希、首选语言等。

### 进度模型 (Progress.js)
存储用户的游戏进度，包括已完成的游戏、得分、级别等。

## 游戏实现

每个游戏类别都有其独立的JavaScript文件和CSS文件：

1. **记忆力训练游戏**:
   - `public/js/games/memory-card.js`: 记忆卡片游戏
   - `public/js/games/number-memory.js`: 数字记忆游戏
   - `public/js/games/image-memory.js`: 图像记忆游戏
   - `public/js/games/n-back.js`: n-back游戏

2. **注意力训练游戏**:
   - `public/js/games/attention-focus.js`: 注意力集中游戏
   - `public/js/games/color-match.js`: 颜色匹配游戏
   - `public/js/games/target-tracking.js`: 目标追踪游戏

3. **逻辑思维训练游戏**:
   - `public/js/games/sudoku.js`: 数独游戏
   - `public/js/games/logic-puzzle.js`: 逻辑推理游戏
   - `public/js/games/shape-puzzle.js`: 图形拼接游戏

4. **语言能力训练游戏**:
   - `public/js/games/word-challenge.js`: 词汇挑战游戏
   - `public/js/games/grammar-fix.js`: 语法纠错游戏
   - `public/js/games/reading-comprehension.js`: 阅读理解游戏

5. **数学能力训练游戏**:
   - `public/js/games/quick-calculation.js`: 快速计算游戏
   - `public/js/games/math-puzzle.js`: 数学谜题游戏
   - `public/js/games/geometry-calculation.js`: 图形计算游戏

## 国际化支持

网站使用i18next框架实现国际化支持，支持以下语言：
- 英语 (默认)
- 中文
- 日语
- 阿拉伯语
- 韩语

每种语言都有其对应的翻译文件，存储在`public/locales/`目录下。 