<template>
  <div id="app">
    <router-view />
    
    <!-- 固定联系按钮 -->
    <div class="fixed-contact-buttons">
      <div class="contact-btn phone-btn" @click="handlePhoneClick">
        <el-icon><PhoneFilled /></el-icon>
      </div>
      <div class="contact-btn chat-btn" @click="handleChatClick">
        <el-icon><ChatDotRound /></el-icon>
      </div>
    </div>
  </div>
</template>

<script>
import { PhoneFilled, ChatDotRound } from '@element-plus/icons-vue'

export default {
  name: 'App',
  components: {
    PhoneFilled,
    ChatDotRound
  },
  methods: {
    handlePhoneClick() {
      window.location.href = 'tel:18255246289'
    },
    handleChatClick() {
      // 可以跳转到微信或其他聊天工具
      // 或者打开聊天窗口
      console.log('打开聊天')
      // 如果需要打开企业微信，可以使用二维码或其他方式
    }
  }
}
</script>

<style>
#app {
  font-family: 'PingFang SC', 'Microsoft YaHei', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  line-height: 1.6;
  color: #333;
}
</style>
