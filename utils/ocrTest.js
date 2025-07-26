/**
 * 百度OCR功能测试文件
 * 用于验证图像识别功能是否正常工作
 */

const baiduOCR = require('./baiduOCR.js');

/**
 * 测试获取Access Token
 */
function testGetAccessToken() {
  console.log('开始测试获取Access Token...');
  
  baiduOCR.getAccessToken()
    .then(token => {
      console.log('✅ Access Token获取成功:', token.substring(0, 20) + '...');
      return true;
    })
    .catch(error => {
      console.error('❌ Access Token获取失败:', error.message);
      return false;
    });
}

/**
 * 测试图像识别功能
 * @param {string} imagePath 测试图片路径
 */
function testImageRecognition(imagePath) {
  console.log('开始测试图像识别功能...');
  console.log('测试图片路径:', imagePath);
  
  baiduOCR.quickRecognize(imagePath)
    .then(text => {
      console.log('✅ 图像识别成功');
      console.log('识别结果:', text);
      console.log('文字长度:', text.length);
      return true;
    })
    .catch(error => {
      console.error('❌ 图像识别失败:', error.message);
      return false;
    });
}

/**
 * 完整功能测试
 */
function runFullTest() {
  console.log('=== 百度OCR功能完整测试 ===');
  console.log('测试时间:', new Date().toLocaleString());
  console.log('');
  
  // 测试1: Access Token获取
  testGetAccessToken();
  
  console.log('');
  console.log('=== 测试完成 ===');
  console.log('注意：图像识别测试需要提供实际的图片路径');
  console.log('使用方法：testImageRecognition("图片路径")');
}

/**
 * 验证API配置
 */
function validateConfig() {
  console.log('=== API配置验证 ===');
  console.log('AppID:', baiduOCR.appId);
  console.log('API Key:', baiduOCR.apiKey.substring(0, 10) + '...');
  console.log('Secret Key:', baiduOCR.secretKey.substring(0, 10) + '...');
  console.log('Token URL:', baiduOCR.tokenUrl);
  console.log('OCR URL:', baiduOCR.ocrUrl);
  console.log('');
}

// 导出测试函数
module.exports = {
  testGetAccessToken,
  testImageRecognition,
  runFullTest,
  validateConfig
};

// 如果直接运行此文件，执行完整测试
if (typeof wx === 'undefined') {
  // 非小程序环境下的测试提示
  console.log('此测试文件需要在微信小程序环境中运行');
  console.log('请在小程序页面中引入并调用测试函数');
} else {
  // 小程序环境下自动运行配置验证
  validateConfig();
}