// 执行记录页面逻辑
const reminderManager = require('../../utils/reminderManager.js');
const { feishuManager } = require('../../utils/feishuManager.js');
Page({
  /**
   * 页面的初始数据
   */
  data: {
    actionPlan: '', // 当前行动计划
    executionDetail: '', // 执行详情
    rating: 0, // 执行评分
    ratingTexts: ['很差', '较差', '一般', '良好', '优秀'], // 评分文本
    quickRecordType: '', // 快速记录类型
    executionHistory: [], // 执行历史记录
    currentPage: 'execution',
    navFixed: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 加载行动计划
    this.loadActionPlan();
    // 加载执行历史
    this.loadExecutionHistory();
    // 加载草稿
    this.loadDraft();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // 页面显示时的逻辑
    this.setData({
      navFixed: true
    })
  },

  /**
   * 触摸开始事件 - 取消导航栏置顶
   */
  onTouchStart() {
    this.setData({
      navFixed: false
    })
  },

  /**
   * 导航方法
   */
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
    // 当前页面，不需要跳转
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

  /**
   * 加载行动计划
   */
  loadActionPlan() {
    try {
      const actionPlan = wx.getStorageSync('current_action_plan') || '暂无行动计划';
      this.setData({
        actionPlan: actionPlan
      });
    } catch (error) {
      console.error('加载行动计划失败:', error);
    }
  },

  /**
   * 加载执行历史
   */
  loadExecutionHistory() {
    try {
      const history = wx.getStorageSync('execution_history') || [];
      // 只显示最近5条记录
      const recentHistory = history.slice(0, 5).map(item => ({
        ...item,
        rating: new Array(item.rating).fill('⭐')
      }));
      
      this.setData({
        executionHistory: recentHistory
      });
    } catch (error) {
      console.error('加载执行历史失败:', error);
    }
  },

  /**
   * 加载草稿
   */
  loadDraft() {
    try {
      const draft = wx.getStorageSync('execution_draft');
      if (draft) {
        this.setData({
          executionDetail: draft.detail || '',
          rating: draft.rating || 0,
          quickRecordType: draft.type || ''
        });
      }
    } catch (error) {
      console.error('加载草稿失败:', error);
    }
  },

  /**
   * 返回按钮点击
   */
  goBack() {
    wx.navigateBack({
      delta: 1
    });
  },

  /**
   * 快速记录
   */
  quickRecord(e) {
    const type = e.currentTarget.dataset.type;
    const typeMap = {
      'completed': { text: '已完成', status: 'completed' },
      'partial': { text: '部分完成', status: 'partial' },
      'delayed': { text: '延期执行', status: 'delayed' }
    };

    this.setData({
      quickRecordType: type
    });

    wx.showToast({
      title: `已选择：${typeMap[type].text}`,
      icon: 'success'
    });
  },

  /**
   * 详情输入变化
   */
  onDetailChange(e) {
    this.setData({
      executionDetail: e.detail.value
    });
  },

  /**
   * 设置评分
   */
  setRating(e) {
    const rating = parseInt(e.currentTarget.dataset.rating);
    this.setData({
      rating: rating
    });

    wx.showToast({
      title: `评分：${this.data.ratingTexts[rating - 1]}`,
      icon: 'success'
    });
  },

  /**
   * 保存草稿
   */
  saveDraft() {
    if (!this.data.executionDetail.trim() && !this.data.quickRecordType && !this.data.rating) {
      wx.showToast({
        title: '暂无内容需要保存',
        icon: 'none'
      });
      return;
    }

    try {
      const draft = {
        detail: this.data.executionDetail,
        rating: this.data.rating,
        type: this.data.quickRecordType,
        timestamp: Date.now()
      };

      wx.setStorageSync('execution_draft', draft);
      
      wx.showToast({
        title: '草稿已保存',
        icon: 'success'
      });
    } catch (error) {
      wx.showToast({
        title: '保存失败',
        icon: 'error'
      });
    }
  },

  /**
   * 提交记录
   */
  submitRecord() {
    // 验证必填项
    if (!this.data.quickRecordType) {
      wx.showToast({
        title: '请选择执行状态',
        icon: 'none'
      });
      return;
    }

    if (!this.data.rating) {
      wx.showToast({
        title: '请为执行效果评分',
        icon: 'none'
      });
      return;
    }

    wx.showLoading({
      title: '提交中...'
    });

    // 构建记录数据
    const typeMap = {
      'completed': { text: '已完成', status: 'completed' },
      'partial': { text: '部分完成', status: 'partial' },
      'delayed': { text: '延期执行', status: 'delayed' }
    };

    const record = {
      id: Date.now(),
      date: this.formatDate(new Date()),
      status: this.data.quickRecordType,
      statusText: typeMap[this.data.quickRecordType].text,
      content: this.data.executionDetail || '无详细描述',
      rating: this.data.rating,
      actionPlan: this.data.actionPlan,
      timestamp: Date.now()
    };

    try {
      // 保存到历史记录
      const history = wx.getStorageSync('execution_history') || [];
      history.unshift(record);
      
      // 只保留最近50条记录
      if (history.length > 50) {
        history.splice(50);
      }
      
      wx.setStorageSync('execution_history', history);
      
      // 触发成就检查
      this.checkAchievements(record);
      
      // 获取当前行动ID并取消对应的提醒
      try {
        const actionHistory = wx.getStorageSync('action_history') || [];
        if (actionHistory.length > 0) {
          const currentActionId = actionHistory[0].id; // 获取最新的行动ID
          reminderManager.cancelReminder(currentActionId);
          console.log('已取消行动提醒:', currentActionId);
        }
      } catch (error) {
        console.error('取消提醒失败:', error);
      }
      
      // 清除草稿
      wx.removeStorageSync('execution_draft');
      
      setTimeout(() => {
        wx.hideLoading();
        
        wx.showToast({
          title: '记录提交成功',
          icon: 'success',
          duration: 1500,
          success: () => {
            // 重置表单
            this.setData({
              executionDetail: '',
              rating: 0,
              quickRecordType: ''
            });
            
            // 重新加载历史记录
            this.loadExecutionHistory();
            
            // 静默同步到飞书
            setTimeout(() => {
              this.syncExecutionToFeishu(record);
            }, 500);
          }
        });
      }, 1500);
    } catch (error) {
      wx.hideLoading();
      wx.showToast({
        title: '提交失败',
        icon: 'error'
      });
    }
  },

  /**
   * 同步执行记录到飞书
   */
  syncExecutionToFeishu(executionRecord) {
    const executionData = {
      content: executionRecord.content,
      progress: executionRecord.statusText,
      rating: `${executionRecord.rating}/5 (${this.data.ratingTexts[executionRecord.rating - 1] || 'N/A'})`,
      timestamp: new Date().toLocaleString()
    };

    const formattedText = feishuManager.formatRecordText(
      feishuManager.getLineTypes().EXECUTION, 
      executionData
    );

    feishuManager.createExecutionRecord(formattedText)
      .then(response => {
        // 静默成功，跳转到进展反馈页面
        wx.navigateTo({
          url: '/pages/progress/progress'
        });
      })
      .catch(error => {
        console.error('飞书同步失败:', error);
        
        // 只在出错时显示错误信息
        wx.showToast({
          title: `同步失败: ${error.message}`,
          icon: 'error',
          duration: 3000
        });
        
        // 即使同步失败也跳转到进展反馈页面
        setTimeout(() => {
          wx.navigateTo({
            url: '/pages/progress/progress'
          });
        }, 3000);
      });
  },

  /**
   * 检查成就解锁
   */
  checkAchievements(record) {
    try {
      // 获取成就展厅页面实例
      const pages = getCurrentPages();
      let achievementPage = null;
      
      // 查找成就展厅页面实例
      for (let page of pages) {
        if (page.route === 'pages/achievement/achievement') {
          achievementPage = page;
          break;
        }
      }
      
      // 如果找不到成就页面实例，创建临时检查逻辑
      if (!achievementPage) {
        const executionHistory = wx.getStorageSync('execution_history') || [];
        const currentHour = new Date().getHours();
        
        // 检查行动家成就
        if (executionHistory.length === 1) {
          console.log('🎉 解锁成就: 行动家');
        }
        
        // 检查完美执行成就
        if (record.rating === 5) {
          console.log('🎉 解锁成就: 完美执行');
        }
        
        // 检查夜猫子成就
        if (currentHour >= 23) {
          console.log('🎉 解锁成就: 夜猫子');
        }
        
        // 检查周连击成就
        if (executionHistory.length >= 7) {
          const recentRecords = executionHistory.slice(0, 7);
          const isConsecutive = this.checkConsecutiveDays(recentRecords);
          if (isConsecutive) {
            console.log('🎉 解锁成就: 周连击');
          }
        }
      } else {
        // 调用成就页面的更新方法
        achievementPage.updateAchievementProgress();
      }
    } catch (error) {
      console.error('检查成就失败:', error);
    }
  },

  /**
   * 检查连续天数
   */
  checkConsecutiveDays(records) {
    if (records.length < 7) return false;
    
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() - i);
      const targetDateStr = this.formatDate(targetDate);
      
      const hasRecord = records.some(record => record.date === targetDateStr);
      if (!hasRecord) return false;
    }
    
    return true;
  },

  /**
   * 格式化日期
   */
  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  /**
   * 切换页面
   */
  switchPage(e) {
    const page = e.currentTarget.dataset.page;
    const pageMap = {
      'theory': '/pages/theory/theory',
      'action': '/pages/action/action',
      'execution': '/pages/execution/execution',
      'progress': '/pages/progress/progress',
      'achievement': '/pages/achievement/achievement'
    };

    if (pageMap[page] && page !== 'execution') {
      wx.navigateTo({
        url: pageMap[page]
      });
    }
  }
});