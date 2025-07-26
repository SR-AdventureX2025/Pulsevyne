// index.js
const app = getApp()
const shareManager = require('../../utils/shareManager.js');
const { getFeishuStats } = require('../../config/api.js');

Page({
  data: {
    currentPage: 'index',
    navFixed: true,
    recentActivities: [],
    todayStats: {
      theoryCount: 0,
      actionCount: 0,
      executionCount: 0
    },
    totalStats: {
      theoryCount: 0,
      actionCount: 0,
      executionCount: 0,
      loading: false
    },
    pendingAction: null,
    pendingHours: 0,
    deleteThreshold: -80, // 滑动删除的阈值
    isSimulator: false // 是否为模拟器环境
  },

  onLoad() {
    // 页面加载时的初始化
    this.checkEnvironment()
    this.loadRecentActivities()
    this.loadTodayStats()
    this.loadTotalStats()
  },

  // 检测运行环境
  checkEnvironment() {
    try {
      const systemInfo = wx.getSystemInfoSync()
      const isSimulator = systemInfo.platform === 'devtools'
      this.setData({
        isSimulator: isSimulator
      })
    } catch (error) {
      console.error('检测环境失败:', error)
      this.setData({
        isSimulator: false
      })
    }
  },

  onShow() {
    // 页面显示时的处理，重新加载最新数据
    this.loadRecentActivities()
    this.loadTodayStats()
    this.loadTotalStats()
    this.checkAndUpdateAchievements()
    this.checkPendingActions()
    
    // 设置导航栏状态
    this.setData({
      navFixed: true
    })
    
    // 检查是否需要刷新数据
    const needRefresh = wx.getStorageSync('need_refresh_home')
    if (needRefresh) {
      // 清除刷新标记
      wx.removeStorageSync('need_refresh_home')
      
      // 重新加载数据
      setTimeout(() => {
        this.loadRecentActivities()
        this.loadTodayStats()
        this.loadTotalStats()
        this.checkAndUpdateAchievements()
        
        // 显示提示
        wx.showToast({
          title: '数据已更新',
          icon: 'success',
          duration: 1500
        })
      }, 100)
    }
  },

  // 加载最近活动
  loadRecentActivities() {
    // 从本地存储获取各种数据
    const theoryHistory = wx.getStorageSync('theory_history') || []
    const actionHistory = wx.getStorageSync('action_history') || []
    const executionHistory = wx.getStorageSync('execution_history') || []
    
    // 合并所有活动并按时间排序
    let activities = []
    
    // 添加理论记录
    theoryHistory.forEach(item => {
      activities.push({
        id: 'theory_' + item.id,
        type: 'theory',
        icon: '💡',
        title: '记录了新理论',
        description: item.content ? item.content.substring(0, 30) + '...' : '理论记录',
        time: this.formatTime(item.createTime || item.timestamp),
        originalData: item
      })
    })
    
    // 添加行动记录
    actionHistory.forEach(item => {
      activities.push({
        id: 'action_' + item.id,
        type: 'action',
        icon: '🎯',
        title: '生成了行动建议',
        description: item.content ? item.content.substring(0, 30) + '...' : '行动建议',
        time: this.formatTime(item.createTime || item.timestamp),
        originalData: item
      })
    })
    
    // 添加执行记录
    executionHistory.forEach(item => {
      activities.push({
        id: 'execution_' + item.id,
        type: 'execution',
        icon: '✅',
        title: '完成了执行记录',
        description: item.content ? item.content.substring(0, 30) + '...' : '执行记录',
        time: this.formatTime(item.createTime || item.timestamp),
        originalData: item
      })
    })
    
    // 按时间排序，最新的在前
    activities.sort((a, b) => {
      const timeA = new Date(a.time).getTime()
      const timeB = new Date(b.time).getTime()
      return timeB - timeA
    })
    
    // 只显示最近5条
    activities = activities.slice(0, 5)
    
    this.setData({
      recentActivities: activities
    })
  },

  // 加载今日统计数据
  loadTodayStats() {
    const today = new Date()
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()
    const todayEnd = todayStart + 24 * 60 * 60 * 1000

    // 获取各类数据
    const theoryHistory = wx.getStorageSync('theory_history') || []
    const actionHistory = wx.getStorageSync('action_history') || []
    const executionHistory = wx.getStorageSync('execution_history') || []

    // 统计今日数据
    const theoryCount = theoryHistory.filter(item => {
      const time = new Date(item.createTime || item.timestamp).getTime()
      return time >= todayStart && time < todayEnd
    }).length

    const actionCount = actionHistory.filter(item => {
      const time = new Date(item.createTime || item.timestamp).getTime()
      return time >= todayStart && time < todayEnd
    }).length

    const executionCount = executionHistory.filter(item => {
      const time = new Date(item.createTime || item.timestamp).getTime()
      return time >= todayStart && time < todayEnd
    }).length

    this.setData({
      todayStats: {
        theoryCount,
        actionCount,
        executionCount
      }
    })
  },

  // 加载总统计数据
  loadTotalStats() {
    // 设置加载状态
    this.setData({
      'totalStats.loading': true
    });
    
    getFeishuStats()
      .then(response => {
        if (response.success && response.data) {
          const stats = response.data;
          this.setData({
            totalStats: {
              theoryCount: stats.theoryCount || 0,
              actionCount: stats.actionCount || 0,
              executionCount: stats.executionCount || 0,
              loading: false
            }
          });
        } else {
          this.setData({
            'totalStats.loading': false
          });
        }
      })
      .catch(error => {
        console.error('获取飞书统计数据失败:', error);
        // 静默失败，不显示错误提示
        this.setData({
          totalStats: {
            theoryCount: 0,
            actionCount: 0,
            executionCount: 0,
            loading: false
          }
        });
      });
  },

  // 时间格式化
  formatTime(timestamp) {
    if (!timestamp) return '刚刚'
    
    const now = new Date()
    const time = new Date(timestamp)
    const diff = now.getTime() - time.getTime()
    
    if (diff < 60000) { // 1分钟内
      return '刚刚'
    } else if (diff < 3600000) { // 1小时内
      return Math.floor(diff / 60000) + '分钟前'
    } else if (diff < 86400000) { // 1天内
      return Math.floor(diff / 3600000) + '小时前'
    } else if (diff < 604800000) { // 1周内
      return Math.floor(diff / 86400000) + '天前'
    } else {
      return time.toLocaleDateString()
    }
  },

  // 触摸开始事件 - 取消导航栏置顶
  onTouchStart() {
    this.setData({
      navFixed: false
    })
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadRecentActivities()
    this.loadTodayStats()
    this.loadTotalStats()
    
    wx.showToast({
      title: '数据已更新',
      icon: 'success',
      duration: 1000
    })
    
    // 停止下拉刷新
    setTimeout(() => {
      wx.stopPullDownRefresh()
    }, 1000)
  },

  // 页面导航方法
  navigateToTheory() {
    wx.navigateTo({
      url: '/pages/theory/theory'
    })
  },

  navigateToAction() {
    wx.navigateTo({
      url: '/pages/action/action'
    })
  },

  navigateToExecution() {
    wx.navigateTo({
      url: '/pages/execution/execution'
    })
  },

  navigateToProgress() {
    wx.navigateTo({
      url: '/pages/progress/progress'
    })
  },

  navigateToAchievement() {
    wx.navigateTo({
      url: '/pages/achievement/achievement'
    })
  },

  navigateToFeishuTest() {
    wx.navigateTo({
      url: '/pages/feishu-test/feishu-test'
    })
  },

  // 快速操作
  quickAddTheory() {
    wx.navigateTo({
      url: '/pages/theory/theory?action=add'
    })
  },

  quickGenerateAction() {
    // 检查是否有理论记录
    const currentTheory = wx.getStorageSync('current_theory')
    const theoryHistory = wx.getStorageSync('theory_history') || []
    
    if (!currentTheory && theoryHistory.length === 0) {
      wx.showModal({
        title: '提示',
        content: '请先记录一些理论，然后再生成行动建议',
        showCancel: false,
        confirmText: '去记录',
        success: (res) => {
          if (res.confirm) {
            this.navigateToTheory()
          }
        }
      })
      return
    }

    wx.navigateTo({
      url: '/pages/action/action?action=generate'
    })
  },

  // 处理活动点击事件
  onActivityTap(e) {
    const { index } = e.currentTarget.dataset
    const activity = this.data.recentActivities[index]
    
    if (!activity) return
    
    switch (activity.type) {
      case 'theory':
        // 点击理论记录，跳转到行动生成页面，并设置当前理论
        wx.setStorageSync('current_theory', activity.originalData.content || activity.originalData.text)
        wx.navigateTo({
          url: '/pages/action/action'
        })
        break
        
      case 'action':
        // 点击行动记录，跳转到执行记录页面，并设置当前行动计划
        wx.setStorageSync('current_action_plan', activity.originalData.content || activity.originalData.text)
        wx.navigateTo({
          url: '/pages/execution/execution'
        })
        break
        
      case 'execution':
        // 点击执行记录，跳转到进展反馈页面
        wx.navigateTo({
          url: '/pages/progress/progress'
        })
        break
        
      default:
        console.log('未知的活动类型:', activity.type)
    }
  },





  // 长按删除活动
  deleteActivity(e) {
    const { index, id } = e.currentTarget.dataset
    const activities = this.data.recentActivities
    const activity = activities[index]
    
    wx.showActionSheet({
      itemList: ['删除此记录'],
      itemColor: '#ff3b30',
      success: (res) => {
        if (res.tapIndex === 0) {
          wx.showModal({
            title: '确认删除',
            content: `确定要删除这条活动记录吗？\n"${activity.title}"`,
            confirmColor: '#ff3b30',
            success: (modalRes) => {
              if (modalRes.confirm) {
                // 从界面数组中删除
                activities.splice(index, 1)
                this.setData({
                  recentActivities: activities
                })
                
                // 从本地存储中删除
                this.deleteFromStorage(id)
                
                // 重新加载统计数据
                this.loadTodayStats()
                this.loadTotalStats()
                
                wx.showToast({
                  title: '删除成功',
                  icon: 'success'
                })
              }
            }
          })
        }
      }
    })
  },

  // 从本地存储中删除数据
  deleteFromStorage(id) {
    const [type, itemId] = id.split('_')
    const storageKey = type + '_history'
    
    try {
      let history = wx.getStorageSync(storageKey) || []
      history = history.filter(item => item.id != itemId)
      wx.setStorageSync(storageKey, history)
    } catch (error) {
      console.error('删除本地数据失败:', error)
    }
  },

  // 分享给朋友
  onShareAppMessage() {
    // 增加分享计数
    shareManager.incrementShareCount();
    
    const stats = this.data.todayStats;
    return shareManager.shareTodayStats({
      theoryCount: stats.theoryCount,
      actionCount: stats.actionCount,
      executionCount: stats.executionCount
    });
  },

  // 分享到朋友圈
  onShareTimeline() {
    // 增加分享计数
    shareManager.incrementShareCount();
    
    const stats = this.data.todayStats;
    return shareManager.shareTodayStats({
      theoryCount: stats.theoryCount,
      actionCount: stats.actionCount,
      executionCount: stats.executionCount
    });
  },

  /**
   * 检查并更新成就系统
   */
  checkAndUpdateAchievements() {
    try {
      // 获取各类数据统计
      const theoryHistory = wx.getStorageSync('theory_history') || []
      const actionHistory = wx.getStorageSync('action_history') || []
      const executionHistory = wx.getStorageSync('execution_history') || []
      
      // 计算总体统计
      const totalTheories = theoryHistory.length
      const totalActions = actionHistory.length
      const totalExecutions = executionHistory.length
      
      // 计算使用天数
      const usageDays = this.calculateUsageDays()
      
      // 计算高分执行次数（4分及以上）
      const highScoreCount = executionHistory.filter(record => record.rating >= 4).length
      
      // 更新成就数据到本地存储
      const achievementStats = {
        totalTheories,
        totalActions,
        totalExecutions,
        usageDays,
        highScoreCount,
        lastUpdateTime: Date.now()
      }
      
      wx.setStorageSync('achievement_stats', achievementStats)
      
    } catch (error) {
      console.error('更新成就统计失败:', error)
    }
  },

  /**
   * 计算使用天数
   */
  calculateUsageDays() {
    try {
      const allRecords = []
      
      // 收集所有记录的日期
      const theoryHistory = wx.getStorageSync('theory_history') || []
      const actionHistory = wx.getStorageSync('action_history') || []
      const executionHistory = wx.getStorageSync('execution_history') || []
      
      theoryHistory.forEach(record => {
        if (record.createTime) {
          const date = new Date(record.createTime).toDateString()
          if (!allRecords.includes(date)) {
            allRecords.push(date)
          }
        }
      })
      
      actionHistory.forEach(record => {
        if (record.createTime) {
          const date = new Date(record.createTime).toDateString()
          if (!allRecords.includes(date)) {
            allRecords.push(date)
          }
        }
      })
      
      executionHistory.forEach(record => {
        if (record.timestamp) {
          const date = new Date(record.timestamp).toDateString()
          if (!allRecords.includes(date)) {
            allRecords.push(date)
          }
        }
      })
      
      return allRecords.length
    } catch (error) {
      console.error('计算使用天数失败:', error)
      return 0
    }
  },

  /**
   * 检查待执行的行动
   */
  checkPendingActions() {
    try {
      const actionHistory = wx.getStorageSync('action_history') || []
      const executionHistory = wx.getStorageSync('execution_history') || []
      
      if (actionHistory.length === 0) {
        this.setData({ pendingAction: null, pendingHours: 0 })
        return
      }
      
      // 获取最新的行动计划
      const latestAction = actionHistory[0]
      const actionTime = new Date(latestAction.createTime)
      const now = new Date()
      
      // 计算时间差
      const hoursDiff = (now - actionTime) / (1000 * 60 * 60)
      
      // 检查是否已经有对应的执行记录
      const hasExecution = executionHistory.some(execution => {
        const executionTime = new Date(execution.timestamp)
        return executionTime > actionTime
      })
      
      if (!hasExecution && hoursDiff >= 1) {
        // 显示待执行提醒卡片
        this.setData({
          pendingAction: latestAction,
          pendingHours: Math.floor(hoursDiff)
        })
        
        // 如果超过12小时，记录到控制台
        if (hoursDiff >= 12) {
          console.log(`⏰ 执行提醒: 行动计划已超过12小时未执行 - ${latestAction.title || latestAction.description}`);
        }
      } else {
        this.setData({ pendingAction: null, pendingHours: 0 })
      }
    } catch (error) {
      console.error('检查待执行行动失败:', error)
    }
  }
})
