// app.js
const reminderManager = require('./utils/reminderManager.js');

App({
  // 应用全局数据
  globalData: {
    userInfo: null,
    systemInfo: null,
    statusBarHeight: 0,
    navBarHeight: 0
  },

  // 应用启动
  onLaunch() {
    console.log('PulseVyne 应用启动');
    
    // 获取系统信息
    this.getSystemInfo();
    
    // 初始化本地存储
    this.initStorage();
    
    // 初始化提醒管理器
    this.initReminderManager();
    
    // 请求通知权限 - 已禁用
    // this.requestNotificationPermission();
    
    // 检查更新
    this.checkUpdate();
  },

  // 应用显示
  onShow() {
    console.log('PulseVyne 应用显示');
  },

  // 应用隐藏
  onHide() {
    console.log('PulseVyne 应用隐藏');
  },

  // 应用错误
  onError(error) {
    console.error('PulseVyne 应用错误:', error);
  },

  // 获取系统信息
  getSystemInfo() {
    try {
      const systemInfo = wx.getSystemInfoSync();
      this.globalData.systemInfo = systemInfo;
      
      // 计算状态栏和导航栏高度
      this.globalData.statusBarHeight = systemInfo.statusBarHeight || 0;
      
      // 不同平台的导航栏高度计算
      let navBarHeight = 44; // 默认高度
      if (systemInfo.platform === 'ios') {
        navBarHeight = 44;
      } else if (systemInfo.platform === 'android') {
        navBarHeight = 48;
      }
      
      this.globalData.navBarHeight = navBarHeight;
      
      console.log('系统信息获取成功:', systemInfo);
    } catch (error) {
      console.error('获取系统信息失败:', error);
    }
  },

  // 初始化本地存储
  initStorage() {
    try {
      // 初始化计数器
      if (!wx.getStorageSync('theory_count')) {
        wx.setStorageSync('theory_count', 0);
      }
      if (!wx.getStorageSync('action_count')) {
        wx.setStorageSync('action_count', 0);
      }
      if (!wx.getStorageSync('execution_count')) {
        wx.setStorageSync('execution_count', 0);
      }
      
      // 初始化用户设置
      if (!wx.getStorageSync('user_settings')) {
        const defaultSettings = {
          theme: 'default',
          notifications: true,
          autoSave: true,
          language: 'zh-CN'
        };
        wx.setStorageSync('user_settings', defaultSettings);
      }
      
      console.log('本地存储初始化完成');
    } catch (error) {
      console.error('初始化本地存储失败:', error);
    }
  },

  // 初始化提醒管理器
  initReminderManager() {
    try {
      reminderManager.init();
      console.log('提醒管理器初始化完成');
    } catch (error) {
      console.error('提醒管理器初始化失败:', error);
    }
  },

  // 请求通知权限
  requestNotificationPermission() {
    // 检查是否已经请求过权限
    const hasRequestedPermission = wx.getStorageSync('has_requested_notification_permission');
    
    if (!hasRequestedPermission) {
      // 延迟1秒后请求权限，避免在启动时立即弹窗
      setTimeout(() => {
        wx.showModal({
          title: '开启消息通知',
          content: 'PulseVyne需要向您发送执行提醒通知，帮助您按时完成行动计划。是否允许接收通知？',
          confirmText: '允许',
          cancelText: '暂不',
          success: (res) => {
            if (res.confirm) {
              // 用户同意，请求订阅消息权限
              wx.requestSubscribeMessage({
                tmplIds: ['fOnlSnJzLlzrTMbxx-aRum2vuSxaItxjljp6oXs-w6c'],
                success: (subscribeRes) => {
                  console.log('订阅消息权限请求结果:', subscribeRes);
                  const templateId = 'fOnlSnJzLlzrTMbxx-aRum2vuSxaItxjljp6oXs-w6c';
                  if (subscribeRes[templateId] === 'accept') {
                    wx.showToast({
                      title: '通知权限已开启',
                      icon: 'success'
                    });
                    // 保存权限状态
                    wx.setStorageSync('notification_permission_granted', true);
                  } else if (subscribeRes[templateId] === 'reject') {
                    wx.showToast({
                      title: '您已拒绝接收提醒',
                      icon: 'none'
                    });
                    wx.setStorageSync('notification_permission_granted', false);
                  } else {
                    wx.showToast({
                      title: '您可以稍后在设置中开启',
                      icon: 'none'
                    });
                    wx.setStorageSync('notification_permission_granted', false);
                  }
                },
                fail: (error) => {
                  console.error('请求订阅消息权限失败:', error);
                  wx.setStorageSync('notification_permission_granted', false);
                  
                  // 根据错误码提供具体的错误提示
                  if (error.errCode === 20001) {
                    wx.showModal({
                      title: '模板配置错误',
                      content: '订阅消息模板未正确配置，请检查微信公众平台中的模板设置。\n\n解决方案：\n1. 登录微信公众平台\n2. 进入功能 -> 订阅消息\n3. 添加或检查模板状态\n\n错误码：20001',
                      showCancel: false
                    });
                  } else if (error.errCode === 10003) {
                    wx.showToast({
                      title: '请在微信中打开小程序',
                      icon: 'none'
                    });
                  } else {
                    wx.showToast({
                      title: '权限请求失败，请稍后重试',
                      icon: 'none'
                    });
                  }
                }
              });
            } else {
              // 用户拒绝
              wx.setStorageSync('notification_permission_granted', false);
              wx.showToast({
                title: '您可以稍后在设置中开启',
                icon: 'none'
              });
            }
            
            // 标记已经请求过权限
            wx.setStorageSync('has_requested_notification_permission', true);
          }
        });
      }, 1000);
    }
  },

  // 检查小程序更新
  checkUpdate() {
    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager();
      
      // 检查是否有新版本
      updateManager.onCheckForUpdate((res) => {
        if (res.hasUpdate) {
          console.log('发现新版本');
        }
      });
      
      // 新版本下载完成
      updateManager.onUpdateReady(() => {
        wx.showModal({
          title: '更新提示',
          content: '新版本已准备好，是否重启应用？',
          success: (res) => {
            if (res.confirm) {
              updateManager.applyUpdate();
            }
          }
        });
      });
      
      // 新版本下载失败
      updateManager.onUpdateFailed(() => {
        console.error('新版本下载失败');
      });
    }
  },

  // 获取用户信息
  getUserInfo() {
    return new Promise((resolve, reject) => {
      if (this.globalData.userInfo) {
        resolve(this.globalData.userInfo);
      } else {
        wx.getUserProfile({
          desc: '用于完善用户资料',
          success: (res) => {
            this.globalData.userInfo = res.userInfo;
            resolve(res.userInfo);
          },
          fail: reject
        });
      }
    });
  },

  // 工具函数：格式化日期
  formatDate(date, format = 'YYYY-MM-DD HH:mm:ss') {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    
    return format
      .replace('YYYY', year)
      .replace('MM', month)
      .replace('DD', day)
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds);
  },

  // 工具函数：生成唯一ID
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  },

  // 工具函数：防抖
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // 工具函数：节流
  throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
});
