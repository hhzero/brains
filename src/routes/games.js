/**
 * 游戏路由文件
 * 处理与游戏相关的路由
 */

const express = require('express');
const router = express.Router();
const config = require('../config/config');
const { isAuthenticated } = require('../middleware/auth');
const gameController = require('../controllers/gameController');

/**
 * 游戏类别列表路由
 * 显示所有游戏类别
 */
router.get('/', (req, res) => {
  res.render('games/categories', { 
    title: req.t('games:gamesTitle'),
    description: req.t('games:gamesDescription'),
    user: req.user,
    config,
    categories: config.gameCategories
  });
});

/**
 * 游戏类别详情路由
 * 显示特定类别的所有游戏
 */
router.get('/category/:categoryId', (req, res) => {
  const categoryId = req.params.categoryId;
  const category = config.gameCategories.find(cat => cat.id === categoryId);
  
  if (!category) {
    return res.status(404).render('404', { 
      title: '404 - Not Found',
      user: req.user,
      config
    });
  }
  
  res.render('games/category', { 
    title: req.t(`${category.nameKey}`),
    description: req.t(`${category.nameKey}Description`),
    user: req.user,
    config,
    category
  });
});

/**
 * 游戏详情路由
 * 显示特定游戏的详情页
 */
router.get('/:gameId', (req, res) => {
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
    return res.status(404).render('404', { 
      title: '404 - Not Found',
      user: req.user,
      config
    });
  }
  
  res.render('games/detail', { 
    title: req.t(`${game.nameKey}`),
    description: req.t(`${game.nameKey}Description`),
    user: req.user,
    config,
    game,
    category,
    difficultyLevels: config.difficultyLevels
  });
});

/**
 * 游戏启动路由
 * 启动特定游戏
 */
router.get('/:gameId/play', (req, res) => {
  const gameId = req.params.gameId;
  const difficulty = req.query.difficulty || 'easy';
  let game = null;
  let category = null;
  
  // 验证难度级别是否有效
  const validDifficulty = config.difficultyLevels.find(level => level.id === difficulty);
  if (!validDifficulty) {
    return res.redirect(`/games/${gameId}?error=invalid_difficulty`);
  }
  
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
    return res.status(404).render('404', { 
      title: '404 - Not Found',
      user: req.user,
      config
    });
  }
  
  res.render(`games/play/${gameId}`, { 
    title: req.t(`${game.nameKey}`),
    description: req.t(`${game.nameKey}Description`),
    user: req.user,
    config,
    game,
    category,
    difficulty,
    difficultyLevel: validDifficulty
  });
});

/**
 * 游戏结果保存路由
 * 保存游戏结果（仅认证用户）
 */
router.post('/:gameId/save-result', isAuthenticated, (req, res) => {
  // 此路由处理保存游戏结果的逻辑，将在游戏控制器中实现
  res.json({ success: true, message: 'Result saved successfully' });
});

/**
 * 游戏排行榜路由
 * 显示特定游戏的排行榜
 */
router.get('/:gameId/leaderboard', (req, res) => {
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
    return res.status(404).render('404', { 
      title: '404 - Not Found',
      user: req.user,
      config
    });
  }
  
  // 在真实实现中，这里会从数据库获取排行榜数据
  const leaderboard = [];
  
  res.render('games/leaderboard', { 
    title: req.t('games:leaderboardTitle', { game: req.t(`${game.nameKey}`) }),
    description: req.t('games:leaderboardDescription', { game: req.t(`${game.nameKey}`) }),
    user: req.user,
    config,
    game,
    category,
    leaderboard
  });
});

// 游戏详情页
router.get('/details/:gameId', (req, res) => {
    const gameId = req.params.gameId;
    // 根据游戏ID获取游戏详情
    // 这里可以添加游戏详情的逻辑
    res.render('games/details', { gameId });
});

// 游戏页面 - 记忆卡牌游戏
router.get('/play/memory-card', (req, res) => {
    res.render('games/play/memory-card');
});

// 游戏页面 - N-Back游戏
router.get('/play/n-back', (req, res) => {
    res.render('games/play/n-back');
});

// 保存游戏分数 - 需要登录
router.post('/save-score', isAuthenticated, gameController.saveScore);

// 排行榜
router.get('/leaderboard/:gameId', gameController.getLeaderboard);

// 用户游戏历史
router.get('/history', isAuthenticated, gameController.getUserGameHistory);

module.exports = router; 