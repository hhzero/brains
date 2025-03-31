/**
 * 应用配置文件
 * 存储应用程序的全局配置信息
 */

module.exports = {
  // 应用基本信息
  app: {
    name: '大脑训练网站',
    version: '1.0.0',
    description: '多语言支持的大脑训练网站，提供多种认知训练游戏'
  },
  
  // 社交媒体链接
  social: {
    facebook: 'https://facebook.com/braintraining',
    twitter: 'https://twitter.com/braintraining',
    instagram: 'https://instagram.com/braintraining',
    youtube: 'https://youtube.com/braintraining',
    linkedin: 'https://linkedin.com/company/braintraining'
  },
  
  // 联系信息
  contact: {
    address: '123 Brain Street, Knowledge City, 100000',
    email: 'contact@braintraining.com',
    phone: '+1 234 567 8900',
    workingHours: 'Mon - Fri, 9:00 - 18:00'
  },
  
  // 支持的语言列表
  languages: [
    { code: 'en', name: 'English', direction: 'ltr' },
    { code: 'zh', name: '中文', direction: 'ltr' },
    { code: 'ja', name: '日本語', direction: 'ltr' },
    { code: 'ar', name: 'العربية', direction: 'rtl' },
    { code: 'ko', name: '한국어', direction: 'ltr' }
  ],
  
  // 默认语言
  defaultLanguage: 'en',
  
  // 游戏分类
  gameCategories: [
    {
      id: 'memory',
      nameKey: 'categories.memory',
      icon: 'memory',
      games: [
        { id: 'memory-card', nameKey: 'games.memoryCard' },
        { id: 'number-memory', nameKey: 'games.numberMemory' },
        { id: 'image-memory', nameKey: 'games.imageMemory' },
        { id: 'n-back', nameKey: 'games.nBack' }
      ]
    },
    {
      id: 'attention',
      nameKey: 'categories.attention',
      icon: 'attention',
      games: [
        { id: 'attention-focus', nameKey: 'games.attentionFocus' },
        { id: 'color-match', nameKey: 'games.colorMatch' },
        { id: 'target-tracking', nameKey: 'games.targetTracking' }
      ]
    },
    {
      id: 'logic',
      nameKey: 'categories.logic',
      icon: 'logic',
      games: [
        { id: 'sudoku', nameKey: 'games.sudoku' },
        { id: 'logic-puzzle', nameKey: 'games.logicPuzzle' },
        { id: 'shape-puzzle', nameKey: 'games.shapePuzzle' }
      ]
    },
    {
      id: 'language',
      nameKey: 'categories.language',
      icon: 'language',
      games: [
        { id: 'word-challenge', nameKey: 'games.wordChallenge' },
        { id: 'grammar-fix', nameKey: 'games.grammarFix' },
        { id: 'reading-comprehension', nameKey: 'games.readingComprehension' }
      ]
    },
    {
      id: 'math',
      nameKey: 'categories.math',
      icon: 'math',
      games: [
        { id: 'quick-calculation', nameKey: 'games.quickCalculation' },
        { id: 'math-puzzle', nameKey: 'games.mathPuzzle' },
        { id: 'geometry-calculation', nameKey: 'games.geometryCalculation' }
      ]
    }
  ],
  
  // 难度级别
  difficultyLevels: [
    { id: 'easy', nameKey: 'difficulty.easy' },
    { id: 'medium', nameKey: 'difficulty.medium' },
    { id: 'hard', nameKey: 'difficulty.hard' },
    { id: 'expert', nameKey: 'difficulty.expert' }
  ],
  
  // 用户角色
  userRoles: {
    USER: 'user',
    PREMIUM: 'premium',
    ADMIN: 'admin'
  },
  
  // 分数计算相关配置
  scoring: {
    basePoints: 100,
    timeMultiplier: 1.5,
    difficultyMultipliers: {
      easy: 1,
      medium: 1.5,
      hard: 2,
      expert: 3
    }
  }
}; 