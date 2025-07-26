/**
 * 分享管理器
 * 统一管理小程序的分享功能
 */

class ShareManager {
  constructor() {
    this.appName = 'PulseVyne';
    this.defaultPath = '/pages/index/index';
  }

  /**
   * 分享成就到朋友
   * @param {Object} achievement - 成就对象
   * @param {Object} stats - 统计数据
   */
  shareAchievementToFriend(achievement = null, stats = {}) {
    if (achievement && achievement.unlocked) {
      // 分享特定成就
      return {
        title: `🎉 我在${this.appName}中解锁了「${achievement.name}」成就！`,
        path: this.defaultPath,
        imageUrl: '/images/achievement-share.png'
      };
    } else {
      // 分享总体成就
      const {
        unlockedCount = 0,
        totalCount = 0,
        achievementPoints = 0
      } = stats;
      
      return {
        title: `📊 我在${this.appName}中已解锁${unlockedCount}/${totalCount}个成就，获得${achievementPoints}积分！`,
        path: this.defaultPath,
        imageUrl: '/images/stats-share.png'
      };
    }
  }

  /**
   * 分享成就到朋友圈
   * @param {Object} achievement - 成就对象
   * @param {Object} stats - 统计数据
   */
  shareAchievementToTimeline(achievement = null, stats = {}) {
    if (achievement && achievement.unlocked) {
      // 分享特定成就
      return {
        title: `🎉 解锁「${achievement.name}」成就 - ${this.appName}`,
        path: this.defaultPath,
        imageUrl: '/images/achievement-share.png'
      };
    } else {
      // 分享总体成就
      const {
        unlockedCount = 0,
        totalCount = 0,
        achievementPoints = 0
      } = stats;
      
      return {
        title: `📊 已解锁${unlockedCount}个成就，获得${achievementPoints}积分 - ${this.appName}`,
        path: this.defaultPath,
        imageUrl: '/images/stats-share.png'
      };
    }
  }

  /**
   * 分享今日统计
   * @param {Object} todayStats - 今日统计数据
   */
  shareTodayStats(todayStats = {}) {
    const {
      theoryCount = 0,
      actionCount = 0,
      executionCount = 0
    } = todayStats;

    return {
      title: `📈 今日学习${theoryCount}个理论，制定${actionCount}个计划，完成${executionCount}次执行 - ${this.appName}`,
      path: this.defaultPath,
      imageUrl: '/images/daily-share.png'
    };
  }

  /**
   * 分享理论内容
   * @param {Object} theory - 理论对象
   */
  shareTheory(theory = {}) {
    const { content = '', createTime = '' } = theory;
    const shortContent = content.length > 30 ? content.substring(0, 30) + '...' : content;
    
    return {
      title: `💡 分享一个理论思考：${shortContent} - ${this.appName}`,
      path: this.defaultPath,
      imageUrl: '/images/theory-share.png'
    };
  }

  /**
   * 分享行动计划
   * @param {Object} action - 行动对象
   */
  shareAction(action = {}) {
    const { title = '', description = '' } = action;
    const content = title || description;
    const shortContent = content.length > 30 ? content.substring(0, 30) + '...' : content;
    
    return {
      title: `🎯 分享一个行动计划：${shortContent} - ${this.appName}`,
      path: this.defaultPath,
      imageUrl: '/images/action-share.png'
    };
  }

  /**
   * 分享执行记录
   * @param {Object} execution - 执行记录对象
   */
  shareExecution(execution = {}) {
    const { rating = 0, statusText = '', content = '' } = execution;
    const stars = '⭐'.repeat(rating);
    
    return {
      title: `✅ 完成一次执行：${statusText} ${stars} - ${this.appName}`,
      path: this.defaultPath,
      imageUrl: '/images/execution-share.png'
    };
  }

  /**
   * 分享进展报告
   * @param {Object} progress - 进展数据
   */
  shareProgress(progress = {}) {
    const {
      weeklyCount = 0,
      averageRating = 0,
      completionRate = 0
    } = progress;
    
    return {
      title: `📊 本周完成${weeklyCount}次执行，平均评分${averageRating.toFixed(1)}分，完成率${completionRate}% - ${this.appName}`,
      path: this.defaultPath,
      imageUrl: '/images/progress-share.png'
    };
  }

  /**
   * 获取默认分享内容
   */
  getDefaultShare() {
    return {
      title: `${this.appName} - 理论与实践的完美结合`,
      path: this.defaultPath,
      imageUrl: '/images/default-share.png'
    };
  }

  /**
   * 复制分享文本到剪贴板
   * @param {string} text - 要复制的文本
   */
  copyToClipboard(text) {
    return new Promise((resolve, reject) => {
      wx.setClipboardData({
        data: text,
        success: () => {
          // 增加分享计数
          this.incrementShareCount();
          
          wx.showToast({
            title: '已复制到剪贴板',
            icon: 'success',
            duration: 2000
          });
          resolve(true);
        },
        fail: (error) => {
          wx.showToast({
            title: '复制失败',
            icon: 'error',
            duration: 2000
          });
          reject(error);
        }
      });
    });
  }

  /**
   * 增加分享计数
   */
  incrementShareCount() {
    try {
      const currentCount = wx.getStorageSync('share_count') || 0;
      wx.setStorageSync('share_count', currentCount + 1);
    } catch (error) {
      console.error('更新分享计数失败:', error);
    }
  }

  /**
   * 获取分享计数
   */
  getShareCount() {
    try {
      return wx.getStorageSync('share_count') || 0;
    } catch (error) {
      console.error('获取分享计数失败:', error);
      return 0;
    }
  }

  /**
   * 生成分享文本
   * @param {string} type - 分享类型
   * @param {Object} data - 数据对象
   */
  generateShareText(type, data = {}) {
    switch (type) {
      case 'achievement':
        if (data.achievement && data.achievement.unlocked) {
          return `🎉 我在${this.appName}中解锁了「${data.achievement.name}」成就！\n${data.achievement.description}\n\n快来一起体验理论与实践的完美结合吧！`;
        } else {
          return `📊 我在${this.appName}中的成就统计：\n🏆 已解锁 ${data.unlockedCount || 0}/${data.totalCount || 0} 个成就\n💎 获得 ${data.achievementPoints || 0} 积分\n\n快来一起体验理论与实践的完美结合吧！`;
        }
      
      case 'daily':
        return `📈 我今天在${this.appName}中的学习记录：\n💡 理论学习：${data.theoryCount || 0}次\n🎯 制定计划：${data.actionCount || 0}个\n✅ 完成执行：${data.executionCount || 0}次\n\n坚持每日学习，让理论指导实践！`;
      
      case 'progress':
        return `📊 我在${this.appName}中的本周进展：\n📈 完成执行：${data.weeklyCount || 0}次\n⭐ 平均评分：${(data.averageRating || 0).toFixed(1)}分\n🎯 完成率：${data.completionRate || 0}%\n\n持续进步，理论与实践并行！`;
      
      default:
        return `${this.appName} - 理论与实践的完美结合\n\n📚 记录理论思考\n🎯 制定行动计划\n✅ 跟踪执行进展\n🏆 解锁成就系统\n\n让学习更有目标，让行动更有方向！`;
    }
  }
}

// 创建全局实例
const shareManager = new ShareManager();

module.exports = shareManager;