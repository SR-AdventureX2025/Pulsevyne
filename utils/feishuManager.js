/**
 * 飞书集成管理器
 * 用于管理飞书记录的创建、测试和数据同步
 */

const { createFeishuRecord } = require('../config/api.js');

class FeishuManager {
  constructor() {
    // 飞书列类型映射
    this.LINE_TYPES = {
      THEORY: '理论',
      ACTION: '行动', 
      EXECUTION: '执行'
    };
    
    // 记录创建状态
    this.isCreating = false;
  }

  /**
   * 创建飞书记录
   * @param {string} lineId - 列ID（理论/行动/执行）
   * @param {string} text - 记录内容
   * @returns {Promise} API响应结果
   */
  async createRecord(lineId, text) {
    if (this.isCreating) {
      throw new Error('正在创建记录中，请稍候...');
    }

    if (!lineId || !text) {
      throw new Error('列ID和文本内容不能为空');
    }

    if (!Object.values(this.LINE_TYPES).includes(lineId)) {
      throw new Error(`无效的列ID: ${lineId}，支持的类型: ${Object.values(this.LINE_TYPES).join('、')}`);
    }

    try {
      this.isCreating = true;
      console.log('创建飞书记录:', { lineId, text });
      
      const response = await createFeishuRecord(lineId, text);
      
      if (response.success) {
        console.log('飞书记录创建成功:', response);
        return {
          success: true,
          data: response.data,
          message: response.message || '记录创建成功'
        };
      } else {
        throw new Error(response.message || '记录创建失败');
      }
    } catch (error) {
      console.error('飞书记录创建失败:', error);
      throw error;
    } finally {
      this.isCreating = false;
    }
  }

  /**
   * 创建理论记录
   * @param {string} theoryText - 理论内容
   * @returns {Promise} API响应结果
   */
  async createTheoryRecord(theoryText) {
    return this.createRecord(this.LINE_TYPES.THEORY, theoryText);
  }

  /**
   * 创建行动记录
   * @param {string} actionText - 行动内容
   * @returns {Promise} API响应结果
   */
  async createActionRecord(actionText) {
    return this.createRecord(this.LINE_TYPES.ACTION, actionText);
  }

  /**
   * 创建执行记录
   * @param {string} executionText - 执行内容
   * @returns {Promise} API响应结果
   */
  async createExecutionRecord(executionText) {
    return this.createRecord(this.LINE_TYPES.EXECUTION, executionText);
  }

  /**
   * 测试飞书API连接
   * @returns {Promise} 测试结果
   */
  async testConnection() {
    try {
      const testText = `测试连接 - ${new Date().toLocaleString()}`;
      const response = await this.createRecord(this.LINE_TYPES.EXECUTION, testText);
      
      return {
        success: true,
        message: '飞书API连接正常',
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: `飞书API连接失败: ${error.message}`,
        error: error
      };
    }
  }

  /**
   * 批量创建记录
   * @param {Array} records - 记录数组 [{lineId, text}, ...]
   * @returns {Promise} 批量创建结果
   */
  async batchCreateRecords(records) {
    if (!Array.isArray(records) || records.length === 0) {
      throw new Error('记录数组不能为空');
    }

    const results = [];
    const errors = [];

    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      try {
        const result = await this.createRecord(record.lineId, record.text);
        results.push({
          index: i,
          success: true,
          data: result.data,
          record: record
        });
      } catch (error) {
        errors.push({
          index: i,
          success: false,
          error: error.message,
          record: record
        });
      }
      
      // 添加延迟避免API限流
      if (i < records.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    return {
      total: records.length,
      success: results.length,
      failed: errors.length,
      results: results,
      errors: errors
    };
  }

  /**
   * 格式化记录内容
   * @param {string} type - 记录类型
   * @param {Object} data - 原始数据
   * @returns {string} 格式化后的文本
   */
  formatRecordText(type, data) {
    const timestamp = new Date().toLocaleString();
    
    switch (type) {
      case this.LINE_TYPES.THEORY:
        return `【理论记录】\n时间: ${timestamp}\n内容: ${data.content || data.text}\n来源: ${data.source || 'PulseVyne小程序'}`;
      
      case this.LINE_TYPES.ACTION:
        return `【行动计划】\n时间: ${timestamp}\n标题: ${data.title || ''}\n内容: ${data.content || data.text}\n优先级: ${data.priority || '中等'}`;
      
      case this.LINE_TYPES.EXECUTION:
        return `【执行记录】\n时间: ${timestamp}\n内容: ${data.content || data.text}\n完成度: ${data.progress || 0}%\n评分: ${data.rating || 'N/A'}`;
      
      default:
        return `【记录】\n时间: ${timestamp}\n内容: ${data.content || data.text || data}`;
    }
  }

  /**
   * 获取支持的列类型
   * @returns {Object} 列类型映射
   */
  getLineTypes() {
    return { ...this.LINE_TYPES };
  }

  /**
   * 检查是否正在创建记录
   * @returns {boolean} 创建状态
   */
  isCreatingRecord() {
    return this.isCreating;
  }
}

// 创建单例实例
const feishuManager = new FeishuManager();

module.exports = {
  FeishuManager,
  feishuManager
};