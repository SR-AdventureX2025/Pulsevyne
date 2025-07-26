# API集成说明

本文档说明如何将提供的API集成到PulseVyne小程序中。

## 📋 已集成的API

### 1. 行动建议生成API
- **端点**: `POST /api/generate-suggestions`
- **功能**: 根据理论内容生成3-5个行动建议
- **集成位置**: `pages/action/action.js`

### 2. 进展反馈生成API
- **端点**: `POST /api/generate-feedback`
- **功能**: 基于执行数据生成进展反馈和改进建议
- **集成位置**: `pages/progress/progress.js`

## 🔧 配置步骤

### 1. 修改API地址

编辑 `config/api.js` 文件，将 `BASE_URL` 替换为您的实际API服务器地址：

```javascript
const API_CONFIG = {
  // 将此处替换为您的API服务器地址
  BASE_URL: 'https://your-api-domain.com',
  // ...
};
```

### 2. 测试API连接

在小程序中测试API功能：

1. **测试行动建议生成**：
   - 进入理论记录页面
   - 输入理论内容并提交
   - 在行动生成页面点击生成建议

2. **测试进展反馈生成**：
   - 确保有执行记录数据
   - 进入进展反馈页面
   - 查看是否正确生成反馈

## 📊 API数据格式

### 行动建议生成API

**请求格式**：
```json
{
  "input": "用户输入的理论内容"
}
```

**响应格式**：
```json
{
  "success": true,
  "message": "建议生成完成",
  "suggestions": [
    {
      "emoji": "⏰",
      "title": "时间管理优化",
      "content": "使用番茄工作法，25分钟专注工作..."
    }
  ]
}
```

### 进展反馈生成API

**请求格式**：
```json
{
  "execution_summary": {
    "weekly_executions": 5,
    "average_rating": 4.2,
    "completion_rate": 85,
    "execution_frequency": "每天执行"
  }
}
```

**响应格式**：
```json
{
  "success": true,
  "message": "进展反馈生成成功",
  "data": {
    "status_feedback": [
      {
        "emoji": "📈",
        "title": "执行频率表现",
        "content": "根据当前数据，你的执行频率处于良好水平..."
      }
    ],
    "improvement_suggestions": [
      {
        "emoji": "🎯",
        "title": "提升执行频率",
        "content": "建议制定更规律的执行计划..."
      }
    ]
  }
}
```

## 🛠️ 错误处理

### 自动降级机制

当API调用失败时，小程序会自动使用模拟数据：

1. **网络错误**：显示错误提示，询问是否使用模拟数据
2. **API错误**：记录错误日志，自动切换到备用数据
3. **超时处理**：10秒超时后自动降级

### 错误日志

所有API调用错误都会记录在控制台中，便于调试：

```javascript
console.error('API调用失败:', error);
```

## 🔍 调试指南

### 1. 检查网络连接

确保小程序有网络访问权限，在 `app.json` 中配置：

```json
{
  "permission": {
    "scope.userLocation": {
      "desc": "你的位置信息将用于小程序位置接口的效果展示"
    }
  }
}
```

### 2. 查看请求日志

在开发者工具的Network面板中查看API请求：
- 请求URL是否正确
- 请求参数是否完整
- 响应状态码和内容

### 3. 测试API端点

可以使用Postman或其他工具直接测试API：

```bash
# 测试行动建议生成
curl -X POST https://your-api-domain.com/api/generate-suggestions \
  -H "Content-Type: application/json" \
  -d '{"input": "我想要提高工作效率"}'

# 测试进展反馈生成
curl -X POST https://your-api-domain.com/api/generate-feedback \
  -H "Content-Type: application/json" \
  -d '{"execution_summary": {"weekly_executions": 5, "average_rating": 4.2, "completion_rate": 85, "execution_frequency": "每天执行"}}'
```

## 📈 性能优化

### 1. 请求缓存

可以考虑添加请求缓存机制，避免重复调用：

```javascript
// 在config/api.js中添加缓存逻辑
const cache = new Map();

function getCacheKey(endpoint, data) {
  return `${endpoint}_${JSON.stringify(data)}`;
}
```

### 2. 请求去重

防止用户快速点击导致的重复请求：

```javascript
// 在页面中添加请求状态管理
data: {
  isRequesting: false
}
```

## 🚀 部署注意事项

1. **域名配置**：确保API域名已在微信小程序后台配置为合法域名
2. **HTTPS要求**：API服务器必须支持HTTPS
3. **跨域处理**：API服务器需要正确配置CORS
4. **错误监控**：建议集成错误监控服务，及时发现API问题

## 📞 技术支持

如果在集成过程中遇到问题，请检查：

1. API服务器是否正常运行
2. 网络连接是否稳定
3. 请求参数格式是否正确
4. 响应数据格式是否符合预期

更多技术细节请参考源代码中的注释和错误处理逻辑。