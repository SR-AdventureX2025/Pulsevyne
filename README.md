<div align="center">

# PulseVyne

<img src="https://img.shields.io/badge/Platform-WeChat%20MiniProgram-07C160" alt="Platform">
<img src="https://img.shields.io/badge/Language-JavaScript-F7DF1E" alt="Language">
<img src="https://img.shields.io/static/v1?label=LICENSE&message=MIT&color=blue" alt="License">
<img src="https://img.shields.io/badge/Version-1.0.0-brightgreen" alt="Version">

一款专注于个人效率提升的微信小程序<br/>
将理论知识转化为实际行动的智能工具

#### 理论到行动的智能转化 | 数据驱动的效率提升

</div>

## 功能特点

### 🧠 理论实践追踪
- 理论学习记录与管理
- 智能行动建议生成
- 执行进度实时追踪
- 完成率统计分析

### 📊 数据可视化
- 清晰的统计数据展示
- 今日概览与总概览
- 执行频率分析
- 进度反馈报告

### 🤖 AI智能分析
- 基于执行数据的个性化建议
- 智能反馈生成
- 行动计划优化
- 持续改进指导

### 🔗 飞书深度集成
- 飞书表格数据同步
- 团队协作支持
- 知识管理整合
- 实时数据更新

### 🏆 成就激励系统
- 游戏化设计
- 成就徽章收集
- 进步里程碑
- 持续动力激发

## 技术栈

- **平台**: 微信小程序原生开发
- **前端语言**: JavaScript (ES6+)
- **模板引擎**: WXML
- **样式语言**: WXSS
- **状态管理**: 小程序原生 data/setData
- **组件化**: 自定义组件开发
- **API集成**: RESTful API
- **工具库**: 飞书SDK、百度OCR、提醒管理
- **图形格式**: SVG矢量图形
- **主题设计**: 极光绿色主题

## 项目结构

```
PulseVyne/
├── app.js                 # 应用入口文件
├── app.json              # 应用配置文件
├── app.wxss              # 全局样式文件
├── components/           # 自定义组件
│   └── navigation-bar/   # 导航栏组件
├── config/
│   └── api.js           # API配置与管理
├── pages/               # 页面文件
│   ├── index/           # 首页
│   ├── theory/          # 理论记录页
│   ├── action/          # 行动生成页
│   ├── execution/       # 执行记录页
│   ├── progress/        # 进展分析页
│   └── achievement/     # 成就页面
├── utils/               # 工具类
│   ├── feishuManager.js # 飞书管理器
│   ├── reminderManager.js # 提醒管理器
│   ├── baiduOCR.js     # OCR识别
│   └── shareManager.js  # 分享管理
├── images/              # 图片资源
└── docs/               # 文档说明
```

## 安装指南

### 前置要求
- 微信开发者工具
- 微信小程序开发账号
- 飞书开发者账号（可选）

### 安装步骤

1. **克隆项目**
```bash
git clone [项目地址]
cd PulseVyne
```

2. **导入微信开发者工具**
- 打开微信开发者工具
- 选择"导入项目"
- 选择项目目录
- 填入AppID（测试号或正式号）

3. **配置API接口**
```javascript
// config/api.js
const API_CONFIG = {
  BASE_URL: 'https://your-api-domain.com',
  // 其他配置...
}
```

4. **配置飞书集成（可选）**
- 在飞书开放平台创建应用
- 获取App ID和App Secret
- 配置回调地址

## 开发配置

### 代码规范
项目使用ESLint进行代码规范检查：

```javascript
// .eslintrc.js
module.exports = {
  "env": {
    "es6": true,
    "node": true
  },
  "extends": "eslint:recommended",
  "parserOptions": {
    "ecmaVersion": 2018
  }
}
```

### 环境变量
在`config/api.js`中配置不同环境的API地址：

```javascript
const getApiUrl = () => {
  // 根据环境返回不同的API地址
  const accountInfo = wx.getAccountInfoSync()
  const envVersion = accountInfo.miniProgram.envVersion
  
  switch(envVersion) {
    case 'develop': return 'https://dev-api.example.com'
    case 'trial': return 'https://test-api.example.com'
    case 'release': return 'https://api.example.com'
    default: return 'https://api.example.com'
  }
}
```

## 部署指南

### 小程序发布
1. 在微信开发者工具中点击"上传"
2. 填写版本号和项目备注
3. 登录微信公众平台
4. 提交审核
5. 审核通过后发布

### 后端API部署
- 确保API服务器稳定运行
- 配置HTTPS证书
- 设置域名白名单
- 配置服务器域名

## 使用说明

### 基本流程
1. **记录理论**: 在理论页面记录学习内容
2. **生成行动**: AI分析并生成具体行动建议
3. **执行记录**: 记录行动执行情况和感受
4. **查看进展**: 分析执行数据和改进建议
5. **收集成就**: 完成里程碑获得成就徽章

### 高级功能
- **飞书同步**: 将数据同步到飞书表格
- **OCR识别**: 拍照识别文字内容
- **智能提醒**: 设置执行提醒通知
- **数据分析**: 查看详细的执行统计

## 贡献指南

欢迎提交Issue和Pull Request来改进项目！

### 开发流程
1. Fork项目
2. 创建功能分支
3. 提交更改
4. 发起Pull Request

### 代码提交规范
```
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式调整
refactor: 代码重构
test: 测试相关
chore: 构建过程或辅助工具的变动
```

## 许可协议

本项目采用 **MIT** 许可协议。

### 使用条款
- ✅ 商业使用
- ✅ 修改
- ✅ 分发
- ✅ 私人使用
- ❗ 需要包含许可证和版权声明

[查看完整许可协议](LICENSE)

## 联系我们

- 📧 邮箱: [your-email@example.com]
- 🐛 问题反馈: [GitHub Issues]
- 💬 讨论交流: [微信群/QQ群]

---

<div align="center">

**PulseVyne** - 让理论转化为行动，让行动创造价值

</div>