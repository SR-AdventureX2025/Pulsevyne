// 飞书测试页面逻辑
const { feishuManager } = require('../../utils/feishuManager.js');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    testText: '这是一个测试文本内容',
    selectedLineId: '执行',
    lineTypes: ['理论', '行动', '执行'],
    isTestingConnection: false,
    isCreatingRecord: false,
    testResults: [],
    connectionStatus: 'unknown' // unknown, success, failed
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log('飞书测试页面加载');
  },

  /**
   * 测试文本输入变化
   */
  onTestTextChange(e) {
    this.setData({
      testText: e.detail.value
    });
  },

  /**
   * 选择列类型
   */
  onLineTypeChange(e) {
    const index = e.detail.value;
    this.setData({
      selectedLineId: this.data.lineTypes[index]
    });
  },

  /**
   * 测试API连接
   */
  testConnection() {
    if (this.data.isTestingConnection) {
      return;
    }

    this.setData({
      isTestingConnection: true,
      connectionStatus: 'unknown'
    });

    wx.showLoading({
      title: '测试连接中...'
    });

    feishuManager.testConnection()
      .then(result => {
        wx.hideLoading();
        this.setData({
          isTestingConnection: false,
          connectionStatus: result.success ? 'success' : 'failed'
        });

        if (result.success) {
          wx.showToast({
            title: '连接成功',
            icon: 'success',
            duration: 2000
          });
          
          this.addTestResult({
            type: 'connection',
            success: true,
            message: result.message,
            data: result.data,
            timestamp: new Date().toLocaleString()
          });
        } else {
          wx.showModal({
            title: '连接失败',
            content: result.message,
            showCancel: false,
            confirmText: '确定'
          });
          
          this.addTestResult({
            type: 'connection',
            success: false,
            message: result.message,
            error: result.error,
            timestamp: new Date().toLocaleString()
          });
        }
      })
      .catch(error => {
        wx.hideLoading();
        this.setData({
          isTestingConnection: false,
          connectionStatus: 'failed'
        });
        
        wx.showModal({
          title: '测试失败',
          content: `连接测试失败: ${error.message}`,
          showCancel: false,
          confirmText: '确定'
        });
        
        this.addTestResult({
          type: 'connection',
          success: false,
          message: `连接测试失败: ${error.message}`,
          error: error,
          timestamp: new Date().toLocaleString()
        });
      });
  },

  /**
   * 创建测试记录
   */
  createTestRecord() {
    if (this.data.isCreatingRecord) {
      return;
    }

    if (!this.data.testText.trim()) {
      wx.showToast({
        title: '请输入测试文本',
        icon: 'none'
      });
      return;
    }

    this.setData({
      isCreatingRecord: true
    });

    wx.showLoading({
      title: '创建记录中...'
    });

    const testData = {
      content: this.data.testText.trim(),
      source: '飞书测试页面',
      timestamp: new Date().toLocaleString()
    };

    // 根据选择的列类型格式化文本
    const formattedText = feishuManager.formatRecordText(
      this.data.selectedLineId,
      testData
    );

    feishuManager.createRecord(this.data.selectedLineId, formattedText)
      .then(response => {
        wx.hideLoading();
        this.setData({
          isCreatingRecord: false
        });

        wx.showToast({
          title: '创建成功',
          icon: 'success',
          duration: 2000
        });

        this.addTestResult({
          type: 'create',
          success: true,
          lineId: this.data.selectedLineId,
          text: formattedText,
          message: response.message,
          data: response.data,
          timestamp: new Date().toLocaleString()
        });
      })
      .catch(error => {
        wx.hideLoading();
        this.setData({
          isCreatingRecord: false
        });

        wx.showModal({
          title: '创建失败',
          content: `记录创建失败: ${error.message}`,
          showCancel: false,
          confirmText: '确定'
        });

        this.addTestResult({
          type: 'create',
          success: false,
          lineId: this.data.selectedLineId,
          text: formattedText,
          message: `记录创建失败: ${error.message}`,
          error: error,
          timestamp: new Date().toLocaleString()
        });
      });
  },

  /**
   * 添加测试结果
   */
  addTestResult(result) {
    const results = [...this.data.testResults];
    results.unshift(result);
    
    // 只保留最近10条结果
    if (results.length > 10) {
      results.splice(10);
    }
    
    this.setData({
      testResults: results
    });
  },

  /**
   * 清空测试结果
   */
  clearTestResults() {
    wx.showModal({
      title: '确认清空',
      content: '确定要清空所有测试结果吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({
            testResults: []
          });
          wx.showToast({
            title: '已清空',
            icon: 'success'
          });
        }
      }
    });
  },

  /**
   * 查看测试结果详情
   */
  viewResultDetail(e) {
    const index = e.currentTarget.dataset.index;
    const result = this.data.testResults[index];
    
    if (!result) return;
    
    let content = `类型: ${result.type === 'connection' ? '连接测试' : '创建记录'}\n`;
    content += `状态: ${result.success ? '成功' : '失败'}\n`;
    content += `时间: ${result.timestamp}\n`;
    content += `消息: ${result.message}\n`;
    
    if (result.lineId) {
      content += `列ID: ${result.lineId}\n`;
    }
    
    if (result.data) {
      content += `数据: ${JSON.stringify(result.data, null, 2)}\n`;
    }
    
    if (result.error) {
      content += `错误: ${JSON.stringify(result.error, null, 2)}\n`;
    }
    
    wx.showModal({
      title: '测试结果详情',
      content: content,
      showCancel: false,
      confirmText: '确定'
    });
  },

  /**
   * 复制测试结果
   */
  copyResult(e) {
    const index = e.currentTarget.dataset.index;
    const result = this.data.testResults[index];
    
    if (!result) return;
    
    const resultText = JSON.stringify(result, null, 2);
    
    wx.setClipboardData({
      data: resultText,
      success: () => {
        wx.showToast({
          title: '已复制到剪贴板',
          icon: 'success'
        });
      }
    });
  },

  /**
   * 返回首页
   */
  goHome() {
    wx.reLaunch({
      url: '/pages/index/index'
    });
  }
});