/**
 * 辅助函数文件
 * 包含常用的辅助函数和实用工具
 */

// 格式化日期为可读的格式
exports.formatDate = (date, locale = 'en-US') => {
  if (!date) return '';
  
  try {
    return new Date(date).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    console.error('日期格式化错误:', error);
    return '';
  }
};

// 格式化日期和时间为可读的格式
exports.formatDateTime = (date, locale = 'en-US') => {
  if (!date) return '';
  
  try {
    return new Date(date).toLocaleString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('日期时间格式化错误:', error);
    return '';
  }
};

// 截断文本
exports.truncateText = (text, length = 100) => {
  if (!text) return '';
  
  if (text.length <= length) return text;
  
  return text.substring(0, length) + '...';
};

// 格式化数字为易读的格式
exports.formatNumber = (number, locale = 'en-US') => {
  if (number === undefined || number === null) return '';
  
  try {
    return new Intl.NumberFormat(locale).format(number);
  } catch (error) {
    console.error('数字格式化错误:', error);
    return number.toString();
  }
};

// 格式化时间为分钟:秒的格式
exports.formatTime = (seconds) => {
  if (!seconds && seconds !== 0) return '';
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// 生成随机ID
exports.generateRandomId = (length = 10) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return result;
};

// 计算从给定日期到现在的天数
exports.daysSince = (date) => {
  if (!date) return 0;
  
  const givenDate = new Date(date);
  const today = new Date();
  
  // 重置时间为午夜，只比较日期部分
  givenDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  
  // 计算差异的毫秒数并转换为天数
  const diffTime = Math.abs(today - givenDate);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

// 随机打乱数组
exports.shuffleArray = (array) => {
  if (!Array.isArray(array)) return [];
  
  const result = [...array];
  
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  
  return result;
};

// 从范围内生成随机数
exports.getRandomNumber = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// 检查两个日期是否是同一天
exports.isSameDay = (date1, date2) => {
  if (!date1 || !date2) return false;
  
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

// 将驼峰命名转换为短横线命名
exports.camelToKebab = (str) => {
  return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
};

// 将短横线命名转换为驼峰命名
exports.kebabToCamel = (str) => {
  return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}; 