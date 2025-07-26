# PulseVyne 执行提醒功能 API 说明

## 功能概述

当用户生成行动建议后，系统会自动设置12小时后的执行提醒。如果用户在12小时内未完成执行记录，系统将通过微信订阅消息发送提醒通知。

## 模板消息配置

**模板ID**: `fOnlSnJzLlzrTMbxx-aRum2vuSxaItxjljp6oXs-w6c`

**模板内容**:
```
{{thing1.DATA}}
事项名称：{{thing2.DATA}}
任务状态：{{phrase3.DATA}}
提醒时间：{{time4.DATA}}
```

**字段说明**:
- `thing1`: 事项主题（如："深度学习"、"实践练习"等）
- `thing2`: 事项名称（行动计划的具体内容）
- `phrase3`: 任务状态（固定为"待执行"）
- `time4`: 提醒时间（格式：2024年01月15日 14:30）

## 后端API接口

### 发送提醒消息

**接口地址**: `POST /api/send-reminder`

**请求参数**:
```json
{
  "openid": "用户的openid",
  "templateId": "fOnlSnJzLlzrTMbxx-aRum2vuSxaItxjljp6oXs-w6c",
  "data": {
    "thing1": {
      "value": "深度学习"
    },
    "thing2": {
      "value": "每天花30分钟深入研究相关理论..."
    },
    "phrase3": {
      "value": "待执行"
    },
    "time4": {
      "value": "2024年01月15日 14:30"
    }
  },
  "page": "pages/execution/execution"
}
```

**响应格式**:
```json
{
  "success": true,
  "message": "提醒发送成功",
  "msgid": "消息ID"
}
```

**错误响应**:
```json
{
  "success": false,
  "message": "发送失败原因",
  "error_code": "错误码"
}
```

## 前端集成说明

### 1. 提醒管理器 (`utils/reminderManager.js`)

提供以下主要功能：
- `setActionReminder(actionData)`: 设置行动提醒
- `cancelReminder(actionId)`: 取消提醒
- `sendReminder(reminder)`: 发送提醒
- `init()`: 初始化提醒管理器

### 2. 集成位置

**行动生成页面** (`pages/action/action.js`):
- 在用户确认行动计划时自动设置12小时后的提醒
- 调用 `reminderManager.setActionReminder()`

**执行记录页面** (`pages/execution/execution.js`):
- 在用户提交执行记录时自动取消对应的提醒
- 调用 `reminderManager.cancelReminder()`

**应用启动** (`app.js`):
- 应用启动时初始化提醒管理器
- 恢复未完成的提醒定时器

### 3. 订阅消息权限

在发送提醒前，需要请求用户授权订阅消息：
```javascript
wx.requestSubscribeMessage({
  tmplIds: ['fOnlSnJzLlzrTMbxx-aRum2vuSxaItxjljp6oXs-w6c'],
  success: (res) => {
    if (res[templateId] === 'accept') {
      // 用户同意订阅，可以发送消息
    }
  }
})
```

## 使用流程

1. **用户生成行动建议**
   - 在行动生成页面确认行动计划
   - 系统自动设置12小时后的提醒
   - 保存提醒信息到本地存储

2. **定时器触发**
   - 12小时后定时器触发
   - 检查行动是否已完成
   - 如果未完成，请求订阅消息权限

3. **发送提醒**
   - 调用后端API发送订阅消息
   - 用户收到微信通知
   - 点击通知跳转到执行记录页面

4. **完成执行**
   - 用户提交执行记录
   - 系统自动取消对应的提醒
   - 更新提醒状态为已取消

## 注意事项

1. **权限管理**: 用户需要主动授权订阅消息，如果拒绝则无法发送提醒
2. **时效性**: 订阅消息有时效限制，需要在有效期内发送
3. **频率限制**: 避免频繁发送消息，遵守微信平台规范
4. **数据清理**: 定期清理过期的提醒记录，避免存储空间浪费
5. **错误处理**: 妥善处理网络错误、权限拒绝等异常情况

## 测试建议

1. **功能测试**:
   - 测试提醒设置和取消功能
   - 验证12小时定时器的准确性
   - 测试订阅消息的发送和接收

2. **边界测试**:
   - 测试应用重启后提醒恢复
   - 测试网络异常情况的处理
   - 测试用户拒绝订阅权限的情况

3. **性能测试**:
   - 测试大量提醒的处理性能
   - 验证定时器的内存占用
   - 测试本地存储的读写效率