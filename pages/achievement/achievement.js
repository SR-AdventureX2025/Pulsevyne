// pages/achievement/achievement.js
const shareManager = require('../../utils/shareManager.js');

Page({
  data: {
    // 成就概览数据
    totalAchievements: 27,
    unlockedAchievements: 0,
    achievementPoints: 0,
    currentPage: 'achievement',
    navFixed: true,
    
    // 最新成就
    latestAchievement: null,
    
    // 成就分类
    categories: [
      { id: 'all', name: '全部', icon: '📋', active: true },
      { id: 'theory', name: '理论', icon: '💡', active: false },
      { id: 'action', name: '行动', icon: '🚀', active: false },
      { id: 'execution', name: '执行', icon: '✅', active: false },
      { id: 'progress', name: '进展', icon: '📈', active: false },
      { id: 'special', name: '特殊', icon: '⭐', active: false }
    ],
    
    // 当前选中的分类
    activeCategory: 'all',
    
    // 成就列表
    achievements: [
      // 理论类成就
      {
        id: 'first_theory',
        name: '理论先锋',
        description: '记录第一个理论思考',
        icon: '🎯',
        category: 'theory',
        rarity: 'common',
        points: 10,
        progress: 0,
        maxProgress: 1,
        unlocked: false
      },
      {
        id: 'theory_explorer',
        name: '理论探索者',
        description: '累计记录10个理论思考',
        icon: '🔍',
        category: 'theory',
        rarity: 'common',
        points: 20,
        progress: 0,
        maxProgress: 10,
        unlocked: false
      },
      {
        id: 'theory_scholar',
        name: '理论学者',
        description: '累计记录25个理论思考',
        icon: '📚',
        category: 'theory',
        rarity: 'rare',
        points: 40,
        progress: 0,
        maxProgress: 25,
        unlocked: false
      },
      {
        id: 'theory_master',
        name: '理论大师',
        description: '累计记录50个理论思考',
        icon: '🧠',
        category: 'theory',
        rarity: 'epic',
        points: 80,
        progress: 0,
        maxProgress: 50,
        unlocked: false
      },
      {
        id: 'theory_sage',
        name: '理论圣贤',
        description: '累计记录100个理论思考',
        icon: '🎓',
        category: 'theory',
        rarity: 'legendary',
        points: 150,
        progress: 0,
        maxProgress: 100,
        unlocked: false
      },
      // 行动类成就
      {
        id: 'first_action',
        name: '计划师',
        description: '制定第一个行动计划',
        icon: '📋',
        category: 'action',
        rarity: 'common',
        points: 10,
        progress: 0,
        maxProgress: 1,
        unlocked: false
      },
      {
        id: 'action_starter',
        name: '行动启动者',
        description: '累计制定10个行动计划',
        icon: '🚀',
        category: 'action',
        rarity: 'common',
        points: 25,
        progress: 0,
        maxProgress: 10,
        unlocked: false
      },
      {
        id: 'action_strategist',
        name: '策略专家',
        description: '累计制定30个行动计划',
        icon: '🎯',
        category: 'action',
        rarity: 'rare',
        points: 50,
        progress: 0,
        maxProgress: 30,
        unlocked: false
      },
      {
        id: 'action_master',
        name: '行动大师',
        description: '累计制定100个行动计划',
        icon: '🏹',
        category: 'action',
        rarity: 'epic',
        points: 120,
        progress: 0,
        maxProgress: 100,
        unlocked: false
      },
      // 执行类成就
      {
        id: 'first_execution',
        name: '行动家',
        description: '完成第一次执行记录',
        icon: '⚡',
        category: 'execution',
        rarity: 'common',
        points: 15,
        progress: 0,
        maxProgress: 1,
        unlocked: false
      },
      {
        id: 'execution_rookie',
        name: '执行新手',
        description: '累计完成10次执行记录',
        icon: '✅',
        category: 'execution',
        rarity: 'common',
        points: 30,
        progress: 0,
        maxProgress: 10,
        unlocked: false
      },
      {
        id: 'execution_expert',
        name: '执行专家',
        description: '累计完成50次执行记录',
        icon: '💪',
        category: 'execution',
        rarity: 'rare',
        points: 70,
        progress: 0,
        maxProgress: 50,
        unlocked: false
      },
      {
        id: 'execution_master',
        name: '执行大师',
        description: '累计完成100次执行记录',
        icon: '🏆',
        category: 'execution',
        rarity: 'epic',
        points: 150,
        progress: 0,
        maxProgress: 100,
        unlocked: false
      },
      {
        id: 'execution_legend',
        name: '执行传奇',
        description: '累计完成200次执行记录',
        icon: '👑',
        category: 'execution',
        rarity: 'legendary',
        points: 300,
        progress: 0,
        maxProgress: 200,
        unlocked: false
      },
      // 进展类成就
      {
        id: 'three_day_streak',
        name: '三日坚持',
        description: '连续3天使用应用',
        icon: '🔥',
        category: 'progress',
        rarity: 'common',
        points: 15,
        progress: 0,
        maxProgress: 3,
        unlocked: false
      },
      {
        id: 'week_streak',
        name: '周连击',
        description: '连续7天使用应用',
        icon: '🌟',
        category: 'progress',
        rarity: 'rare',
        points: 40,
        progress: 0,
        maxProgress: 7,
        unlocked: false
      },
      {
        id: 'month_streak',
        name: '月度坚持',
        description: '连续30天使用应用',
        icon: '💎',
        category: 'progress',
        rarity: 'epic',
        points: 100,
        progress: 0,
        maxProgress: 30,
        unlocked: false
      },
      {
        id: 'perfect_score',
        name: '完美执行',
        description: '获得5次满分执行评价',
        icon: '⭐',
        category: 'execution',
        rarity: 'rare',
        points: 50,
        progress: 0,
        maxProgress: 5,
        unlocked: false
      },
      {
        id: 'perfectionist',
        name: '完美主义者',
        description: '获得20次满分执行评价',
        icon: '🌟',
        category: 'execution',
        rarity: 'epic',
        points: 120,
        progress: 0,
        maxProgress: 20,
        unlocked: false
      },
      {
        id: 'high_achiever',
        name: '高分达人',
        description: '获得50次4分以上评价',
        icon: '📈',
        category: 'execution',
        rarity: 'rare',
        points: 60,
        progress: 0,
        maxProgress: 50,
        unlocked: false
      },
      // 特殊成就
      {
        id: 'early_bird',
        name: '早起鸟',
        description: '在早上6点前记录理论',
        icon: '🌅',
        category: 'special',
        rarity: 'rare',
        points: 30,
        progress: 0,
        maxProgress: 1,
        unlocked: false
      },
      {
        id: 'night_owl',
        name: '夜猫子',
        description: '在晚上11点后完成执行记录',
        icon: '🦉',
        category: 'special',
        rarity: 'rare',
        points: 30,
        progress: 0,
        maxProgress: 1,
        unlocked: false
      },
      {
        id: 'weekend_warrior',
        name: '周末战士',
        description: '在周末完成执行记录',
        icon: '⚔️',
        category: 'special',
        rarity: 'rare',
        points: 25,
        progress: 0,
        maxProgress: 1,
        unlocked: false
      },
      {
        id: 'speed_demon',
        name: '闪电行动',
        description: '在1小时内完成理论-行动-执行全流程',
        icon: '⚡',
        category: 'special',
        rarity: 'epic',
        points: 80,
        progress: 0,
        maxProgress: 1,
        unlocked: false
      },
      {
        id: 'comeback_king',
        name: '王者归来',
        description: '中断7天后重新使用应用',
        icon: '👑',
        category: 'special',
        rarity: 'rare',
        points: 35,
        progress: 0,
        maxProgress: 1,
        unlocked: false
      },
      {
        id: 'milestone_100',
        name: '百里里程碑',
        description: '总活动次数达到100次',
        icon: '🎯',
        category: 'progress',
        rarity: 'epic',
        points: 100,
        progress: 0,
        maxProgress: 100,
        unlocked: false
      },
      {
        id: 'social_sharer',
        name: '分享达人',
        description: '分享成就或进展5次',
        icon: '📤',
        category: 'special',
        rarity: 'rare',
        points: 40,
        progress: 0,
        maxProgress: 5,
        unlocked: false
      }
    ],
    
    // 过滤后的成就列表
    filteredAchievements: [],
    
    // 成就详情弹窗
    showModal: false,
    selectedAchievement: null
  },

  // 页面加载
  onLoad(options) {
    console.log('成就展厅页面加载');
    this.loadAchievementData();
    // 初始化过滤后的成就列表
    this.setData({
      filteredAchievements: this.data.achievements
    });
    this.filterAchievements();
  },

  // 页面显示
  onShow() {
    console.log('成就展厅页面显示');
    this.refreshAchievementData();
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
    wx.navigateTo({
      url: '/pages/progress/progress'
    })
  },

  navigateToAchievement() {
    // 当前页面，不需要跳转
  },

  // 加载成就数据
  loadAchievementData() {
    try {
      // 从本地存储加载成就数据
      const achievementData = wx.getStorageSync('achievement_data');
      if (achievementData) {
        this.setData({
          totalAchievements: achievementData.totalAchievements || this.data.totalAchievements,
          unlockedAchievements: achievementData.unlockedAchievements || this.data.unlockedAchievements,
          achievementPoints: achievementData.achievementPoints || this.data.achievementPoints,
          achievements: achievementData.achievements || this.data.achievements
        });
      }
      
      // 更新最新成就
      this.updateLatestAchievement();
    } catch (error) {
      console.error('加载成就数据失败:', error);
    }
  },

  // 刷新成就数据
  refreshAchievementData() {
    // 检查是否有新的成就解锁
    this.checkNewAchievements();
    
    // 更新成就进度
    this.updateAchievementProgress();
    
    // 重新过滤成就
    this.filterAchievements();
  },

  // 检查新成就
  checkNewAchievements() {
    try {
      // 获取用户数据
      const theoryHistory = wx.getStorageSync('theory_history') || [];
      const actionHistory = wx.getStorageSync('action_history') || [];
      const executionHistory = wx.getStorageSync('execution_history') || [];
      
      const theoryCount = theoryHistory.length;
      const actionCount = actionHistory.length;
      const executionCount = executionHistory.length;
      
      // 检查连续使用天数
      const usageDays = this.calculateUsageDays();
      
      // 检查高分执行次数
      const perfectScores = executionHistory.filter(record => record.rating === 5).length;
      
      // 检查特殊时间成就
      const earlyBirdCount = this.checkEarlyBirdAchievement(theoryHistory);
      const nightOwlCount = this.checkNightOwlAchievement(executionHistory);
      
      // 更新本地存储的计数
      wx.setStorageSync('theory_count', theoryCount);
      wx.setStorageSync('action_count', actionCount);
      wx.setStorageSync('execution_count', executionCount);
      wx.setStorageSync('usage_days', usageDays);
      wx.setStorageSync('perfect_scores', perfectScores);
      
      console.log('成就检查完成:', {
        theoryCount,
        actionCount,
        executionCount,
        usageDays,
        perfectScores,
        earlyBirdCount,
        nightOwlCount
      });
    } catch (error) {
      console.error('检查新成就失败:', error);
    }
  },

  // 更新成就进度
  updateAchievementProgress() {
    try {
      // 获取用户数据
      const theoryHistory = wx.getStorageSync('theory_history') || [];
      const actionHistory = wx.getStorageSync('action_history') || [];
      const executionHistory = wx.getStorageSync('execution_history') || [];
      
      // 计算统计数据
      const theoryCount = theoryHistory.length;
      const actionCount = actionHistory.length;
      const executionCount = executionHistory.length;
      const consecutiveDays = this.calculateUsageDays();
      const perfectScores = executionHistory.filter(e => e.rating === 5).length;
      const highScores = executionHistory.filter(e => e.rating >= 4).length;
      const totalActivities = theoryCount + actionCount + executionCount;
      
      // 获取分享次数
      const shareCount = shareManager.getShareCount();
      
      // 特殊成就检测
      const earlyBirdCount = this.checkEarlyBirdAchievement();
      const nightOwlCount = this.checkNightOwlAchievement();
      const weekendCount = this.checkWeekendWarrior();
      const speedDemonCount = this.checkSpeedDemon();
      const comebackCount = this.checkComebackKing();
      
      const achievements = this.data.achievements.map(achievement => {
        let shouldUnlock = false;
        let newProgress = achievement.progress;
        
        switch (achievement.id) {
          // 理论类成就
          case 'first_theory':
            newProgress = Math.min(theoryCount, 1);
            shouldUnlock = theoryCount >= 1;
            break;
          case 'theory_explorer':
            newProgress = Math.min(theoryCount, achievement.maxProgress);
            shouldUnlock = theoryCount >= achievement.maxProgress;
            break;
          case 'theory_scholar':
            newProgress = Math.min(theoryCount, achievement.maxProgress);
            shouldUnlock = theoryCount >= achievement.maxProgress;
            break;
          case 'theory_master':
            newProgress = Math.min(theoryCount, achievement.maxProgress);
            shouldUnlock = theoryCount >= achievement.maxProgress;
            break;
          case 'theory_sage':
            newProgress = Math.min(theoryCount, achievement.maxProgress);
            shouldUnlock = theoryCount >= achievement.maxProgress;
            break;
          
          // 行动类成就
          case 'first_action':
            newProgress = Math.min(actionCount, 1);
            shouldUnlock = actionCount >= 1;
            break;
          case 'action_starter':
            newProgress = Math.min(actionCount, achievement.maxProgress);
            shouldUnlock = actionCount >= achievement.maxProgress;
            break;
          case 'action_strategist':
            newProgress = Math.min(actionCount, achievement.maxProgress);
            shouldUnlock = actionCount >= achievement.maxProgress;
            break;
          case 'action_master':
            newProgress = Math.min(actionCount, achievement.maxProgress);
            shouldUnlock = actionCount >= achievement.maxProgress;
            break;
          
          // 执行类成就
          case 'first_execution':
            newProgress = Math.min(executionCount, 1);
            shouldUnlock = executionCount >= 1;
            break;
          case 'execution_rookie':
            newProgress = Math.min(executionCount, achievement.maxProgress);
            shouldUnlock = executionCount >= achievement.maxProgress;
            break;
          case 'execution_expert':
            newProgress = Math.min(executionCount, achievement.maxProgress);
            shouldUnlock = executionCount >= achievement.maxProgress;
            break;
          case 'execution_master':
            newProgress = Math.min(executionCount, achievement.maxProgress);
            shouldUnlock = executionCount >= achievement.maxProgress;
            break;
          case 'execution_legend':
            newProgress = Math.min(executionCount, achievement.maxProgress);
            shouldUnlock = executionCount >= achievement.maxProgress;
            break;
          
          // 进展类成就
          case 'three_day_streak':
            newProgress = Math.min(consecutiveDays, achievement.maxProgress);
            shouldUnlock = consecutiveDays >= achievement.maxProgress;
            break;
          case 'week_streak':
            newProgress = Math.min(consecutiveDays, achievement.maxProgress);
            shouldUnlock = consecutiveDays >= achievement.maxProgress;
            break;
          case 'month_streak':
            newProgress = Math.min(consecutiveDays, achievement.maxProgress);
            shouldUnlock = consecutiveDays >= achievement.maxProgress;
            break;
          case 'milestone_100':
            newProgress = Math.min(totalActivities, achievement.maxProgress);
            shouldUnlock = totalActivities >= achievement.maxProgress;
            break;
          
          // 执行质量成就
          case 'perfect_score':
            newProgress = Math.min(perfectScores, achievement.maxProgress);
            shouldUnlock = perfectScores >= achievement.maxProgress;
            break;
          case 'perfectionist':
            newProgress = Math.min(perfectScores, achievement.maxProgress);
            shouldUnlock = perfectScores >= achievement.maxProgress;
            break;
          case 'high_achiever':
            newProgress = Math.min(highScores, achievement.maxProgress);
            shouldUnlock = highScores >= achievement.maxProgress;
            break;
          
          // 特殊成就
          case 'early_bird':
            newProgress = earlyBirdCount > 0 ? 1 : 0;
            shouldUnlock = earlyBirdCount > 0;
            break;
          case 'night_owl':
            newProgress = nightOwlCount > 0 ? 1 : 0;
            shouldUnlock = nightOwlCount > 0;
            break;
          case 'weekend_warrior':
            newProgress = weekendCount > 0 ? 1 : 0;
            shouldUnlock = weekendCount > 0;
            break;
          case 'speed_demon':
            newProgress = speedDemonCount > 0 ? 1 : 0;
            shouldUnlock = speedDemonCount > 0;
            break;
          case 'comeback_king':
            newProgress = comebackCount > 0 ? 1 : 0;
            shouldUnlock = comebackCount > 0;
            break;
          case 'social_sharer':
            newProgress = Math.min(shareCount, achievement.maxProgress);
            shouldUnlock = shareCount >= achievement.maxProgress;
            break;
        }
        
        // 更新进度
        achievement.progress = newProgress;
        
        // 检查是否达到解锁条件
        if (!achievement.unlocked && shouldUnlock) {
          achievement.unlocked = true;
          achievement.unlockedAt = this.formatDate(new Date());
          this.showAchievementUnlocked(achievement);
        }
        
        return achievement;
      });
      
      this.setData({ achievements });
      this.updateAchievementStats();
    } catch (error) {
      console.error('更新成就进度失败:', error);
    }
  },

  // 更新成就统计
  updateAchievementStats() {
    const unlockedCount = this.data.achievements.filter(a => a.unlocked).length;
    const totalPoints = this.data.achievements
      .filter(a => a.unlocked)
      .reduce((sum, a) => sum + a.points, 0);
    
    this.setData({
      unlockedAchievements: unlockedCount,
      achievementPoints: totalPoints
    });
  },

  // 更新最新成就
  updateLatestAchievement() {
    const unlockedAchievements = this.data.achievements
      .filter(a => a.unlocked && a.unlockedAt)
      .sort((a, b) => new Date(b.unlockedAt) - new Date(a.unlockedAt));
    
    if (unlockedAchievements.length > 0) {
      this.setData({
        latestAchievement: unlockedAchievements[0]
      });
    }
  },

  // 显示成就解锁提示
  showAchievementUnlocked(achievement) {
    wx.showToast({
      title: `🎉 解锁成就: ${achievement.name}`,
      icon: 'none',
      duration: 3000
    });
  },

  // 返回上一页
  goBack() {
    wx.navigateBack({
      delta: 1
    });
  },

  // 切换成就分类
  switchCategory(e) {
    const categoryId = e.currentTarget.dataset.category;
    
    // 更新分类状态
    const categories = this.data.categories.map(cat => ({
      ...cat,
      active: cat.id === categoryId
    }));
    
    this.setData({
      activeCategory: categoryId,
      categories
    });
    
    // 过滤成就
    this.filterAchievements();
  },

  // 过滤成就
  filterAchievements() {
    const { activeCategory, achievements } = this.data;
    
    let filteredAchievements;
    if (activeCategory === 'all') {
      filteredAchievements = achievements;
    } else {
      filteredAchievements = achievements.filter(a => a.category === activeCategory);
    }
    
    // 添加显示所需的字段
    const rarityMap = {
      'common': '普通',
      'rare': '稀有', 
      'epic': '史诗',
      'legendary': '传说'
    };
    
    filteredAchievements = filteredAchievements.map(achievement => ({
      ...achievement,
      rarityText: rarityMap[achievement.rarity] || '普通',
      progress: achievement.maxProgress > 1 ? {
        current: achievement.progress,
        total: achievement.maxProgress,
        percentage: Math.round((achievement.progress / achievement.maxProgress) * 100)
      } : null,
      unlockedDate: achievement.unlockedAt ? this.formatDate(new Date(achievement.unlockedAt)) : null
    }));
    
    // 按解锁状态和稀有度排序
    filteredAchievements.sort((a, b) => {
      // 已解锁的排在前面
      if (a.unlocked !== b.unlocked) {
        return b.unlocked - a.unlocked;
      }
      
      // 按稀有度排序
      const rarityOrder = { common: 1, rare: 2, epic: 3, legendary: 4 };
      return rarityOrder[b.rarity] - rarityOrder[a.rarity];
    });
    
    this.setData({ filteredAchievements });
  },

  // 显示成就详情
  showAchievementDetail(e) {
    const achievementId = e.currentTarget.dataset.id;
    const achievement = this.data.achievements.find(a => a.id === achievementId);
    
    if (achievement) {
      // 添加缺失的字段
      const rarityMap = {
        'common': '普通',
        'rare': '稀有', 
        'epic': '史诗',
        'legendary': '传说'
      };
      
      const enhancedAchievement = {
        ...achievement,
        rarityText: rarityMap[achievement.rarity] || '普通',
        condition: achievement.description,
        unlockedDate: achievement.unlockedAt ? this.formatDate(new Date(achievement.unlockedAt)) : null
      };
      
      this.setData({
        selectedAchievement: enhancedAchievement,
        showModal: true
      });
    }
  },

  // 关闭成就详情
  closeAchievementDetail() {
    this.setData({
      showModal: false,
      selectedAchievement: null
    });
  },

  // 分享成就
  shareAchievement() {
    const selectedAchievement = this.data.selectedAchievement;
    const stats = {
      unlockedCount: this.data.unlockedAchievements,
      totalCount: this.data.totalAchievements,
      achievementPoints: this.data.achievementPoints
    };
    
    return shareManager.shareAchievementToFriend(selectedAchievement, stats);
  },

  // 计算使用天数
  calculateUsageDays() {
    try {
      const theoryHistory = wx.getStorageSync('theory_history') || [];
      const actionHistory = wx.getStorageSync('action_history') || [];
      const executionHistory = wx.getStorageSync('execution_history') || [];
      
      // 收集所有活动日期
      const allDates = new Set();
      
      [...theoryHistory, ...actionHistory, ...executionHistory].forEach(item => {
        const date = new Date(item.createTime || item.timestamp);
        const dateStr = date.toDateString();
        allDates.add(dateStr);
      });
      
      // 计算连续使用天数
      const sortedDates = Array.from(allDates).sort((a, b) => new Date(b) - new Date(a));
      let consecutiveDays = 0;
      const today = new Date().toDateString();
      
      for (let i = 0; i < sortedDates.length; i++) {
        const currentDate = new Date(sortedDates[i]);
        const expectedDate = new Date();
        expectedDate.setDate(expectedDate.getDate() - i);
        
        if (currentDate.toDateString() === expectedDate.toDateString()) {
          consecutiveDays++;
        } else {
          break;
        }
      }
      
      return consecutiveDays;
    } catch (error) {
      console.error('计算使用天数失败:', error);
      return 0;
    }
  },

  // 检查早起鸟成就
  checkEarlyBirdAchievement() {
    try {
      const theoryHistory = wx.getStorageSync('theory_history') || [];
      return theoryHistory.filter(item => {
        const date = new Date(item.createTime || item.timestamp);
        return date.getHours() < 6;
      }).length;
    } catch (error) {
      console.error('检查早起鸟成就失败:', error);
      return 0;
    }
  },

  // 检查夜猫子成就
  checkNightOwlAchievement() {
    try {
      const executionHistory = wx.getStorageSync('execution_history') || [];
      return executionHistory.filter(item => {
        const date = new Date(item.createTime || item.timestamp);
        return date.getHours() >= 23;
      }).length;
    } catch (error) {
      console.error('检查夜猫子成就失败:', error);
      return 0;
    }
  },

  // 检查周末战士成就
  checkWeekendWarrior() {
    try {
      const executionHistory = wx.getStorageSync('execution_history') || [];
      return executionHistory.filter(item => {
        const date = new Date(item.createTime || item.timestamp);
        const dayOfWeek = date.getDay();
        return dayOfWeek === 0 || dayOfWeek === 6; // 周日=0, 周六=6
      }).length;
    } catch (error) {
      console.error('检查周末战士成就失败:', error);
      return 0;
    }
  },

  // 检查闪电行动成就
  checkSpeedDemon() {
    try {
      const theoryHistory = wx.getStorageSync('theory_history') || [];
      const actionHistory = wx.getStorageSync('action_history') || [];
      const executionHistory = wx.getStorageSync('execution_history') || [];
      
      // 检查是否有在1小时内完成理论-行动-执行的记录
      for (let theory of theoryHistory) {
        const theoryTime = new Date(theory.createTime || theory.timestamp);
        
        // 查找理论后的行动
        const relatedAction = actionHistory.find(action => {
          const actionTime = new Date(action.createTime || action.timestamp);
          return actionTime > theoryTime && (actionTime - theoryTime) <= 60 * 60 * 1000; // 1小时内
        });
        
        if (relatedAction) {
          const actionTime = new Date(relatedAction.createTime || relatedAction.timestamp);
          
          // 查找行动后的执行
          const relatedExecution = executionHistory.find(execution => {
            const executionTime = new Date(execution.createTime || execution.timestamp);
            return executionTime > actionTime && (executionTime - theoryTime) <= 60 * 60 * 1000; // 总共1小时内
          });
          
          if (relatedExecution) {
            return 1; // 找到一次完整的闪电行动
          }
        }
      }
      
      return 0;
    } catch (error) {
      console.error('检查闪电行动成就失败:', error);
      return 0;
    }
  },

  // 检查王者归来成就
  checkComebackKing() {
    try {
      const allHistory = [];
      
      // 收集所有活动记录
      const theoryHistory = wx.getStorageSync('theory_history') || [];
      const actionHistory = wx.getStorageSync('action_history') || [];
      const executionHistory = wx.getStorageSync('execution_history') || [];
      
      [...theoryHistory, ...actionHistory, ...executionHistory].forEach(item => {
        allHistory.push(new Date(item.createTime || item.timestamp));
      });
      
      // 按时间排序
      allHistory.sort((a, b) => a - b);
      
      // 检查是否有7天以上的间隔后重新使用
      for (let i = 1; i < allHistory.length; i++) {
        const gap = allHistory[i] - allHistory[i - 1];
        const dayGap = gap / (1000 * 60 * 60 * 24);
        
        if (dayGap >= 7) {
          return 1; // 找到一次王者归来
        }
      }
      
      return 0;
    } catch (error) {
      console.error('检查王者归来成就失败:', error);
      return 0;
    }
  },

  // 重置成就（开发用）
  resetAchievements() {
    wx.showModal({
      title: '确认重置',
      content: '确定要重置所有成就数据吗？此操作不可恢复。',
      success: (res) => {
        if (res.confirm) {
          // 重置成就数据
          const resetAchievements = this.data.achievements.map(achievement => ({
            ...achievement,
            unlocked: false,
            progress: 0,
            unlockedAt: null
          }));
          
          this.setData({
            achievements: resetAchievements,
            unlockedAchievements: 0,
            achievementPoints: 0,
            latestAchievement: null
          });
          
          // 清除本地存储
          wx.removeStorageSync('achievement_data');
          wx.removeStorageSync('theory_count');
          wx.removeStorageSync('action_count');
          wx.removeStorageSync('execution_count');
          
          this.filterAchievements();
          
          wx.showToast({
            title: '成就数据已重置',
            icon: 'success'
          });
        }
      }
    });
  },

  // 页面跳转
  switchPage(e) {
    const page = e.currentTarget.dataset.page;
    const routes = {
      theory: '/pages/theory/theory',
      action: '/pages/action/action',
      execution: '/pages/execution/execution',
      progress: '/pages/progress/progress',
      achievement: '/pages/achievement/achievement'
    };
    
    if (routes[page] && page !== 'achievement') {
      wx.navigateTo({
        url: routes[page]
      });
    }
  },

  // 格式化日期
  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  },

  // 页面卸载时保存数据
  onUnload() {
    try {
      const achievementData = {
        totalAchievements: this.data.totalAchievements,
        unlockedAchievements: this.data.unlockedAchievements,
        achievementPoints: this.data.achievementPoints,
        achievements: this.data.achievements
      };
      
      wx.setStorageSync('achievement_data', achievementData);
    } catch (error) {
      console.error('保存成就数据失败:', error);
    }
  },

  // 分享给朋友
  onShareAppMessage() {
    // 增加分享计数
    shareManager.incrementShareCount();
    return this.shareAchievement();
  },

  // 分享到朋友圈
  onShareTimeline() {
    // 增加分享计数
    shareManager.incrementShareCount();
    
    const selectedAchievement = this.data.selectedAchievement;
    const stats = {
      unlockedCount: this.data.unlockedAchievements,
      totalCount: this.data.totalAchievements,
      achievementPoints: this.data.achievementPoints
    };
    
    return shareManager.shareAchievementToTimeline(selectedAchievement, stats);
  },

  // 复制成就信息
  copyAchievementInfo() {
    const selectedAchievement = this.data.selectedAchievement;
    const stats = {
      unlockedCount: this.data.unlockedAchievements,
      totalCount: this.data.totalAchievements,
      achievementPoints: this.data.achievementPoints,
      achievement: selectedAchievement
    };
    
    const shareText = shareManager.generateShareText('achievement', stats);
    shareManager.copyToClipboard(shareText);
  },

  // 阻止事件冒泡
  stopPropagation() {
    // 阻止事件冒泡
  }
});