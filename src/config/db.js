/**
 * 数据库配置文件
 * 负责连接MongoDB数据库
 */

const mongoose = require('mongoose');

// 连接数据库函数
module.exports = async function connectDB() {
  try {
    // 读取环境变量中的数据库URI，如果不存在则使用默认URI
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/brain-training';
    
    // 连接MongoDB
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('MongoDB 连接成功');
  } catch (err) {
    console.error('MongoDB 连接失败:', err.message);
    // 如果连接失败，退出进程
    process.exit(1);
  }
}; 