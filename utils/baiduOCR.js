/**
 * 百度OCR图像识别工具类
 * 用于调用百度AI开放平台的网络图片文字识别API
 */

class BaiduOCR {
  constructor() {
    // 百度AI开放平台应用凭证
    this.appId = '119600967';
    this.apiKey = 'OL9IBG429eamVLajQiJU85Uo';
    this.secretKey = '1rkySb9VN4rNABFzoA31xf0fnNfyx27S';
    
    // API地址
    this.tokenUrl = 'https://aip.baidubce.com/oauth/2.0/token';
    this.ocrUrl = 'https://aip.baidubce.com/rest/2.0/ocr/v1/webimage';
    
    // 缓存access_token
    this.accessToken = null;
    this.tokenExpireTime = 0;
  }

  /**
   * 获取Access Token
   * @returns {Promise<string>} access_token
   */
  async getAccessToken() {
    // 检查token是否过期（提前5分钟刷新）
    const now = Date.now();
    if (this.accessToken && now < this.tokenExpireTime - 5 * 60 * 1000) {
      return this.accessToken;
    }

    return new Promise((resolve, reject) => {
      wx.request({
        url: this.tokenUrl,
        method: 'POST',
        data: {
          grant_type: 'client_credentials',
          client_id: this.apiKey,
          client_secret: this.secretKey
        },
        header: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        success: (res) => {
          if (res.statusCode === 200 && res.data.access_token) {
            this.accessToken = res.data.access_token;
            // 设置过期时间（30天，但我们提前5分钟刷新）
            this.tokenExpireTime = now + (res.data.expires_in * 1000);
            resolve(this.accessToken);
          } else {
            console.error('获取access_token失败:', res.data);
            reject(new Error(res.data.error_description || '获取access_token失败'));
          }
        },
        fail: (error) => {
          console.error('请求access_token失败:', error);
          reject(new Error('网络请求失败'));
        }
      });
    });
  }

  /**
   * 将图片转换为Base64编码
   * @param {string} filePath 图片文件路径
   * @returns {Promise<string>} base64编码的图片数据
   */
  async imageToBase64(filePath) {
    return new Promise((resolve, reject) => {
      console.log('开始读取图片文件:', filePath);
      
      // 直接使用微信小程序返回的临时文件路径
      wx.getFileSystemManager().readFile({
        filePath: filePath,
        encoding: 'base64',
        success: (res) => {
          console.log('文件读取成功，base64长度:', res.data.length);
          // 验证base64数据是否有效
          if (res.data && res.data.length > 0) {
            resolve(res.data);
          } else {
            console.error('base64数据为空');
            reject(new Error('图片数据为空'));
          }
        },
        fail: (error) => {
          console.error('读取图片文件失败:', error);
          console.error('文件路径:', filePath);
          
          // 提供更详细的错误信息
          let errorMessage = '读取图片文件失败';
          if (error.errMsg) {
            if (error.errMsg.includes('not found')) {
              errorMessage = '图片文件不存在或路径错误';
            } else if (error.errMsg.includes('permission')) {
              errorMessage = '没有读取文件的权限';
            } else if (error.errMsg.includes('size')) {
              errorMessage = '图片文件过大';
            }
          }
          
          reject(new Error(errorMessage));
        }
      });
    });
  }

  /**
   * 调用百度OCR API识别图片中的文字
   * @param {string} imagePath 图片路径
   * @param {Object} options 识别选项
   * @returns {Promise<Object>} 识别结果
   */
  async recognizeText(imagePath, options = {}) {
    try {
      // 获取access_token
      const accessToken = await this.getAccessToken();
      
      // 将图片转换为base64
      const base64Image = await this.imageToBase64(imagePath);
      
      // 构建请求参数
      const requestData = {
        image: encodeURIComponent(base64Image),
        detect_direction: options.detectDirection || 'false',
        detect_language: options.detectLanguage || 'false'
      };

      // 构建请求体
      const formData = Object.keys(requestData)
        .map(key => `${key}=${requestData[key]}`)
        .join('&');

      return new Promise((resolve, reject) => {
        wx.request({
          url: `${this.ocrUrl}?access_token=${accessToken}`,
          method: 'POST',
          data: formData,
          header: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          success: (res) => {
            if (res.statusCode === 200) {
              if (res.data.error_code) {
                console.error('OCR识别失败:', res.data);
                reject(new Error(res.data.error_msg || 'OCR识别失败'));
              } else {
                // 提取识别的文字内容
                const words = res.data.words_result
                  .map(item => item.words)
                  .join('\n');
                
                resolve({
                  text: words,
                  wordsNum: res.data.words_result_num,
                  rawResult: res.data
                });
              }
            } else {
              reject(new Error(`请求失败，状态码: ${res.statusCode}`));
            }
          },
          fail: (error) => {
            console.error('OCR请求失败:', error);
            reject(new Error('网络请求失败'));
          }
        });
      });
    } catch (error) {
      console.error('OCR识别过程出错:', error);
      throw error;
    }
  }

  /**
   * 快速识别图片文字（简化接口）
   * @param {string} imagePath 图片路径
   * @returns {Promise<string>} 识别出的文字内容
   */
  async quickRecognize(imagePath) {
    try {
      const result = await this.recognizeText(imagePath);
      return result.text;
    } catch (error) {
      throw error;
    }
  }
}

// 创建单例实例
const baiduOCR = new BaiduOCR();

module.exports = baiduOCR;