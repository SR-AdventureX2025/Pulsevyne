// 提醒管理器
class ReminderManager {
  constructor() {
    // 注意：请确保在微信公众平台中正确配置了订阅消息模板
    // 如果遇到模板ID不存在的错误，请检查以下几点：
    // 1. 在微信公众平台 -> 功能 -> 订阅消息中添加模板
    // 2. 确保模板ID正确无误
    // 3. 模板状态为"正常"
    this.templateId = 'fOnlSnJzLlzrTMbxx-aRum2vuSxaItxjljp6oXs-w6c'
    this.reminderKey = 'action_reminders'
    
    // 备用模板ID（如果主模板不可用）
    this.fallbackTemplateId = null // 可以设置备用模板ID
  }

  // 设置行动提醒
  setActionReminder(actionData) {
    const reminderId = this.generateReminderId()
    const reminderTime = new Date(Date.now() + 12 * 60 * 60 * 1000) // 12小时后
    
    const reminder = {
      id: reminderId,
      actionId: actionData.id,
      title: actionData.title,
      description: actionData.description,
      createTime: new Date().toISOString(),
      reminderTime: reminderTime.toISOString(),
      status: 'pending', // pending, sent, cancelled
      notificationData: {
        thing1: { value: actionData.title }, // 事项主题
        thing2: { value: actionData.description }, // 事项名称
        phrase3: { value: '待执行' }, // 任务状态
        time4: { value: this.formatTime(reminderTime) } // 提醒时间
      }
    }

    // 保存到本地存储
    this.saveReminder(reminder)
    
    // 设置定时器
    this.scheduleReminder(reminder)
    
    return reminderId
  }

