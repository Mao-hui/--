<template>
  <div id="app">
    <router-view />
    
    <!-- 固定联系按钮 -->
    <div class="fixed-contact-buttons">
      <div class="contact-btn phone-btn" @click="handlePhoneClick">
        <el-icon><Phone /></el-icon>
      </div>
      <div class="contact-btn chat-btn" @click="handleChatClick">
        <el-icon><ChatDotRound /></el-icon>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'App',
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

<style lang="scss">
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

/* 固定联系按钮 */
.fixed-contact-buttons {
  position: fixed;
  right: 30px;
  bottom: 30px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.contact-btn {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #409EFF;
  color: white;
  @include flex-center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.4);
  transition: all 0.3s ease;
  
  .el-icon {
    font-size: 24px;
  }
  
  &:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 20px rgba(64, 158, 255, 0.6);
    background: #66B1FF;
  }
  
  &:active {
    transform: scale(0.95);
  }
}

@media (max-width: 768px) {
  .fixed-contact-buttons {
    right: 20px;
    bottom: 20px;
  }
  
  .contact-btn {
    width: 50px;
    height: 50px;
    
    .el-icon {
      font-size: 22px;
    }
  }
}
</style>
