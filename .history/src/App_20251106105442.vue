<template>
  <div id="app">
    <transition name="fade" mode="out-in">
      <router-view />
    </transition>
    
    <!-- 固定联系按钮 -->
    <div class="fixed-contact-buttons">
      <!-- 电话按钮 -->
      <div class="contact-btn-wrapper">
        <div class="contact-btn phone-btn" @click="handlePhoneClick">
          <el-icon><Phone /></el-icon>
        </div>
        <div class="contact-tooltip phone-tooltip">
          <div class="tooltip-content">
            <div class="tooltip-item">
              <el-icon><Phone /></el-icon>
              <span>咨询电话: 18255246286</span>
            </div>
            <div class="tooltip-text">咨询/购买/备案/建议</div>
          </div>
        </div>
      </div>
      
      <!-- 聊天按钮 -->
      <div class="contact-btn-wrapper">
        <div class="contact-btn chat-btn" @click="handleChatClick">
          <el-icon><ChatDotRound /></el-icon>
        </div>
        <div class="contact-tooltip chat-tooltip">
          <div class="tooltip-content">
            <div class="qr-code-image">
              <img src="@/assets/image/qrcode.png" alt="微信二维码" />
            </div>
            <div class="tooltip-text">扫描上方二维码</div>
            <div class="tooltip-text">微信咨询</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'App',
  methods: {
    handlePhoneClick() {
      // window.location.href = 'tel:18255246289'
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
@import './assets/styles/main.scss';

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
  top: 50%;
  transform: translateY(-50%);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.contact-btn-wrapper {
  position: relative;
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
  position: relative;
  z-index: 2;
  
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

.contact-tooltip {
  position: absolute;
  right: 70px;
  top: 50%;
  transform: translateY(-50%) translateX(-10px);
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  padding: 16px;
  min-width: 200px;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  z-index: 1;
  border: 1px solid #e4e7ed;
  white-space: nowrap;
  
  // 箭头指向按钮
  &::after {
    content: '';
    position: absolute;
    right: -8px;
    top: 50%;
    transform: translateY(-50%);
    width: 0;
    height: 0;
    border-top: 8px solid transparent;
    border-bottom: 8px solid transparent;
    border-left: 8px solid white;
  }
  
  &::before {
    content: '';
    position: absolute;
    right: -9px;
    top: 50%;
    transform: translateY(-50%);
    width: 0;
    height: 0;
    border-top: 9px solid transparent;
    border-bottom: 9px solid transparent;
    border-left: 9px solid #e4e7ed;
    z-index: -1;
  }
}

.chat-tooltip {
  min-width: 180px;
  white-space: normal;
  
  .tooltip-content {
    align-items: center;
  }
}

.contact-btn-wrapper:hover .contact-tooltip {
  opacity: 1;
  visibility: visible;
  transform: translateY(-50%) translateX(0);
}

.tooltip-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
  
  .tooltip-item {
    display: flex;
    align-items: center;
    gap: 8px;
    
    .el-icon {
      color: #409EFF;
      font-size: 18px;
      flex-shrink: 0;
    }
    
    span {
      color: #303133;
      font-size: 14px;
      font-weight: 500;
    }
  }
  
  .tooltip-text {
    color: #606266;
    font-size: 13px;
    text-align: center;
    line-height: 1.5;
  }
  
  .qr-code-image {
    width: 160px;
    height: 160px;
    margin: 0 auto 8px;
    border: 1px solid #e4e7ed;
    border-radius: 4px;
    padding: 8px;
    background: white;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      display: block;
    }
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
  
  .contact-tooltip {
    right: 60px;
    padding: 12px;
    min-width: 160px;
    font-size: 12px;
    
    .qr-code-image {
      width: 120px;
      height: 120px;
    }
  }
}
</style>