  // 生成提醒ID
  generateReminderId() {
    return 'reminder_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  }

  // 保存提醒到本地存储
  saveReminder(reminder) {
    try {
      let reminders = wx.getStorageSync(this.reminderKey) || []
      reminders.push(reminder)
      wx.setStorageSync(this.reminderKey, reminders)
      console.log('提醒已保存:', reminder.id)
    } catch (error) {
      console.error('保存提醒失败:', error)
    }
  }

  // 设置定时器
  scheduleReminder(reminder) {
    const now = new Date().getTime()
    const reminderTime = new Date(reminder.reminderTime).getTime()
    const delay = reminderTime - now

    if (delay > 0) {
      setTimeout(() => {
        this.sendReminder(reminder)
      }, delay)
      console.log(`提醒已设置，将在${delay / 1000 / 60}分钟后触发`)
    }
  }

  // 发送提醒
  async sendReminder(reminder) {
    try {
      // 检查提醒是否仍然有效
      if (!this.isReminderValid(reminder)) {
        console.log('提醒已失效，跳过发送')
        return
      }

      // 请求订阅消息权限
      const subscribeResult = await this.requestSubscribeMessage()
      if (!subscribeResult) {
        console.log('用户拒绝订阅消息')
        return
      }

      // 发送订阅消息（这里需要后端支持）
      await this.sendSubscribeMessage(reminder)
      
      // 更新提醒状态
      this.updateReminderStatus(reminder.id, 'sent')
      
      console.log('提醒发送成功:', reminder.id)
    } catch (error) {
      console.error('发送提醒失败:', error)
    }
  }

  // 请求订阅消息权限
  requestSubscribeMessage() {
    return new Promise((resolve) => {
      // 首先检查是否已经有权限
      const hasPermission = wx.getStorageSync('notification_permission_granted')
      if (hasPermission) {
        resolve(true)
        return
      }
      
      // 检查模板ID是否有效
      if (!this.templateId) {
        console.error('模板ID未配置')
        wx.showToast({
          title: '提醒功能暂不可用',
          icon: 'none'
        })
        resolve(false)
        return
      }
      
      // 如果没有权限，重新请求
      wx.requestSubscribeMessage({
        tmplIds: [this.templateId],
        success: (res) => {
          console.log('订阅消息权限请求结果:', res)
          if (res[this.templateId] === 'accept') {
            wx.setStorageSync('notification_permission_granted', true)
            resolve(true)
          } else if (res[this.templateId] === 'reject') {
            wx.setStorageSync('notification_permission_granted', false)
            wx.showToast({
              title: '您已拒绝接收提醒',
              icon: 'none'
            })
            resolve(false)
          } else {
            wx.setStorageSync('notification_permission_granted', false)
            resolve(false)
          }
        },
        fail: (error) => {
          console.error('请求订阅消息失败:', error)
          wx.setStorageSync('notification_permission_granted', false)
          
          // 根据错误码提供具体的错误提示
          if (error.errCode === 20001) {
            wx.showModal({
              title: '模板配置错误',
              content: '订阅消息模板未正确配置，请联系开发者。错误码：20001',
              showCancel: false
            })
          } else if (error.errCode === 10003) {
            wx.showToast({
              title: '请在微信中打开小程序',
              icon: 'none'
            })
          } else {
            wx.showToast({
              title: '权限请求失败',
              icon: 'none'
            })
          }
          
          resolve(false)
        }
      })
    })
  }

  // 发送订阅消息（需要后端API支持）
  sendSubscribeMessage(reminder) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: 'https://pulsevyneapi.moonpeaches.xyz/api/send-reminder',
        method: 'POST',
        data: {
          openid: wx.getStorageSync('openid'), // 需要获取用户openid
          templateId: this.templateId,
          data: reminder.notificationData,
          page: 'pages/execution/execution' // 点击通知跳转的页面
        },
        success: (res) => {
          if (res.data.success) {
            resolve(res.data)
          } else {
            reject(new Error(res.data.message || '发送失败'))
          }
        },
        fail: (error) => {
          reject(error)
        }
      })
    })
  }

  // 检查提醒是否仍然有效
  isReminderValid(reminder) {
    try {
      // 检查对应的行动是否已完成
      const executionHistory = wx.getStorageSync('execution_history') || []
      const isCompleted = executionHistory.some(execution => 
        execution.actionId === reminder.actionId
      )
      
      if (isCompleted) {
        this.updateReminderStatus(reminder.id, 'cancelled')
        return false
      }
      
      return true
    } catch (error) {
      console.error('检查提醒有效性失败:', error)
      return false
    }
  }

  // 更新提醒状态
  updateReminderStatus(reminderId, status) {
    try {
      let reminders = wx.getStorageSync(this.reminderKey) || []
      const index = reminders.findIndex(r => r.id === reminderId)
      if (index !== -1) {
        reminders[index].status = status
        reminders[index].updateTime = new Date().toISOString()
        wx.setStorageSync(this.reminderKey, reminders)
      }
    } catch (error) {
      console.error('更新提醒状态失败:', error)
    }
  }

  // 取消提醒
  cancelReminder(actionId) {
    try {
      let reminders = wx.getStorageSync(this.reminderKey) || []
      reminders.forEach(reminder => {
        if (reminder.actionId === actionId && reminder.status === 'pending') {
          this.updateReminderStatus(reminder.id, 'cancelled')
        }
      })
    } catch (error) {
      console.error('取消提醒失败:', error)
    }
  }

  // 获取所有提醒
  getAllReminders() {
    try {
      return wx.getStorageSync(this.reminderKey) || []
    } catch (error) {
      console.error('获取提醒列表失败:', error)
      return []
    }
  }

  // 清理过期提醒
  cleanExpiredReminders() {
    try {
      let reminders = wx.getStorageSync(this.reminderKey) || []
      const now = new Date().getTime()
      
      reminders = reminders.filter(reminder => {
        const reminderTime = new Date(reminder.reminderTime).getTime()
        // 保留24小时内的提醒记录
        return (now - reminderTime) < 24 * 60 * 60 * 1000
      })
      
      wx.setStorageSync(this.reminderKey, reminders)
    } catch (error) {
      console.error('清理过期提醒失败:', error)
    }
  }

  // 格式化时间
  formatTime(date) {
    const d = new Date(date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const hour = String(d.getHours()).padStart(2, '0')
    const minute = String(d.getMinutes()).padStart(2, '0')
    
    return `${year}年${month}月${day}日 ${hour}:${minute}`
  }

  // 初始化提醒管理器（恢复未完成的提醒）
  init() {
    try {
      const reminders = this.getAllReminders()
      const now = new Date().getTime()
      
      reminders.forEach(reminder => {
        if (reminder.status === 'pending') {
          const reminderTime = new Date(reminder.reminderTime).getTime()
          if (reminderTime > now) {
            // 重新设置定时器
            this.scheduleReminder(reminder)
          } else {
            // 立即发送过期的提醒
            this.sendReminder(reminder)
          }
        }
      })
      
      // 清理过期提醒
      this.cleanExpiredReminders()
    } catch (error) {
      console.error('初始化提醒管理器失败:', error)
    }
  }
}

// 创建全局实例
const reminderManager = new ReminderManager()

module.exports = reminderManager