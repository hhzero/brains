/**
 * N-Back 游戏 JavaScript
 * 这个游戏测试工作记忆力，要求玩家识别在N步之前出现的相同元素
 */

class NBackGame {
  constructor(options = {}) {
    // 游戏配置
    this.config = {
      n: options.n || 2, // 默认是2-back
      trials: options.trials || 25, // 单轮游戏的试验次数
      stimuliDuration: options.stimuliDuration || 2000, // 刺激显示时间（毫秒）
      interTrialInterval: options.interTrialInterval || 1000, // 试验间隔时间（毫秒）
      feedbackDuration: options.feedbackDuration || 500, // 反馈显示时间（毫秒）
      positionMatch: options.positionMatch !== false, // 是否匹配位置
      letterMatch: options.letterMatch !== false, // 是否匹配字母
      matchProbability: options.matchProbability || 0.3, // 匹配出现的概率
      grid: options.grid || 3, // 网格大小（3x3）
      letters: options.letters || ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'L'] // 可能出现的字母
    };

    // 游戏状态
    this.state = {
      isRunning: false,
      isPaused: false,
      currentTrial: 0,
      score: 0,
      positionMatches: 0,
      letterMatches: 0,
      positionResponses: {
        correct: 0,
        incorrect: 0,
        missed: 0
      },
      letterResponses: {
        correct: 0,
        incorrect: 0,
        missed: 0
      },
      startTime: null,
      endTime: null,
      history: [], // 刺激历史
      lastResponse: null
    };

    // DOM元素
    this.elements = {
      gameBoard: document.getElementById('game-board'),
      grid: document.getElementById('n-back-grid'),
      startButton: document.getElementById('start-button'),
      pauseButton: document.getElementById('pause-button'),
      resetButton: document.getElementById('reset-button'),
      positionButton: document.getElementById('position-match-button'),
      letterButton: document.getElementById('letter-match-button'),
      scoreDisplay: document.getElementById('score-display'),
      trialDisplay: document.getElementById('trial-display'),
      nLevelDisplay: document.getElementById('n-level-display'),
      gameStatus: document.getElementById('game-status'),
      statusTitle: document.getElementById('status-title'),
      statusDescription: document.getElementById('status-description'),
      actionButton: document.getElementById('action-button')
    };

