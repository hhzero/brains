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
    
    // 添加连接选项
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // 超时时间5秒
      connectTimeoutMS: 10000, // 连接超时10秒
    };
    
    // 连接MongoDB
    await mongoose.connect(mongoURI, options);
    
    console.log('MongoDB 连接成功');
    
    // 添加连接事件监听
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB 连接错误:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB 连接断开，尝试重新连接...');
    });
    
  } catch (err) {
    console.error('MongoDB 连接失败:', err.message);
    // 开发模式下不退出进程，允许在没有数据库的情况下测试前端
    console.warn('在开发模式下继续运行应用，但数据库功能将不可用');
    // process.exit(1); // 注释掉退出进程的代码
  }
}; 