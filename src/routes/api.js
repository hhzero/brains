/**
 * API路由文件
 * 处理网站的API请求，提供数据给前端
 */

const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const config = require('../config/config');
const gameController = require('../controllers/gameController');

/**
 * API首页
 * 提供API信息
 */
router.get('/', (req, res) => {
  res.json({
    name: config.app.name,
    version: config.app.version,
    description: config.app.description,
    endpoints: [
      { path: '/api/user', description: '用户信息API', auth: true },
      { path: '/api/games', description: '游戏列表API', auth: false },
      { path: '/api/progress', description: '进度信息API', auth: true },
      { path: '/api/leaderboard', description: '排行榜API', auth: false }
    ]
  });
});

/**
 * 用户信息API
 * 获取当前认证用户的信息
 */
router.get('/user', isAuthenticated, (req, res) => {
  // 返回用户信息，不包括敏感数据如密码
  const user = {
    id: req.user._id,
    username: req.user.username,
    email: req.user.email,
    firstName: req.user.firstName,
    lastName: req.user.lastName,
    preferredLanguage: req.user.preferredLanguage,
    profilePicture: req.user.profilePicture,
    role: req.user.role,
    isVerified: req.user.isVerified,
    lastLogin: req.user.lastLogin,
    createdAt: req.user.createdAt,
    updatedAt: req.user.updatedAt
  };
  
  res.json(user);
});

/**
 * 游戏列表API
 * 获取所有游戏分类和游戏列表
 */
router.get('/games', (req, res) => {
  res.json(config.gameCategories);
});

/**
 * 游戏详情API
 * 获取特定游戏的详细信息
 */
router.get('/games/:gameId', (req, res) => {
  const gameId = req.params.gameId;
  let game = null;
  let category = null;
  
  // 查找游戏和其所属类别
  for (const cat of config.gameCategories) {
    const foundGame = cat.games.find(g => g.id === gameId);
    if (foundGame) {
      game = foundGame;
      category = cat;
      break;
    }
  }
  
  if (!game || !category) {
    return res.status(404).json({
      error: 'Game not found'
    });
  }
  
  res.json({
    game,
    category,
    difficultyLevels: config.difficultyLevels
  });
});

/**
 * 用户进度API
 * 获取当前认证用户的进度信息
 */
router.get('/progress', isAuthenticated, (req, res) => {
  // 在实际应用中，这里会从数据库获取用户的进度数据
  res.json({
    totalScore: 0,
    totalTimeSpentSeconds: 0,
    gameStats: [],
    recentSessions: [],
    streakDays: 0,
    achievements: []
  });
});

/**
 * 排行榜API
 * 获取特定游戏的排行榜数据
 */
router.get('/leaderboard/:gameId', (req, res) => {
  const gameId = req.params.gameId;
  
  // 在实际应用中，这里会从数据库获取排行榜数据
  const leaderboard = [];
  
  res.json(leaderboard);
});

/**
 * 保存游戏结果API
 * 保存用户的游戏结果
 */
router.post('/games/:gameId/save-result', isAuthenticated, (req, res) => {
  const gameId = req.params.gameId;
  const { score, timeSpent, difficulty, gameData } = req.body;
  
  // 在实际应用中，这里会将结果保存到数据库
  
  res.json({
    success: true,
    message: 'Result saved successfully'
  });
});

/**
 * 用户设置更新API
 * 更新用户的设置
 */
router.put('/user/settings', isAuthenticated, (req, res) => {
  const { preferredLanguage } = req.body;
  
  // 在实际应用中，这里会更新用户的设置
  
  res.json({
    success: true,
    message: 'Settings updated successfully'
  });
});

/**
 * 游戏API
 * 处理前端AJAX请求
 */

// 游戏API
router.post('/games/save-score', isAuthenticated, gameController.saveScore);
router.get('/games/progress', isAuthenticated, gameController.getUserProgress);

module.exports = router; 