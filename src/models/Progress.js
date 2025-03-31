/**
 * 进度模型
 * 存储用户的游戏进度，包括已完成的游戏、得分、级别等
 */

const mongoose = require('mongoose');
const config = require('../config/config');

// 定义游戏分数和进度记录的子结构
const gameSessionSchema = new mongoose.Schema({
  gameId: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: config.difficultyLevels.map(level => level.id),
    default: 'easy'
  },
  score: {
    type: Number,
    default: 0
  },
  timeSpentSeconds: {
    type: Number,
    default: 0
  },
  completedAt: {
    type: Date,
    default: Date.now
  },
  // 游戏特定数据（根据游戏类型存储不同的数据）
  gameData: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  _id: false // 不为子文档创建_id
});

// 定义游戏统计子结构
const gameStatsSchema = new mongoose.Schema({
  gameId: {
    type: String,
    required: true
  },
  playCount: {
    type: Number,
    default: 0
  },
  bestScore: {
    type: Number,
    default: 0
  },
  totalScore: {
    type: Number,
    default: 0
  },
  averageScore: {
    type: Number,
    default: 0
  },
  totalTimeSpentSeconds: {
    type: Number,
    default: 0
  },
  lastPlayed: {
    type: Date,
    default: null
  },
  highestLevel: {
    type: String,
    enum: config.difficultyLevels.map(level => level.id),
    default: 'easy'
  }
}, {
  _id: false // 不为子文档创建_id
});

// 定义用户进度模式
const progressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  totalScore: {
    type: Number,
    default: 0
  },
  totalTimeSpentSeconds: {
    type: Number,
    default: 0
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  // 游戏统计数据
  gameStats: [gameStatsSchema],
  // 最近的游戏会话记录
  recentSessions: [gameSessionSchema],
  // 连续登录天数
  streakDays: {
    type: Number,
    default: 0
  },
  // 成就列表
  achievements: [{
    id: String,
    earnedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true // 自动添加 createdAt 和 updatedAt 字段
});

// 创建索引以加快查询速度
progressSchema.index({ user: 1 });
progressSchema.index({ 'gameStats.gameId': 1 });
progressSchema.index({ totalScore: -1 }); // 用于排行榜

// 创建用户进度模型
const Progress = mongoose.model('Progress', progressSchema);

module.exports = Progress; 