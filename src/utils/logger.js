/**
 * 日志工具
 * 用于记录应用程序日志，包括信息、警告和错误
 */

/**
 * 获取当前时间戳
 * @returns {string} 格式化的时间戳
 */
const getTimestamp = () => {
  const now = new Date();
  return now.toISOString();
};

/**
 * 格式化日志消息
 * @param {string} level - 日志级别
 * @param {string} message - 日志消息
 * @param {Object} [data] - 附加数据
 * @returns {string} 格式化的日志消息
 */
const formatLogMessage = (level, message, data) => {
  const timestamp = getTimestamp();
  const logData = data ? `\n${JSON.stringify(data, null, 2)}` : '';
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${logData}`;
};

/**
 * 记录信息级别的日志
 * @param {string} message - 日志消息
 * @param {Object} [data] - 附加数据
 */
exports.info = (message, data) => {
  console.log(formatLogMessage('info', message, data));
};

/**
 * 记录警告级别的日志
 * @param {string} message - 日志消息
 * @param {Object} [data] - 附加数据
 */
exports.warn = (message, data) => {
  console.warn(formatLogMessage('warn', message, data));
};

/**
 * 记录错误级别的日志
 * @param {string} message - 日志消息
 * @param {Error|Object} [error] - 错误对象或附加数据
 */
exports.error = (message, error) => {
  let errorData = error;
  
  // 如果错误对象是Error实例，提取错误信息和堆栈
  if (error instanceof Error) {
    errorData = {
      message: error.message,
      stack: error.stack,
      ...error // 包含错误对象的其他属性
    };
  }
  
  console.error(formatLogMessage('error', message, errorData));
};

/**
 * 记录调试级别的日志
 * 仅在开发环境中输出
 * @param {string} message - 日志消息
 * @param {Object} [data] - 附加数据
 */
exports.debug = (message, data) => {
  if (process.env.NODE_ENV !== 'production') {
    console.debug(formatLogMessage('debug', message, data));
  }
};

/**
 * 记录请求日志
 * @param {Object} req - 请求对象
 * @param {string} [message] - 附加消息
 */
exports.request = (req, message = '') => {
  if (process.env.NODE_ENV === 'production') return;
  
  const logData = {
    method: req.method,
    url: req.url,
    params: req.params,
    query: req.query,
    body: req.body,
    headers: {
      'user-agent': req.headers['user-agent'],
      'content-type': req.headers['content-type'],
      'accept-language': req.headers['accept-language']
    },
    ip: req.ip || req.connection.remoteAddress
  };
  
  console.log(formatLogMessage('request', message || 'HTTP Request', logData));
};

/**
 * 记录响应日志
 * @param {Object} res - 响应对象
 * @param {string} [message] - 附加消息
 */
exports.response = (res, message = '') => {
  if (process.env.NODE_ENV === 'production') return;
  
  const logData = {
    statusCode: res.statusCode,
    statusMessage: res.statusMessage,
    headers: res.getHeaders()
  };
  
  console.log(formatLogMessage('response', message || 'HTTP Response', logData));
}; 