    // 初始化游戏
    this.init();
  }

  /**
   * 初始化游戏
   */
  init() {
    // 更新显示
    this.updateDisplay();
    
    // 创建网格
    this.createGrid();
    
    // 绑定事件
    this.bindEvents();
    
    // 显示开始状态
    this.showStatus('准备', `这是一个 ${this.config.n}-back 任务。当当前刺激与 ${this.config.n} 步之前的刺激相同时作出反应。`, '开始游戏');
  }

  /**
   * 创建游戏网格
   */
  createGrid() {
    // 清空网格
    this.elements.grid.innerHTML = '';
    
    // 创建单元格
    for (let i = 0; i < this.config.grid * this.config.grid; i++) {
      const cell = document.createElement('div');
      cell.className = 'n-back-cell';
      cell.innerHTML = '<div class="visual-stimuli"></div>';
      this.elements.grid.appendChild(cell);
    }
  }

  /**
   * 绑定事件
   */
  bindEvents() {
    // 开始按钮
    if (this.elements.startButton) {
      this.elements.startButton.addEventListener('click', () => this.startGame());
    }
    
    // 暂停按钮
    if (this.elements.pauseButton) {
      this.elements.pauseButton.addEventListener('click', () => this.togglePause());
    }
    
    // 重置按钮
    if (this.elements.resetButton) {
      this.elements.resetButton.addEventListener('click', () => this.resetGame());
    }
    
    // 位置匹配按钮
    if (this.elements.positionButton) {
      this.elements.positionButton.addEventListener('click', () => this.checkMatch('position'));
    }
    
    // 字母匹配按钮
    if (this.elements.letterButton) {
      this.elements.letterButton.addEventListener('click', () => this.checkMatch('letter'));
    }
    
    // 键盘控制
    document.addEventListener('keydown', (e) => {
      if (!this.state.isRunning || this.state.isPaused) return;
      
      if (e.key === 'a' || e.key === 'A') {
        this.checkMatch('position');
      } else if (e.key === 'l' || e.key === 'L') {
        this.checkMatch('letter');
      }
    });
    
    // 状态窗口中的操作按钮
    if (this.elements.actionButton) {
      this.elements.actionButton.addEventListener('click', () => {
        const action = this.elements.actionButton.dataset.action;
        if (action === 'start') {
          this.startGame();
        } else if (action === 'restart') {
          this.resetGame();
          this.startGame();
        }
      });
    }
  }

  /**
   * 显示状态窗口
   */
  showStatus(title, description, buttonText, action = 'start') {
    if (this.elements.gameStatus) {
      this.elements.gameStatus.style.display = 'flex';
      this.elements.statusTitle.textContent = title;
      this.elements.statusDescription.textContent = description;
      this.elements.actionButton.textContent = buttonText;
      this.elements.actionButton.dataset.action = action;
    }
  }

  /**
   * 隐藏状态窗口
   */
  hideStatus() {
    if (this.elements.gameStatus) {
      this.elements.gameStatus.style.display = 'none';
    }
  }

  /**
   * 开始游戏
   */
  startGame() {
    // 重置游戏状态
    this.state.isRunning = true;
    this.state.isPaused = false;
    this.state.currentTrial = 0;
    this.state.score = 0;
    this.state.positionMatches = 0;
    this.state.letterMatches = 0;
    this.state.positionResponses = { correct: 0, incorrect: 0, missed: 0 };
    this.state.letterResponses = { correct: 0, incorrect: 0, missed: 0 };
    this.state.history = [];
    this.state.startTime = Date.now();
    
    // 更新界面
    this.updateDisplay();
    this.hideStatus();
    
    // 启用回应按钮
    this.enableResponseButtons();
    
    // 运行第一个试验
    this.runTrial();
  }

  /**
   * 重置游戏
   */
  resetGame() {
    // 重置游戏状态
    this.state.isRunning = false;
    this.state.isPaused = false;
    this.state.currentTrial = 0;
    this.state.score = 0;
    
    // 清除计时器
    if (this.trialTimeout) {
      clearTimeout(this.trialTimeout);
    }
    
    // 清除刺激显示
    this.clearStimulus();
    
    // 更新界面
    this.updateDisplay();
    
    // 显示开始状态
    this.showStatus('准备', `这是一个 ${this.config.n}-back 任务。当当前刺激与 ${this.config.n} 步之前的刺激相同时作出反应。`, '开始游戏');
  }

  /**
   * 暂停/继续游戏
   */
  togglePause() {
    if (!this.state.isRunning) return;
    
    this.state.isPaused = !this.state.isPaused;
    
    if (this.state.isPaused) {
      // 暂停游戏
      if (this.trialTimeout) {
        clearTimeout(this.trialTimeout);
      }
      this.showStatus('已暂停', '游戏已暂停。', '继续');
    } else {
      // 继续游戏
      this.hideStatus();
      this.runTrial();
    }
  }

  /**
   * 运行一个试验
   */
  runTrial() {
    if (!this.state.isRunning || this.state.isPaused) return;
    
    // 增加试验计数
    this.state.currentTrial++;
    
    // 更新显示
    this.updateDisplay();
    
    // 检查游戏是否结束
    if (this.state.currentTrial > this.config.trials) {
      this.endGame();
      return;
    }
    
    // 生成新的刺激
    const stimulus = this.generateStimulus();
    this.state.history.push(stimulus);
    
    // 显示刺激
    this.showStimulus(stimulus);
    
    // 重置上一次响应
    this.state.lastResponse = null;
    
    // 在刺激持续时间后清除刺激
    setTimeout(() => {
      this.clearStimulus();
      
      // 检查是否有未响应的匹配
      if (this.state.currentTrial > this.config.n) {
        const nBackStimulus = this.state.history[this.state.history.length - this.config.n - 1];
        const currentStimulus = this.state.history[this.state.history.length - 1];
        
        // 检查位置匹配
        if (this.config.positionMatch && nBackStimulus.position === currentStimulus.position) {
          if (!this.state.lastResponse || !this.state.lastResponse.position) {
            // 漏报，玩家未响应
            this.state.positionResponses.missed++;
          }
        }
        
        // 检查字母匹配
        if (this.config.letterMatch && nBackStimulus.letter === currentStimulus.letter) {
          if (!this.state.lastResponse || !this.state.lastResponse.letter) {
            // 漏报，玩家未响应
            this.state.letterResponses.missed++;
          }
        }
      }
      
      // 在间隔后运行下一个试验
      this.trialTimeout = setTimeout(() => this.runTrial(), this.config.interTrialInterval);
    }, this.config.stimuliDuration);
  }

  /**
   * 生成新的刺激
   */
  generateStimulus() {
    const stimulus = {
      position: Math.floor(Math.random() * (this.config.grid * this.config.grid)),
      letter: this.config.letters[Math.floor(Math.random() * this.config.letters.length)]
    };
    
    // 如果已经有足够的历史，根据概率决定是否创建匹配
    if (this.state.currentTrial > this.config.n) {
      const nBackStimulus = this.state.history[this.state.history.length - this.config.n];
      
      // 位置匹配处理
      if (this.config.positionMatch && Math.random() < this.config.matchProbability) {
        stimulus.position = nBackStimulus.position;
        this.state.positionMatches++;
      }
      
      // 字母匹配处理
      if (this.config.letterMatch && Math.random() < this.config.matchProbability) {
        stimulus.letter = nBackStimulus.letter;
        this.state.letterMatches++;
      }
    }
    
    return stimulus;
  }

  /**
   * 显示刺激
   */
  showStimulus(stimulus) {
    const cells = this.elements.grid.querySelectorAll('.n-back-cell');
    const targetCell = cells[stimulus.position];
    
    // 激活目标单元格
    targetCell.classList.add('active');
    
    // 显示字母
    const stimuliElement = targetCell.querySelector('.visual-stimuli');
    stimuliElement.textContent = stimulus.letter;
    stimuliElement.classList.add('active');
  }

  /**
   * 清除刺激显示
   */
  clearStimulus() {
    const cells = this.elements.grid.querySelectorAll('.n-back-cell');
    cells.forEach(cell => {
      cell.classList.remove('active');
      const stimuli = cell.querySelector('.visual-stimuli');
      stimuli.textContent = '';
      stimuli.classList.remove('active');
    });
  }

  /**
   * 检查匹配响应
   */
  checkMatch(type) {
    if (!this.state.isRunning || this.state.isPaused || this.state.currentTrial <= this.config.n) return;
    
    // 初始化上一次响应对象
    if (!this.state.lastResponse) {
      this.state.lastResponse = { position: false, letter: false };
    }
    
    // 标记为已响应
    this.state.lastResponse[type] = true;
    
    // 获取当前刺激和N步之前的刺激
    const currentStimulus = this.state.history[this.state.history.length - 1];
    const nBackStimulus = this.state.history[this.state.history.length - this.config.n - 1];
    
    let isCorrect = false;
    
    // 检查是否匹配
    if (type === 'position') {
      isCorrect = nBackStimulus.position === currentStimulus.position;
      
      if (isCorrect) {
        // 正确识别
        this.state.positionResponses.correct++;
        this.state.score += 10; // 加10分
        this.showFeedback(true);
      } else {
        // 错误判断
        this.state.positionResponses.incorrect++;
        this.state.score = Math.max(0, this.state.score - 5); // 减5分，但不低于0
        this.showFeedback(false);
      }
    } else if (type === 'letter') {
      isCorrect = nBackStimulus.letter === currentStimulus.letter;
      
      if (isCorrect) {
        // 正确识别
        this.state.letterResponses.correct++;
        this.state.score += 10; // 加10分
        this.showFeedback(true);
      } else {
        // 错误判断
        this.state.letterResponses.incorrect++;
        this.state.score = Math.max(0, this.state.score - 5); // 减5分，但不低于0
        this.showFeedback(false);
      }
    }
    
    // 更新得分显示
    this.updateDisplay();
  }

  /**
   * 显示反馈
   */
  showFeedback(isCorrect) {
    const feedbackElement = document.createElement('div');
    feedbackElement.className = `feedback ${isCorrect ? 'correct' : 'incorrect'}`;
    feedbackElement.textContent = isCorrect ? '✓' : '✗';
    this.elements.gameBoard.appendChild(feedbackElement);
    
    // 在一段时间后移除反馈
    setTimeout(() => {
      if (feedbackElement.parentNode === this.elements.gameBoard) {
        this.elements.gameBoard.removeChild(feedbackElement);
      }
    }, this.config.feedbackDuration);
  }

  /**
   * 启用响应按钮
   */
  enableResponseButtons() {
    if (this.elements.positionButton) {
      this.elements.positionButton.disabled = false;
    }
    if (this.elements.letterButton) {
      this.elements.letterButton.disabled = false;
    }
  }

  /**
   * 禁用响应按钮
   */
  disableResponseButtons() {
    if (this.elements.positionButton) {
      this.elements.positionButton.disabled = true;
    }
    if (this.elements.letterButton) {
      this.elements.letterButton.disabled = true;
    }
  }

  /**
   * 更新显示
   */
  updateDisplay() {
    if (this.elements.scoreDisplay) {
      this.elements.scoreDisplay.textContent = this.state.score;
    }
    if (this.elements.trialDisplay) {
      this.elements.trialDisplay.textContent = `${this.state.currentTrial}/${this.config.trials}`;
    }
    if (this.elements.nLevelDisplay) {
      this.elements.nLevelDisplay.textContent = this.config.n;
    }
  }

  /**
   * 结束游戏
   */
  endGame() {
    // 停止游戏
    this.state.isRunning = false;
    this.state.endTime = Date.now();
    
    // 计算游戏时间（毫秒）
    const gameTime = this.state.endTime - this.state.startTime;
    
    // 计算准确率
    const positionAccuracy = this.calculateAccuracy(
      this.state.positionResponses.correct,
      this.state.positionResponses.incorrect,
      this.state.positionResponses.missed
    );
    
    const letterAccuracy = this.calculateAccuracy(
      this.state.letterResponses.correct,
      this.state.letterResponses.incorrect,
      this.state.letterResponses.missed
    );
    
    // 禁用回应按钮
    this.disableResponseButtons();
    
    // 显示结果
    this.showResults(gameTime, positionAccuracy, letterAccuracy);
    
    // 如果有回调，保存分数到服务器
    if (typeof window.saveGameScore === 'function') {
      const gameData = {
        gameId: 'n-back',
        score: this.state.score,
        level: `level-${this.config.n}`,
        accuracy: Math.round((positionAccuracy + letterAccuracy) / 2),
        timeSpent: Math.round(gameTime / 1000),
        details: {
          positionMatches: this.state.positionMatches,
          letterMatches: this.state.letterMatches,
          positionResponses: this.state.positionResponses,
          letterResponses: this.state.letterResponses
        }
      };
      
      window.saveGameScore(gameData);
    }
  }

  /**
   * 计算准确率
   */
  calculateAccuracy(correct, incorrect, missed) {
    const total = correct + incorrect + missed;
    return total > 0 ? Math.round((correct / total) * 100) : 0;
  }

  /**
   * 显示游戏结果
   */
  showResults(gameTime, positionAccuracy, letterAccuracy) {
    // 准备结果消息
    let resultMessage = '';
    let resultTitle = '';
    
    // 根据得分评估表现
    if (this.state.score >= 200) {
      resultTitle = '太棒了！';
      resultMessage = '你的工作记忆力非常出色！继续保持这种水平，挑战更高难度的N-Back任务。';
    } else if (this.state.score >= 150) {
      resultTitle = '做得好！';
      resultMessage = '你有很强的工作记忆力。再多练习一下，你会变得更好！';
    } else if (this.state.score >= 100) {
      resultTitle = '不错！';
      resultMessage = '你的工作记忆力处于平均水平。通过持续练习，你可以提高你的能力。';
    } else if (this.state.score >= 50) {
      resultTitle = '加油！';
      resultMessage = '工作记忆力需要时间培养。继续练习，你会看到进步的！';
    } else {
      resultTitle = '继续努力！';
      resultMessage = 'N-Back是一项具有挑战性的任务。不要灰心，持续练习是提高工作记忆力的关键。';
    }
    
    // 显示结果窗口
    this.showStatus(
      resultTitle,
      `最终得分: ${this.state.score}\n` +
      `位置匹配正确率: ${positionAccuracy}%\n` +
      `字母匹配正确率: ${letterAccuracy}%\n` +
      `游戏时间: ${this.formatTime(gameTime)}\n\n` +
      resultMessage,
      '再玩一次',
      'restart'
    );
  }

  /**
   * 格式化时间
   */
  formatTime(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}分${seconds}秒`;
  }
}

// 当DOM加载完成后初始化游戏
document.addEventListener('DOMContentLoaded', () => {
  // 获取游戏配置
  const gameContainer = document.getElementById('n-back-game');
  if (!gameContainer) return;
  
  const nLevel = parseInt(gameContainer.dataset.nLevel || '2', 10);
  const positionMatch = gameContainer.dataset.positionMatch !== 'false';
  const letterMatch = gameContainer.dataset.letterMatch !== 'false';
  
  // 创建游戏实例
  window.game = new NBackGame({
    n: nLevel,
    positionMatch: positionMatch,
    letterMatch: letterMatch
  });
  
  // 添加难度选择功能
  const difficultyOptions = document.querySelectorAll('.difficulty-option');
  if (difficultyOptions.length > 0) {
    difficultyOptions.forEach(option => {
      option.addEventListener('click', function() {
        // 移除所有选项的活跃状态
        difficultyOptions.forEach(opt => opt.classList.remove('active'));
        
        // 添加当前选项的活跃状态
        this.classList.add('active');
        
        // 更新游戏配置
        const level = parseInt(this.dataset.level, 10);
        if (window.game) {
          window.game.config.n = level;
          
          // 更新显示
          if (window.game.elements.nLevelDisplay) {
            window.game.elements.nLevelDisplay.textContent = level;
          }
          
          // 如果游戏未运行，更新状态消息
          if (!window.game.state.isRunning) {
            window.game.showStatus(
              '准备',
              `这是一个 ${level}-back 任务。当当前刺激与 ${level} 步之前的刺激相同时作出反应。`,
              '开始游戏'
            );
          }
        }
      });
    });
  }
}); 