// API配置文件
const API_CONFIG = {
  // 基础API地址 - 请替换为实际的API服务器地址
  BASE_URL: 'https://pulsevyneapi.moonpeaches.xyz', // 生产环境API地址
  // BASE_URL: 'http://localhost:5000', // 本地开发环境
  
  // API端点
  ENDPOINTS: {
    // 生成行动建议
    GENERATE_SUGGESTIONS: '/api/generate-suggestions',
    // 生成进展反馈
    GENERATE_FEEDBACK: '/api/generate-feedback',
    // 飞书记录创建
    CREATE_FEISHU_RECORD: '/api/create-feishu-record',
    // 获取飞书统计数据
    GET_TABLE_COLUMN_STATS: '/api/get-table-column-stats'
  },
  
  // 请求配置
  REQUEST_CONFIG: {
    timeout: 10000, // 10秒超时
    header: {
      'content-type': 'application/json'
    }
  }
};

// 获取完整的API URL
function getApiUrl(endpoint) {
  return API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS[endpoint];
}

// 通用API请求方法
function apiRequest(endpoint, data, options = {}) {
  return new Promise((resolve, reject) => {
    // 数据验证
    if (!data || (typeof data === 'object' && Object.keys(data).length === 0)) {
      reject(new Error('请求数据不能为空'));
      return;
    }
    
    // 检查输入数据的有效性
    if (endpoint === 'GENERATE_SUGGESTIONS' && 
        (!data.input || 
         data.input.trim() === '' ||
         data.input.includes('暂无理论记录') ||
         data.input.includes('加载理论数据失败'))) {
      reject(new Error('理论内容无效，请先添加有效的理论记录'));
      return;
    }
    
    if (endpoint === 'GENERATE_FEEDBACK' && 
        (!data.execution_summary || 
         data.execution_summary.weekly_executions === 0)) {
      reject(new Error('执行数据不足，请先添加执行记录'));
      return;
    }

    wx.request({
      url: getApiUrl(endpoint),
      method: 'POST',
      header: API_CONFIG.REQUEST_CONFIG.header,
      timeout: API_CONFIG.REQUEST_CONFIG.timeout,
      data: data,
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.data);
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${res.data.message || '请求失败'}`));
        }
      },
      fail: (error) => {
        console.error('API请求详情:', {
          url: getApiUrl(endpoint),
          params: data,
          error: error.errMsg
        });
        
        // 根据错误类型提供更友好的错误信息
        let errorMessage = '网络请求失败';
        if (error.errMsg) {
          if (error.errMsg.includes('timeout')) {
            errorMessage = '请求超时，请检查网络连接';
          } else if (error.errMsg.includes('fail')) {
            errorMessage = '网络连接失败，请稍后重试';
          } else {
            errorMessage = `网络请求失败: ${error.errMsg}`;
          }
        }
        
        reject(new Error(errorMessage));
      },
      ...options
    });
  });
}

// 生成行动建议API
function generateSuggestions(input) {
  return apiRequest('GENERATE_SUGGESTIONS', { input });
}

// 生成进展反馈API
function generateFeedback(executionSummary) {
  return apiRequest('GENERATE_FEEDBACK', { execution_summary: executionSummary });
}

// 创建飞书记录API
function createFeishuRecord(lineId, text) {
  return apiRequest('CREATE_FEISHU_RECORD', { 
    line_id: lineId, 
    text: text 
  });
}

// 获取飞书表格列统计数据API
function getTableColumnStats(columnId) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: getApiUrl('GET_TABLE_COLUMN_STATS'),
      method: 'POST',
      header: API_CONFIG.REQUEST_CONFIG.header,
      timeout: API_CONFIG.REQUEST_CONFIG.timeout,
      data: { column_id: columnId },
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.data);
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${res.data.message || '请求失败'}`));
        }
      },
      fail: (error) => {
        console.error('飞书表格列统计数据获取失败:', {
          url: getApiUrl('GET_TABLE_COLUMN_STATS'),
          columnId: columnId,
          error: error.errMsg
        });
        reject(new Error(`网络请求失败: ${error.errMsg || '未知错误'}`));
      }
    });
  });
}

// 获取飞书统计数据API（兼容旧版本）
function getFeishuStats() {
  // 定义三个列的ID（根据实际飞书表格配置）
  const COLUMN_IDS = {
    theory: '理论', // 理论列
    action: '行动', // 行动列
    execution: '执行' // 执行列
  };
  
  return Promise.all([
    getTableColumnStats(COLUMN_IDS.theory),
    getTableColumnStats(COLUMN_IDS.action),
    getTableColumnStats(COLUMN_IDS.execution)
  ]).then(results => {
    return {
      success: true,
      data: {
        theoryCount: results[0].success ? results[0].data.count : 0,
        actionCount: results[1].success ? results[1].data.count : 0,
        executionCount: results[2].success ? results[2].data.count : 0
      }
    };
  }).catch(error => {
    console.error('获取飞书统计数据失败:', error);
    throw error;
  });
}

// 获取链接内容API
function getLinkContent(url) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: API_CONFIG.BASE_URL + '/api/get-link-content',
      method: 'POST',
      header: API_CONFIG.REQUEST_CONFIG.header,
      timeout: API_CONFIG.REQUEST_CONFIG.timeout,
      data: { url },
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.data);
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${res.data.message || '请求失败'}`));
        }
      },
      fail: (error) => {
        console.error('链接内容获取失败:', {
          url: API_CONFIG.BASE_URL + '/api/get-link-content',
          params: { url },
          error: error.errMsg
        });
        reject(new Error(`网络请求失败: ${error.errMsg || '未知错误'}`));
      }
    });
  });
}

module.exports = {
  API_CONFIG,
  getApiUrl,
  apiRequest,
  generateSuggestions,
  generateFeedback,
  createFeishuRecord,
  getTableColumnStats,
  getFeishuStats,
  getLinkContent
};