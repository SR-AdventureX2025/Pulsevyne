// 理论记录页面逻辑
const baiduOCR = require('../../utils/baiduOCR.js');
const ocrTest = require('../../utils/ocrTest.js');
const { getLinkContent } = require('../../config/api.js');
const { feishuManager } = require('../../utils/feishuManager.js');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    theoryText: '', // 理论文本内容
    isSubmitting: false, // 是否正在提交
    showTestBtn: false, // 是否显示测试按钮（开发模式）
    currentPage: 'theory',
    navFixed: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 从本地存储加载草稿
    this.loadDraft();
    
    // 开发模式下显示测试按钮
    const isDev = wx.getAccountInfoSync().miniProgram.envVersion === 'develop';
    this.setData({
      showTestBtn: isDev
    });
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
    // 当前页面，不需要跳转
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

  navigateToIndex() {
    wx.reLaunch({
      url: '/pages/index/index'
    })
  },

  /**
   * 输入框内容变化
   */
  onInputChange(e) {
    this.setData({
      theoryText: e.detail.value
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
   * 链接识别功能
   */
  linkRecognition() {
    const that = this;
    
    wx.showModal({
      title: '链接内容获取',
      editable: true,
      placeholderText: '请输入链接（以http://或https://开头）',
      success: (res) => {
        if (res.confirm && res.content) {
          const url = res.content.trim();
          
          // 验证URL格式
          if (!url.startsWith('http://') && !url.startsWith('https://')) {
            wx.showToast({
              title: '请输入有效的链接格式',
              icon: 'none',
              duration: 2000
            });
            return;
          }
          
          wx.showLoading({
            title: '获取内容中...'
          });
          
          // 调用API获取链接内容
          getLinkContent(url)
            .then(response => {
              wx.hideLoading();
              
              if (response.success && response.data && response.data.content) {
                const content = response.data.content;
                
                // 将获取的内容追加到现有内容
                const currentText = that.data.theoryText;
                const newText = currentText ? 
                  `${currentText}\n\n【链接内容】\n${content}` : 
                  `【链接内容】\n${content}`;
                
                that.setData({
                  theoryText: newText
                });
                
                // 自动保存草稿
                wx.setStorageSync('theory_draft', newText);
                
                wx.showToast({
                  title: '内容获取成功',
                  icon: 'success',
                  duration: 2000
                });
              } else {
                wx.showToast({
                  title: response.error || '获取内容失败',
                  icon: 'none',
                  duration: 2000
                });
              }
            })
            .catch(error => {
              wx.hideLoading();
              console.error('获取链接内容失败:', error);
              
              let errorMsg = '获取失败';
              if (error.message.includes('网络')) {
                errorMsg = '网络连接失败，请检查网络';
              } else if (error.message.includes('链接')) {
                errorMsg = '链接无效或无法访问';
              }
              
              wx.showModal({
                title: '获取失败',
                content: `${errorMsg}\n\n错误详情: ${error.message}`,
                showCancel: false,
                confirmText: '确定'
              });
            });
        }
      }
    });
  },

  /**
   * 图像识别功能
   */
  imageRecognition() {
    const that = this;
    
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        const tempFilePath = res.tempFilePaths[0];
        
        // 调试信息：打印临时文件路径
        console.log('选择的图片路径:', tempFilePath);
        console.log('完整的chooseImage返回结果:', res);
        
        wx.showLoading({
          title: '识别中，请稍候...'
        });
        
        // 首先检查文件是否存在
        wx.getFileInfo({
          filePath: tempFilePath,
          success: (fileInfo) => {
            console.log('文件信息:', fileInfo);
            
            // 调用百度OCR API识别图片文字
            baiduOCR.quickRecognize(tempFilePath)
              .then(recognizedText => {
                wx.hideLoading();
                
                if (recognizedText && recognizedText.trim()) {
                  // 将识别的文字追加到现有内容
                  const currentText = that.data.theoryText;
                  const newText = currentText ? 
                    `${currentText}\n\n${recognizedText}` : 
                    recognizedText;
                  
                  that.setData({
                    theoryText: newText
                  });
                  
                  // 自动保存草稿
                  wx.setStorageSync('theory_draft', newText);
                  
                  wx.showToast({
                    title: `识别成功，共${recognizedText.length}个字符`,
                    icon: 'success',
                    duration: 2000
                  });
                } else {
                  wx.showToast({
                    title: '未识别到文字内容',
                    icon: 'none',
                    duration: 2000
                  });
                }
              })
              .catch(error => {
                wx.hideLoading();
                console.error('图像识别失败:', error);
                
                let errorMsg = '识别失败';
                if (error.message.includes('网络')) {
                  errorMsg = '网络连接失败，请检查网络';
                } else if (error.message.includes('access_token')) {
                  errorMsg = 'API认证失败，请稍后重试';
                } else if (error.message.includes('文件')) {
                  errorMsg = '图片文件读取失败，请重新选择';
                } else if (error.message.includes('图片')) {
                  errorMsg = '图片格式不支持或文件损坏';
                }
                
                wx.showModal({
                  title: '识别失败',
                  content: `${errorMsg}\n\n错误详情: ${error.message}`,
                  showCancel: false,
                  confirmText: '确定'
                });
              });
          },
          fail: (error) => {
            wx.hideLoading();
            console.error('获取文件信息失败:', error);
            wx.showModal({
              title: '文件错误',
              content: '无法访问选择的图片文件，请重新选择',
              showCancel: false,
              confirmText: '确定'
            });
          }
        });
      },
      fail() {
        wx.showToast({
          title: '选择图片失败',
          icon: 'error'
        });
      }
    });
  },

  /**
   * 清除文本
   */
  clearText() {
    wx.showModal({
      title: '确认清除',
      content: '确定要清除所有内容吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({
            theoryText: ''
          });
          // 清除本地草稿
          wx.removeStorageSync('theory_draft');
          
          wx.showToast({
            title: '已清除',
            icon: 'success'
          });
        }
      }
    });
  },

  /**
   * 保存草稿
   */
  saveDraft() {
    if (!this.data.theoryText.trim()) {
      wx.showToast({
        title: '请先输入内容',
        icon: 'none'
      });
      return;
    }

    try {
      wx.setStorageSync('theory_draft', this.data.theoryText);
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
   * 加载草稿
   */
  loadDraft() {
    try {
      const draft = wx.getStorageSync('theory_draft');
      if (draft) {
        this.setData({
          theoryText: draft
        });
      }
    } catch (error) {
      console.error('加载草稿失败:', error);
    }
  },

  /**
   * 提交理论记录
   */
  submitTheory() {
    if (!this.data.theoryText.trim()) {
      wx.showToast({
        title: '请输入理论内容',
        icon: 'none'
      });
      return;
    }

    if (this.data.isSubmitting) {
      return;
    }

    this.setData({
      isSubmitting: true
    });

    wx.showLoading({
      title: '提交中...'
    });

    // TODO: 调用后端API提交理论记录
    setTimeout(() => {
      wx.hideLoading();
      
      this.setData({
        isSubmitting: false
      });

      try {
        // 保存理论数据到全局存储，供行动生成页面使用
        wx.setStorageSync('current_theory', this.data.theoryText.trim());
        
        // 保存到历史记录
        const historyKey = 'theory_history';
        let history = wx.getStorageSync(historyKey) || [];
        const newRecord = {
          id: Date.now(),
          content: this.data.theoryText.trim(),
          createTime: new Date().toISOString(),
          timestamp: Date.now()
        };
        history.unshift(newRecord);
        // 只保留最近50条记录
        if (history.length > 50) {
          history = history.slice(0, 50);
        }
        wx.setStorageSync(historyKey, history);
        
        // 触发成就检查
        this.checkAchievements();
        
        wx.showToast({
          title: '提交成功',
          icon: 'success',
          duration: 1500,
          success: () => {
            // 清除草稿
            wx.removeStorageSync('theory_draft');
            
            // 设置标记，表示数据已更新，需要刷新主页
            wx.setStorageSync('need_refresh_home', true);
            
            // 静默同步到飞书
            setTimeout(() => {
              this.syncToFeishu();
            }, 500);
          }
        });
      } catch (error) {
        console.error('保存理论数据失败:', error);
        wx.showToast({
          title: '保存失败，请重试',
          icon: 'error'
        });
      }
    }, 1500);
  },

  /**
   * 同步到飞书
   */
  syncToFeishu() {
    const theoryData = {
      content: this.data.theoryText.trim(),
      source: 'PulseVyne小程序',
      timestamp: new Date().toLocaleString()
    };

    const formattedText = feishuManager.formatRecordText(
      feishuManager.getLineTypes().THEORY, 
      theoryData
    );

    feishuManager.createTheoryRecord(formattedText)
      .then(response => {
        console.log('飞书同步成功:', response);
        // 静默成功，直接显示下一步选择
        this.showNextStepOptions();
      })
      .catch(error => {
        console.error('飞书同步失败:', error);
        
        // 只在出错时显示错误信息
        wx.showToast({
          title: `同步失败: ${error.message}`,
          icon: 'error',
          duration: 3000
        });
        
        // 即使同步失败也继续下一步
        setTimeout(() => {
          this.showNextStepOptions();
        }, 3000);
      });
  },

  /**
   * 显示下一步选择
   */
  showNextStepOptions() {
    wx.showModal({
      title: '下一步',
      content: '您希望：',
      cancelText: '返回首页',
      confirmText: '生成行动',
      success: (res) => {
        if (res.confirm) {
          // 跳转到行动生成页面
          wx.navigateTo({
            url: '/pages/action/action'
          });
        } else {
          // 返回首页
          wx.navigateBack({
            delta: 1
          });
        }
      }
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
      
      // 如果找不到成就页面实例，创建临时实例进行检查
      if (!achievementPage) {
        // 直接调用成就检查逻辑
        const currentHour = new Date().getHours();
        const theoryHistory = wx.getStorageSync('theory_history') || [];
        
        // 检查理论先锋成就
        if (theoryHistory.length === 1) {
          console.log('🎉 解锁成就: 理论先锋');
        }
        
        // 检查早起鸟成就
        if (currentHour < 6) {
          console.log('🎉 解锁成就: 早起鸟');
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

    if (pageMap[page] && page !== 'theory') {
      wx.navigateTo({
        url: pageMap[page]
      });
    }
  },

  /**
   * 测试OCR功能（开发模式）
   */
  testOCR() {
    wx.showLoading({
      title: '测试中...'
    });

    // 测试获取Access Token
    baiduOCR.getAccessToken()
      .then(token => {
        wx.hideLoading();
        wx.showModal({
          title: 'OCR测试结果',
          content: `✅ Access Token获取成功\n长度: ${token.length}\n前缀: ${token.substring(0, 20)}...`,
          showCancel: false,
          confirmText: '确定'
        });
      })
      .catch(error => {
        wx.hideLoading();
        wx.showModal({
          title: 'OCR测试失败',
          content: `❌ ${error.message}`,
          showCancel: false,
          confirmText: '确定'
        });
      });
  }
});