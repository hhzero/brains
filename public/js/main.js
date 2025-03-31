/**
 * 大脑训练网站主要JavaScript文件
 * 包含通用功能、导航菜单、通知等
 */

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
  // 初始化移动端导航菜单
  initMobileMenu();
  
  // 初始化消息通知
  initNotifications();
  
  // 初始化语言切换器
  initLanguageSwitcher();
  
  // 添加图像懒加载
  initLazyLoading();
});

/**
 * 初始化移动端菜单
 */
function initMobileMenu() {
  const menuToggle = document.querySelector('.mobile-menu-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  
  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', function() {
      mobileMenu.classList.toggle('hidden');
      document.body.classList.toggle('menu-open');
    });
    
    // 点击菜单外部区域关闭菜单
    document.addEventListener('click', function(event) {
      if (!mobileMenu.contains(event.target) && !menuToggle.contains(event.target) && !mobileMenu.classList.contains('hidden')) {
        mobileMenu.classList.add('hidden');
        document.body.classList.remove('menu-open');
      }
    });
  }
}

/**
 * 初始化通知系统
 */
function initNotifications() {
  const notifications = document.querySelectorAll('.notification');
  
  notifications.forEach(notification => {
    // 自动关闭通知
    if (notification.dataset.autoClose !== 'false') {
      const duration = parseInt(notification.dataset.duration) || 5000;
      setTimeout(() => {
        closeNotification(notification);
      }, duration);
    }
    
    // 关闭按钮
    const closeBtn = notification.querySelector('.notification-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', function() {
        closeNotification(notification);
      });
    }
  });
}

/**
 * 关闭通知
 */
function closeNotification(notification) {
  notification.classList.add('notification-closing');
  
  // 动画结束后移除元素
  setTimeout(() => {
    notification.remove();
  }, 300);
}

/**
 * 显示新通知
 */
function showNotification(message, type = 'info', duration = 5000) {
  const notificationsContainer = document.querySelector('.notifications-container');
  
  if (!notificationsContainer) return;
  
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <p>${message}</p>
    </div>
    <button class="notification-close" aria-label="关闭">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>
  `;
  
  notificationsContainer.appendChild(notification);
  
  // 自动关闭
  if (duration > 0) {
    setTimeout(() => {
      closeNotification(notification);
    }, duration);
  }
  
  // 添加关闭按钮事件
  const closeBtn = notification.querySelector('.notification-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', function() {
      closeNotification(notification);
    });
  }
  
  return notification;
}

/**
 * 初始化语言切换器
 */
function initLanguageSwitcher() {
  const languageSwitcher = document.querySelector('.language-switcher');
  const languageOptions = document.querySelector('.language-options');
  
  if (languageSwitcher && languageOptions) {
    languageSwitcher.addEventListener('click', function(e) {
      e.stopPropagation();
      languageOptions.classList.toggle('hidden');
    });
    
    // 点击页面其他位置关闭语言切换器
    document.addEventListener('click', function() {
      if (!languageOptions.classList.contains('hidden')) {
        languageOptions.classList.add('hidden');
      }
    });
    
    // 阻止点击语言选项时关闭
    languageOptions.addEventListener('click', function(e) {
      e.stopPropagation();
    });
  }
}

/**
 * 初始化图片懒加载
 */
function initLazyLoading() {
  const lazyImages = document.querySelectorAll('img[data-src]');
  
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          imageObserver.unobserve(img);
        }
      });
    });
    
    lazyImages.forEach(img => {
      imageObserver.observe(img);
    });
  } else {
    // 兼容不支持IntersectionObserver的浏览器
    lazyImages.forEach(img => {
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
    });
  }
}

/**
 * 表单验证辅助函数
 */
function validateForm(form) {
  const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
  let isValid = true;
  
  inputs.forEach(input => {
    if (!input.value.trim()) {
      isValid = false;
      showInputError(input, '此字段为必填项');
    } else {
      clearInputError(input);
      
      // 邮箱验证
      if (input.type === 'email' && !validateEmail(input.value)) {
        isValid = false;
        showInputError(input, '请输入有效的电子邮箱地址');
      }
      
      // 密码验证
      if (input.type === 'password' && input.dataset.minLength && input.value.length < parseInt(input.dataset.minLength)) {
        isValid = false;
        showInputError(input, `密码至少需要${input.dataset.minLength}个字符`);
      }
    }
  });
  
  return isValid;
}

/**
 * 显示输入错误信息
 */
function showInputError(input, message) {
  const formGroup = input.closest('.form-group');
  
  if (formGroup) {
    const errorElement = formGroup.querySelector('.form-error');
    
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.classList.remove('hidden');
    } else {
      const newErrorElement = document.createElement('div');
      newErrorElement.className = 'form-error text-red-500 text-sm mt-1';
      newErrorElement.textContent = message;
      formGroup.appendChild(newErrorElement);
    }
    
    input.classList.add('error');
  }
}

/**
 * 清除输入错误信息
 */
function clearInputError(input) {
  const formGroup = input.closest('.form-group');
  
  if (formGroup) {
    const errorElement = formGroup.querySelector('.form-error');
    
    if (errorElement) {
      errorElement.textContent = '';
      errorElement.classList.add('hidden');
    }
    
    input.classList.remove('error');
  }
}

/**
 * 验证邮箱格式
 */
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// 导出全局函数
window.showNotification = showNotification;
window.validateForm = validateForm; 