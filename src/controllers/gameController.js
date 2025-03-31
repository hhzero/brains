/**
 * 游戏控制器
 * 处理与游戏相关的逻辑，如保存游戏结果、获取排行榜等
 */

const Progress = require('../models/Progress');
const User = require('../models/User');
const config = require('../config/config');

/**
 * 保存游戏结果
 * 处理保存用户游戏结果的请求
 */
exports.saveGameResult = async (req, res) => {
  try {
    // 从请求中获取数据
    const { gameId } = req.params;
    const { score, timeSpent, difficulty, gameData } = req.body;
    
    // 验证游戏ID是否有效
    let gameFound = false;
    for (const category of config.gameCategories) {
      if (category.games.some(game => game.id === gameId)) {
        gameFound = true;
        break;
      }
    }
    
    if (!gameFound) {
      return res.status(404).json({
        success: false,
        message: 'Game not found'
      });
    }
    
    // 验证难度级别是否有效
    const validDifficulty = config.difficultyLevels.find(level => level.id === difficulty);
    if (!validDifficulty) {
      return res.status(400).json({
        success: false,
        message: 'Invalid difficulty level'
      });
    }
    
    // 查找用户的进度记录
    let progress = await Progress.findOne({ user: req.user._id });
    
    // 如果没有进度记录，创建一个新的
    if (!progress) {
      progress = new Progress({
        user: req.user._id
      });
    }
    
    // 创建新的游戏会话记录
    const gameSession = {
      gameId,
      difficulty,
      score: parseInt(score, 10) || 0,
      timeSpentSeconds: parseInt(timeSpent, 10) || 0,
      completedAt: new Date(),
      gameData
    };
    
    // 更新最近的游戏会话记录
    progress.recentSessions.unshift(gameSession);
    
    // 限制最近会话记录数量为10
    if (progress.recentSessions.length > 10) {
      progress.recentSessions = progress.recentSessions.slice(0, 10);
    }
    
    // 更新游戏统计数据
    let gameStat = progress.gameStats.find(stat => stat.gameId === gameId);
    
    if (!gameStat) {
      // 如果没有该游戏的统计数据，创建一个新的
      gameStat = {
        gameId,
        playCount: 0,
        bestScore: 0,
        totalScore: 0,
        averageScore: 0,
        totalTimeSpentSeconds: 0,
        highestLevel: 'easy',
        lastPlayed: new Date()
      };
      progress.gameStats.push(gameStat);
    } else {
      // 找到统计数据的索引
      const gameStatIndex = progress.gameStats.findIndex(stat => stat.gameId === gameId);
      gameStat = progress.gameStats[gameStatIndex];
    }
    
    // 更新统计数据
    gameStat.playCount += 1;
    gameStat.totalScore += gameSession.score;
    gameStat.averageScore = Math.round(gameStat.totalScore / gameStat.playCount);
    gameStat.totalTimeSpentSeconds += gameSession.timeSpentSeconds;
    gameStat.lastPlayed = new Date();
    
    // 更新最高分
    if (gameSession.score > gameStat.bestScore) {
      gameStat.bestScore = gameSession.score;
    }
    
    // 更新最高难度级别
    const difficultyLevels = config.difficultyLevels.map(level => level.id);
    const currentDifficultyIndex = difficultyLevels.indexOf(difficulty);
    const highestDifficultyIndex = difficultyLevels.indexOf(gameStat.highestLevel);
    
    if (currentDifficultyIndex > highestDifficultyIndex) {
      gameStat.highestLevel = difficulty;
    }
    
    // 更新总分和总时间
    progress.totalScore += gameSession.score;
    progress.totalTimeSpentSeconds += gameSession.timeSpentSeconds;
    progress.lastActive = new Date();
    
    // 保存更新后的进度记录
    await progress.save();
    
    // 返回成功响应
    res.json({
      success: true,
      message: 'Game result saved successfully',
      gameSession,
      progress: {
        totalScore: progress.totalScore,
        bestScore: gameStat.bestScore,
        playCount: gameStat.playCount,
        averageScore: gameStat.averageScore
      }
    });
  } catch (error) {
    console.error('保存游戏结果错误:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * 保存游戏分数
 * 处理保存用户游戏分数的请求 (简化版)
 */
exports.saveScore = async (req, res) => {
  try {
    // 从请求中获取数据
    const { gameId, score, timeElapsed, accuracy, nLevel, correctResponses, incorrectResponses } = req.body;

    // 查找用户的进度记录
    let progress = await Progress.findOne({ user: req.user._id });

    // 如果没有进度记录，创建一个新的
    if (!progress) {
      progress = new Progress({
        user: req.user._id,
        totalScore: 0,
        totalTimeSpentSeconds: 0,
        gameStats: [],
        recentSessions: [],
        streakDays: 0,
        achievements: [],
        lastActive: new Date()
      });
    }

    // 创建新的游戏会话记录
    const gameSession = {
      gameId,
      difficulty: nLevel ? `level-${nLevel}` : 'medium',
      score: parseInt(score, 10) || 0,
      timeSpentSeconds: parseInt(timeElapsed, 10) || 0,
      completedAt: new Date(),
      gameData: {
        accuracy,
        nLevel,
        correctResponses,
        incorrectResponses
      }
    };

    // 更新最近的游戏会话记录
    progress.recentSessions.unshift(gameSession);

    // 限制最近会话记录数量为10
    if (progress.recentSessions.length > 10) {
      progress.recentSessions = progress.recentSessions.slice(0, 10);
    }

    // 更新游戏统计数据
    let gameStat = progress.gameStats.find(stat => stat.gameId === gameId);

    if (!gameStat) {
      // 如果没有该游戏的统计数据，创建一个新的
      gameStat = {
        gameId,
        playCount: 0,
        bestScore: 0,
        totalScore: 0,
        averageScore: 0,
        totalTimeSpentSeconds: 0,
        highestLevel: 'level-1',
        lastPlayed: new Date()
      };
      progress.gameStats.push(gameStat);
    }

    // 更新统计数据
    gameStat.playCount += 1;
    gameStat.totalScore += gameSession.score;
    gameStat.averageScore = Math.round(gameStat.totalScore / gameStat.playCount);
    gameStat.totalTimeSpentSeconds += gameSession.timeSpentSeconds;
    gameStat.lastPlayed = new Date();

    // 更新最高分
    if (gameSession.score > gameStat.bestScore) {
      gameStat.bestScore = gameSession.score;
    }

    // 如果是N-Back游戏，更新最高N级别
    if (gameId === 'n-back' && nLevel) {
      const currentLevel = `level-${nLevel}`;
      const currentLevelNum = parseInt(nLevel, 10) || 1;
      const highestLevelNum = parseInt(gameStat.highestLevel.replace('level-', ''), 10) || 0;
      
      if (currentLevelNum > highestLevelNum) {
        gameStat.highestLevel = currentLevel;
      }
    }

    // 更新总分和总时间
    progress.totalScore += gameSession.score;
    progress.totalTimeSpentSeconds += gameSession.timeSpentSeconds;
    progress.lastActive = new Date();

    // 保存更新后的进度记录
    await progress.save();

    // 返回成功响应
    res.json({
      success: true,
      message: 'Score saved successfully',
      score: gameSession.score,
      totalScore: progress.totalScore
    });
  } catch (error) {
    console.error('保存分数错误:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving score'
    });
  }
};

/**
 * 获取排行榜
 * 获取特定游戏的排行榜数据
 */
exports.getLeaderboard = async (req, res) => {
  try {
    const { gameId } = req.params;
    
    // 验证游戏ID是否有效
    let gameFound = false;
    for (const category of config.gameCategories) {
      if (category.games.some(game => game.id === gameId)) {
        gameFound = true;
        break;
      }
    }
    
    if (!gameFound) {
      return res.status(404).json({
        success: false,
        message: 'Game not found'
      });
    }
    
    // 查找所有有该游戏统计数据的进度记录
    const progresses = await Progress.find({
      'gameStats.gameId': gameId
    }).populate('user', 'username profilePicture');
    
    if (!progresses || progresses.length === 0) {
      return res.render('games/leaderboard', {
        gameId,
        leaderboard: []
      });
    }
    
    // 提取排行榜数据
    const leaderboardData = [];
    
    for (const progress of progresses) {
      const gameStat = progress.gameStats.find(stat => stat.gameId === gameId);
      
      if (gameStat && progress.user) {
        leaderboardData.push({
          username: progress.user.username,
          profilePicture: progress.user.profilePicture || '/images/default-avatar.png',
          bestScore: gameStat.bestScore,
          playCount: gameStat.playCount,
          averageScore: gameStat.averageScore,
          highestLevel: gameStat.highestLevel,
          lastPlayed: gameStat.lastPlayed
        });
      }
    }
    
    // 按最高分排序
    leaderboardData.sort((a, b) => b.bestScore - a.bestScore);
    
    // 限制为前100名
    const topLeaderboard = leaderboardData.slice(0, 100);
    
    // 渲染排行榜页面
    res.render('games/leaderboard', {
      gameId,
      leaderboard: topLeaderboard
    });
  } catch (error) {
    console.error('获取排行榜错误:', error);
    res.status(500).render('error', {
      message: 'Error loading leaderboard'
    });
  }
};

/**
 * 获取用户游戏进度
 * 获取当前认证用户的游戏进度数据
 */
exports.getUserProgress = async (req, res) => {
  try {
    // 查找用户的进度记录
    const progress = await Progress.findOne({ user: req.user._id });
    
    if (!progress) {
      return res.json({
        success: true,
        progress: {
          totalScore: 0,
          totalTimeSpentSeconds: 0,
          gameStats: [],
          recentSessions: [],
          streakDays: 0,
          achievements: []
        }
      });
    }
    
    // 返回进度数据
    res.json({
      success: true,
      progress: {
        totalScore: progress.totalScore,
        totalTimeSpentSeconds: progress.totalTimeSpentSeconds,
        gameStats: progress.gameStats,
        recentSessions: progress.recentSessions,
        streakDays: progress.streakDays,
        achievements: progress.achievements,
        lastActive: progress.lastActive
      }
    });
  } catch (error) {
    console.error('获取用户进度错误:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * 获取用户游戏历史
 * 获取当前认证用户的游戏历史记录并渲染历史页面
 */
exports.getUserGameHistory = async (req, res) => {
  try {
    // 查找用户的进度记录
    const progress = await Progress.findOne({ user: req.user._id });

    if (!progress) {
      return res.render('games/history', {
        gameStats: [],
        recentSessions: [],
        totalScore: 0,
        totalTimeSpent: 0
      });
    }

    // 格式化游戏会话数据，添加游戏名称等信息
    const recentSessions = progress.recentSessions.map(session => {
      const gameInfo = getGameInfo(session.gameId);
      return {
        ...session.toObject(),
        gameName: gameInfo ? gameInfo.name : session.gameId,
        gameCategory: gameInfo ? gameInfo.category : 'Unknown',
        formattedDate: formatDate(session.completedAt),
        formattedTime: formatTime(session.timeSpentSeconds)
      };
    });

    // 格式化游戏统计数据
    const gameStats = progress.gameStats.map(stat => {
      const gameInfo = getGameInfo(stat.gameId);
      return {
        ...stat.toObject(),
        gameName: gameInfo ? gameInfo.name : stat.gameId,
        gameCategory: gameInfo ? gameInfo.category : 'Unknown',
        formattedTime: formatTime(stat.totalTimeSpentSeconds),
        formattedLastPlayed: formatDate(stat.lastPlayed)
      };
    }).sort((a, b) => b.bestScore - a.bestScore);

    // 渲染历史页面
    res.render('games/history', {
      gameStats,
      recentSessions,
      totalScore: progress.totalScore,
      totalTimeSpent: formatTime(progress.totalTimeSpentSeconds)
    });
  } catch (error) {
    console.error('获取游戏历史错误:', error);
    res.status(500).render('error', {
      message: 'Error loading game history'
    });
  }
};

/**
 * 辅助函数: 获取游戏信息
 */
function getGameInfo(gameId) {
  const games = {
    'memory-card': {
      name: 'Memory Card Match',
      category: 'memory'
    },
    'n-back': {
      name: 'N-Back Memory Challenge',
      category: 'memory'
    }
    // 可以添加其他游戏信息
  };
  
  return games[gameId];
}

/**
 * 辅助函数: 格式化日期
 */
function formatDate(date) {
  if (!date) return 'Unknown';
  
  const d = new Date(date);
  return d.toLocaleDateString();
}

/**
 * 辅助函数: 格式化时间（秒数转为分:秒）
 */
function formatTime(seconds) {
  if (!seconds) return '0:00';
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
} 