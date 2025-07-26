// 进展反馈页面逻辑
const { generateFeedback } = require('../../config/api.js');
const shareManager = require('../../utils/shareManager.js');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    weeklyCount: 0, // 本周执行次数
    averageRating: 0, // 平均评分
    completionRate: 0, // 完成率
    trendData: [], // 趋势数据
    trendDescription: '', // 趋势描述
    isGeneratingFeedback: false, // 是否正在生成反馈
    aiFeedback: [], // AI反馈建议
    improvements: [], // 改进建议
    currentPage: 'progress',
    navFixed: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 加载执行数据
    this.loadExecutionData();
    // 生成趋势数据
    this.generateTrendData();
    // 生成AI反馈
    this.generateAIFeedback();
    // 生成改进建议
    this.generateImprovements();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // 页面显示时重新加载数据
    this.loadExecutionData();
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
    wx.navigateTo({
      url: '/pages/execution/execution'
    })
  },

  navigateToProgress() {
    // 当前页面，不需要跳转
  },

  navigateToAchievement() {
    wx.navigateTo({
      url: '/pages/achievement/achievement'
    })
  },

  /**
   * 加载执行数据
   */
  loadExecutionData() {
    try {
      const history = wx.getStorageSync('execution_history') || [];
      
      // 计算本周数据
      const now = new Date();
      const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
      
      const weeklyRecords = history.filter(record => {
        const recordDate = new Date(record.timestamp);
        return recordDate >= weekStart;
      });
      
      // 计算统计数据
      const weeklyCount = weeklyRecords.length;
      const completedCount = weeklyRecords.filter(record => record.status === 'completed').length;
      const completionRate = weeklyCount > 0 ? Math.round((completedCount / weeklyCount) * 100) : 0;
      
      const totalRating = weeklyRecords.reduce((sum, record) => sum + record.rating, 0);
      const averageRating = weeklyCount > 0 ? (totalRating / weeklyCount).toFixed(1) : 0;
      
      this.setData({
        weeklyCount,
        averageRating,
        completionRate
      });
    } catch (error) {
      console.error('加载执行数据失败:', error);
    }
  },

  /**
   * 生成趋势数据
   */
  generateTrendData() {
    try {
      const history = wx.getStorageSync('execution_history') || [];
      const now = new Date();
      
      // 生成最近7天的数据
      const trendData = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
        const dayRecords = history.filter(record => {
          const recordDate = new Date(record.timestamp);
          return recordDate.toDateString() === date.toDateString();
        });
        
        const dayLabel = ['日', '一', '二', '三', '四', '五', '六'][date.getDay()];
        const height = Math.min(dayRecords.length * 20 + 20, 100); // 最高100%
        
        trendData.push({
          label: dayLabel,
          height: height,
          count: dayRecords.length
        });
      }
      
      // 生成趋势描述
      const recentDays = trendData.slice(-3);
      const avgRecent = recentDays.reduce((sum, day) => sum + day.count, 0) / 3;
      const previousDays = trendData.slice(0, 3);
      const avgPrevious = previousDays.reduce((sum, day) => sum + day.count, 0) / 3;
      
      let trendDescription = '';
      if (avgRecent > avgPrevious) {
        trendDescription = '📈 您的执行频率呈上升趋势，保持这个良好的势头！';
      } else if (avgRecent < avgPrevious) {
        trendDescription = '📉 最近的执行频率有所下降，建议调整计划或降低难度。';
      } else {
        trendDescription = '📊 您的执行频率保持稳定，这是一个很好的习惯。';
      }
      
      this.setData({
        trendData,
        trendDescription
      });
    } catch (error) {
      console.error('生成趋势数据失败:', error);
    }
  },

  /**
   * 生成AI反馈
   */
  generateAIFeedback() {
    const { weeklyCount, averageRating } = this.data;
    
    // 检查是否有足够的执行数据
    if (weeklyCount === 0) {
      wx.showModal({
        title: '提示',
        content: '暂无执行记录，请先到执行记录页面添加内容，或者使用模拟数据？',
        cancelText: '去添加执行',
        confirmText: '使用模拟数据',
        success: (res) => {
          if (res.confirm) {
            // 使用模拟数据
            const feedback = this.getMockFeedback();
            this.setData({
              aiFeedback: feedback
            });
          } else {
            // 跳转到执行记录页面
            wx.navigateTo({
              url: '/pages/execution/execution'
            });
          }
        }
      });
      return;
    }

    this.setData({
      isGeneratingFeedback: true
    });
    
    // 调用API生成反馈
    this.callGenerateFeedbackAPI();
  },

  /**
   * 调用生成反馈API
   */
  callGenerateFeedbackAPI() {
    const { weeklyCount, averageRating, completionRate } = this.data;
    
    // 确定执行频率描述
    let executionFrequency = '偶尔执行';
    if (weeklyCount >= 7) {
      executionFrequency = '每天执行';
    } else if (weeklyCount >= 3) {
      executionFrequency = '每周3-4次';
    } else if (weeklyCount >= 1) {
      executionFrequency = '每周1-2次';
    }
    
    // 获取最近的行动计划和原因
    const actionHistory = wx.getStorageSync('action_history') || [];
    const latestAction = actionHistory.length > 0 ? actionHistory[0] : null;
    
    const executionSummary = {
      weekly_executions: weeklyCount,
      average_rating: parseFloat(averageRating),
      completion_rate: completionRate,
      execution_frequency: executionFrequency,
      action_plan: latestAction ? (latestAction.title || latestAction.description || '制定学习和工作计划') : '制定学习和工作计划',
      reason: latestAction ? (latestAction.reason || '提升个人能力和工作效率') : '提升个人能力和工作效率'
    };
    
    generateFeedback(executionSummary)
      .then((response) => {
        if (response.success && response.data) {
          const { status_feedback, improvement_suggestions } = response.data;
          
          // 转换API返回的数据格式
          const aiFeedback = status_feedback.map(item => ({
            type: 'positive',
            icon: item.emoji || '📊',
            label: item.title.replace(/^[📈✅📊🎯💪⚠️]+\s*/, ''),
            content: item.content
          }));
          
          const improvements = improvement_suggestions.map(item => ({
            title: item.title.replace(/^[🎯📊💡🔍]+\s*/, ''),
            priority: 'medium',
            priorityText: '中优先级',
            description: item.content
          }));
          
          this.setData({
            isGeneratingFeedback: false,
            aiFeedback: aiFeedback,
            improvements: improvements
          });
        } else {
          throw new Error(response.message || '生成反馈失败');
        }
      })
      .catch((error) => {
        console.error('API调用失败:', error);
        this.handleFeedbackAPIError(error.message || '网络请求失败');
      });
  },

  /**
   * 处理反馈API错误
   */
  handleFeedbackAPIError(message) {
    this.setData({
      isGeneratingFeedback: false
    });
    
    wx.showModal({
      title: '提示',
      content: message + '，是否使用模拟数据？',
      success: (res) => {
        if (res.confirm) {
          // 使用模拟数据
          const feedback = this.getMockFeedback();
          this.setData({
            aiFeedback: feedback
          });
          this.generateImprovements();
        }
      }
    });
  },

  /**
   * 获取模拟反馈数据
   */
  getMockFeedback() {
    const { weeklyCount, averageRating, completionRate } = this.data;
    const feedback = [];
    
    // 如果没有数据，提供初始化建议
    if (weeklyCount === 0) {
      feedback.push({
        type: 'suggestion',
        icon: '🚀',
        label: '开始您的执行之旅',
        content: '欢迎使用PulseVyne！建议先记录一些理论思考，然后生成行动计划并开始执行。'
      });
      feedback.push({
        type: 'suggestion',
        icon: '📝',
        label: '建立执行习惯',
        content: '建议每天设定固定时间进行执行记录，比如早上制定计划，晚上回顾总结。'
      });
      feedback.push({
        type: 'suggestion',
        icon: '🎯',
        label: '从小目标开始',
        content: '初期可以设定简单易达成的小目标，逐步建立信心和执行习惯。'
      });
      return feedback;
    }
    
    // 根据完成率给出反馈
    if (completionRate >= 80) {
      feedback.push({
        type: 'positive',
        icon: '🎉',
        label: '执行表现优秀',
        content: '您的完成率达到了' + completionRate + '%，这是一个非常出色的表现！继续保持这种高效的执行力。'
      });
    } else if (completionRate >= 60) {
      feedback.push({
        type: 'suggestion',
        icon: '💪',
        label: '执行表现良好',
        content: '您的完成率为' + completionRate + '%，表现不错。可以尝试优化时间安排，进一步提升执行效率。'
      });
    } else {
      feedback.push({
        type: 'warning',
        icon: '⚠️',
        label: '需要改进执行',
        content: '您的完成率为' + completionRate + '%，建议重新评估行动计划的可行性，或者降低单次行动的难度。'
      });
    }
    
    // 根据评分给出反馈
    if (averageRating >= 4) {
      feedback.push({
        type: 'positive',
        icon: '⭐',
        label: '执行质量很高',
        content: '您的平均评分达到' + averageRating + '分，说明执行质量很高，这种高标准值得坚持。'
      });
    } else if (averageRating >= 3) {
      feedback.push({
        type: 'suggestion',
        icon: '📈',
        label: '执行质量中等',
        content: '您的平均评分为' + averageRating + '分，可以通过更详细的计划和更专注的执行来提升质量。'
      });
    }
    
    // 根据频率给出反馈
    if (weeklyCount >= 5) {
      feedback.push({
        type: 'positive',
        icon: '🔥',
        label: '执行频率很高',
        content: '本周已执行' + weeklyCount + '次，频率很高！注意平衡，避免过度疲劳。'
      });
    } else if (weeklyCount <= 2) {
      feedback.push({
        type: 'suggestion',
        icon: '📅',
        label: '建议增加频率',
        content: '本周执行次数较少，建议设定更具体的执行时间，养成规律的行动习惯。'
      });
    }
    
    return feedback;
  },

  /**
   * 生成改进建议
   */
  generateImprovements() {
    const improvements = [
      {
        title: '设定固定执行时间',
        priority: 'high',
        priorityText: '高优先级',
        description: '建议每天在固定时间执行行动计划，比如早上8点或晚上7点，形成稳定的习惯。'
      },
      {
        title: '降低行动门槛',
        priority: 'medium',
        priorityText: '中优先级',
        description: '如果经常无法完成，可以考虑将大的行动分解为更小的步骤，降低执行难度。'
      },
      {
        title: '建立奖励机制',
        priority: 'low',
        priorityText: '低优先级',
        description: '为自己设定小奖励，比如完成一周目标后看一部电影，增加执行的动力。'
      }
    ];
    
    this.setData({
      improvements
    });
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
   * 采纳建议
   */
  adoptSuggestion(e) {
    const index = e.currentTarget.dataset.index;
    const suggestion = this.data.improvements[index];
    
    wx.showModal({
      title: '采纳建议',
      content: `您确定要采纳"${suggestion.title}"这个建议吗？`,
      success: (res) => {
        if (res.confirm) {
          // 这里可以添加采纳建议的逻辑
          wx.showToast({
            title: '建议已采纳',
            icon: 'success'
          });
          
          // 移除已采纳的建议
          const improvements = this.data.improvements.filter((_, i) => i !== index);
          this.setData({
            improvements
          });
        }
      }
    });
  },

  /**
   * 忽略建议
   */
  ignoreSuggestion(e) {
    const index = e.currentTarget.dataset.index;
    
    // 移除被忽略的建议
    const improvements = this.data.improvements.filter((_, i) => i !== index);
    this.setData({
      improvements
    });
    
    wx.showToast({
      title: '建议已忽略',
      icon: 'success'
    });
  },

  /**
   * 重新生成反馈
   */
  generateNewFeedback() {
    this.loadExecutionData();
    this.generateTrendData();
    this.generateAIFeedback();
    this.generateImprovements();
    
    wx.showToast({
      title: '正在重新分析...',
      icon: 'loading'
    });
  },

  /**
   * 导出进展报告
   */
  exportProgress() {
    wx.showLoading({
      title: '生成报告中...'
    });
    
    // 模拟导出过程
    setTimeout(() => {
      wx.hideLoading();
      
      const reportData = {
        date: new Date().toLocaleDateString(),
        weeklyCount: this.data.weeklyCount,
        averageRating: this.data.averageRating,
        completionRate: this.data.completionRate,
        feedback: this.data.aiFeedback
      };
      
      // 这里可以实现真正的导出功能
      // 比如生成PDF、分享到微信等
      
      wx.showModal({
        title: '报告生成完成',
        content: '进展报告已生成，您可以选择分享给朋友或保存到相册。',
        confirmText: '分享',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            // 实现分享功能
            wx.showToast({
              title: '分享功能开发中',
              icon: 'none'
            });
          }
        }
      });
    }, 2000);
  },

  /**
   * 分享给朋友
   */
  onShareAppMessage() {
    // 增加分享计数
    shareManager.incrementShareCount();
    
    const progressData = {
      weeklyCount: this.data.weeklyCount,
      averageRating: parseFloat(this.data.averageRating),
      completionRate: this.data.completionRate,
      improvements: this.data.improvements
    };
    
    return shareManager.shareProgressToFriend(progressData);
  },

  /**
   * 分享到朋友圈
   */
  onShareTimeline() {
    // 增加分享计数
    shareManager.incrementShareCount();
    
    const progressData = {
      weeklyCount: this.data.weeklyCount,
      averageRating: parseFloat(this.data.averageRating),
      completionRate: this.data.completionRate,
      improvements: this.data.improvements
    };
    
    return shareManager.shareProgressToTimeline(progressData);
  },

  /**
   * 复制进展报告
   */
  copyProgressReport() {
    const progressData = {
      weeklyCount: this.data.weeklyCount,
      averageRating: parseFloat(this.data.averageRating),
      completionRate: this.data.completionRate
    };
    
    const shareText = shareManager.generateShareText('progress', progressData);
    shareManager.copyToClipboard(shareText);
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

    if (pageMap[page] && page !== 'progress') {
      wx.navigateTo({
        url: pageMap[page]
      });
    }
  }
});