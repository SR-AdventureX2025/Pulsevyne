// 行动生成页面逻辑
const { generateSuggestions } = require('../../config/api.js');
const reminderManager = require('../../utils/reminderManager.js');
const { feishuManager } = require('../../utils/feishuManager.js');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    theoryText: '', // 理论文本
    isGenerating: false, // 是否正在生成建议
    actionSuggestions: [], // AI生成的行动建议
    customAction: '', // 自定义行动
    selectedSuggestions: [], // 选中的建议数组（支持多选）
    currentPage: 'action',
    navFixed: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 获取理论文本
    this.loadTheoryText();
    // 自动生成行动建议
    this.generateActionSuggestions();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // 页面显示时的逻辑
    this.setData({
      navFixed: true
    });
    
    // 重新加载理论文本，确保数据是最新的
    this.loadTheoryText();
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
    // 当前页面，不需要跳转
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

  /**
   * 加载理论文本
   */
  loadTheoryText() {
    try {
      // 从本地存储获取最新的理论文本
      const theoryText = wx.getStorageSync('current_theory');
      
      if (theoryText && theoryText.trim()) {
        this.setData({
          theoryText: theoryText.trim()
        });
      } else {
        // 如果没有理论数据，尝试从历史记录获取最新的一条
        const history = wx.getStorageSync('theory_history') || [];
        if (history.length > 0) {
          this.setData({
            theoryText: history[0].content
          });
          // 同时更新current_theory
          wx.setStorageSync('current_theory', history[0].content);
        } else {
          this.setData({
            theoryText: '暂无理论记录，请先到理论记录页面添加内容'
          });
        }
      }
    } catch (error) {
      console.error('加载理论文本失败:', error);
      this.setData({
        theoryText: '加载理论数据失败，请重试'
      });
    }
  },

  /**
   * 生成行动建议
   */
  generateActionSuggestions() {
    const theoryText = this.data.theoryText.trim();
    
    // 检查是否有有效的理论内容
    if (!theoryText || 
        theoryText === '暂无理论记录，请先到理论记录页面添加内容' ||
        theoryText === '加载理论数据失败，请重试') {
      
      wx.showModal({
        title: '提示',
        content: '暂无理论记录，请先到理论记录页面添加内容，或者使用模拟数据？',
        cancelText: '去添加理论',
        confirmText: '使用模拟数据',
        success: (res) => {
          if (res.confirm) {
            // 使用模拟数据
            const suggestions = this.getMockSuggestions();
            this.setData({
              actionSuggestions: suggestions
            });
          } else {
            // 跳转到理论记录页面
            wx.navigateTo({
              url: '/pages/theory/theory'
            });
          }
        }
      });
      return;
    }

    this.setData({
      isGenerating: true,
      actionSuggestions: []
    });

    // 调用API生成建议
    this.callGenerateSuggestionsAPI(theoryText);
  },

  /**
   * 调用API生成建议
   */
  callGenerateSuggestionsAPI(theoryText) {
    generateSuggestions(theoryText)
      .then((response) => {
        console.log('API响应数据:', response);
        
        if (response.success && response.data && response.data.suggestions) {
          // 转换API返回的数据格式
          const suggestions = response.data.suggestions.map(item => ({
            icon: item.emoji || '💡',
            title: item.title.replace(/^[🎯📅💻🛠️📈]+\s*/, ''), // 移除标题前的emoji
            description: item.content
          }));
          
          this.setData({
            isGenerating: false,
            actionSuggestions: suggestions
          });
        } else {
          throw new Error(response.message || '生成失败');
        }
      })
      .catch((error) => {
        console.error('API调用失败:', error);
        this.handleAPIError(error.message || '网络请求失败');
      });
  },

  /**
   * 处理API错误
   */
  handleAPIError(message) {
    this.setData({
      isGenerating: false
    });
    
    wx.showModal({
      title: '提示',
      content: message + '，是否使用模拟数据？',
      success: (res) => {
        if (res.confirm) {
          // 使用模拟数据
          const suggestions = this.getMockSuggestions();
          this.setData({
            actionSuggestions: suggestions
          });
        }
      }
    });
  },

  /**
   * 获取模拟建议数据
   */
  getMockSuggestions() {
    const mockSuggestions = [
      {
        icon: '📚',
        title: '深度学习',
        description: '每天花30分钟深入研究相关理论，建立知识体系，做好笔记和思维导图。'
      },
      {
        icon: '💪',
        title: '实践练习',
        description: '制定具体的实践计划，从小事做起，每天坚持应用所学理论。'
      },
      {
        icon: '👥',
        title: '分享交流',
        description: '与他人分享你的理解，通过教授他人来加深自己的认知。'
      },
      {
        icon: '📝',
        title: '反思总结',
        description: '定期回顾实践效果，总结经验教训，不断优化行动方案。'
      }
    ];

    // 随机返回2-3个建议
    const count = Math.floor(Math.random() * 2) + 2;
    return mockSuggestions.slice(0, count);
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
   * 自定义行动输入变化
   */
  onCustomActionChange(e) {
    this.setData({
      customAction: e.detail.value
    });
  },

  /**
   * 选择建议（支持多选）
   */
  selectSuggestion(e) {
    const index = e.currentTarget.dataset.index;
    const suggestion = this.data.actionSuggestions[index];
    const selectedSuggestions = [...this.data.selectedSuggestions];
    
    // 检查是否已经选中
    const existingIndex = selectedSuggestions.findIndex(item => item.title === suggestion.title);
    
    if (existingIndex > -1) {
      // 如果已选中，则取消选择
      selectedSuggestions.splice(existingIndex, 1);
      wx.showToast({
        title: '已取消选择',
        icon: 'none'
      });
    } else {
      // 如果未选中，则添加到选择列表
      selectedSuggestions.push(suggestion);
      wx.showToast({
        title: '已添加建议',
        icon: 'success'
      });
    }
    
    // 更新选中状态
    const updatedSuggestions = this.data.actionSuggestions.map((item, idx) => ({
      ...item,
      selected: selectedSuggestions.some(selected => selected.title === item.title)
    }));
    
    // 生成自定义行动文本（多个建议用换行分隔）
    const customActionText = selectedSuggestions.map((item, idx) => 
      `${idx + 1}. ${item.description}`
    ).join('\n\n');
    
    this.setData({
      selectedSuggestions: selectedSuggestions,
      actionSuggestions: updatedSuggestions,
      customAction: customActionText
    });
  },

  /**
   * 重新生成建议
   */
  regenerateActions() {
    wx.showModal({
      title: '重新生成',
      content: '确定要重新生成行动建议吗？',
      success: (res) => {
        if (res.confirm) {
          this.generateActionSuggestions();
        }
      }
    });
  },

  /**
   * 确认行动
   */
  confirmAction() {
    let actionPlan = '';
    let actionTitle = '';
    
    if (this.data.selectedSuggestions.length > 0) {
      actionPlan = this.data.customAction.trim();
      actionTitle = this.data.selectedSuggestions.length === 1 
        ? this.data.selectedSuggestions[0].title 
        : `组合行动计划（${this.data.selectedSuggestions.length}项）`;
    } else if (this.data.customAction.trim()) {
      actionPlan = this.data.customAction.trim();
      actionTitle = '自定义行动';
    }

    if (!actionPlan) {
      wx.showToast({
        title: '请选择建议或输入自定义行动',
        icon: 'none'
      });
      return;
    }

    wx.showLoading({
      title: '保存中...'
    });

    // 保存行动计划
    try {
      wx.setStorageSync('current_action_plan', actionPlan);
      
      // 保存到历史记录
      const historyKey = 'action_history';
      let history = wx.getStorageSync(historyKey) || [];
      const newRecord = {
        id: Date.now(),
        content: actionPlan,
        createTime: new Date().toISOString(),
        timestamp: Date.now(),
        theoryText: this.data.theoryText,
        title: actionTitle,
        description: actionPlan,
        selectedSuggestions: this.data.selectedSuggestions // 保存选中的建议信息
      };
      history.unshift(newRecord);
      // 只保留最近50条记录
      if (history.length > 50) {
        history = history.slice(0, 50);
      }
      wx.setStorageSync(historyKey, history);
      
      // 触发成就检查
      this.checkAchievements();
      
      // 设置12小时后的执行提醒
      try {
        const reminderId = reminderManager.setActionReminder({
          id: newRecord.id,
          title: newRecord.title,
          description: actionPlan.length > 20 ? actionPlan.substring(0, 20) + '...' : actionPlan
        });
        console.log('执行提醒已设置:', reminderId);
      } catch (error) {
        console.error('设置提醒失败:', error);
      }
      
      setTimeout(() => {
        wx.hideLoading();
        
        // 设置标记，表示数据已更新，需要刷新主页
        wx.setStorageSync('need_refresh_home', true);
        
        wx.showToast({
          title: '保存成功',
          icon: 'success',
          duration: 1500,
          success: () => {
            // 静默同步到飞书
            setTimeout(() => {
              this.syncActionToFeishu(newRecord);
            }, 500);
          }
        });
      }, 1000);
    } catch (error) {
      wx.hideLoading();
      console.error('保存行动计划失败:', error);
      wx.showToast({
        title: '保存失败，请重试',
        icon: 'error'
      });
    }
  },

  /**
   * 同步行动到飞书
   */
  syncActionToFeishu(actionRecord) {
    const actionData = {
      title: actionRecord.title,
      content: actionRecord.content,
      priority: '中等',
      timestamp: new Date().toLocaleString()
    };

    const formattedText = feishuManager.formatRecordText(
      feishuManager.getLineTypes().ACTION, 
      actionData
    );

    feishuManager.createActionRecord(formattedText)
      .then(response => {
        console.log('飞书同步成功:', response);
        // 静默成功，直接跳转到执行记录页面
        wx.navigateTo({
          url: '/pages/execution/execution'
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
        
        // 即使同步失败也继续跳转
        setTimeout(() => {
          wx.navigateTo({
            url: '/pages/execution/execution'
          });
        }, 3000);
      });
  },

  /**
   * 检查成就解锁
   */
  checkAchievements() {
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
        const actionHistory = wx.getStorageSync('action_history') || [];
        
        // 检查计划师成就
        if (actionHistory.length === 1) {
          console.log('🎉 解锁成就: 计划师');
        }
        
        // 检查行动大师成就
        if (actionHistory.length === 10) {
          console.log('🎉 解锁成就: 行动大师');
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

    if (pageMap[page] && page !== 'action') {
      wx.navigateTo({
        url: pageMap[page]
      });
    }
  }
});