<template>
  <header class="header">
    <div class="container">
      <div class="header-content">
        <div class="logo">
          <h1>向量科技</h1>
        </div>
        <nav class="nav">
          <el-menu
            :default-active="activeIndex"
            mode="horizontal"
            @select="handleSelect"
            class="nav-menu"
          >
            <el-menu-item index="/">首页</el-menu-item>
            <el-menu-item index="/products">产品中心</el-menu-item>
            <el-menu-item index="/solutions">解决方案</el-menu-item>
            <el-menu-item index="/news">新闻中心</el-menu-item>
            <el-menu-item index="/about">关于我们</el-menu-item>
          </el-menu>
        </nav>
        <div class="header-actions">
          <el-button type="primary" @click="contactUs">
            <el-icon><Phone /></el-icon>
            联系我们
          </el-button>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

export default {
  name: 'Header',
  setup() {
    const router = useRouter()
    const route = useRoute()
    
    const activeIndex = computed(() => route.path)
    
    const handleSelect = (index) => {
      router.push(index)
    }
    
    const contactUs = () => {
      // 可以添加联系我们的逻辑
      console.log('联系我们')
    }
    
    return {
      activeIndex,
      handleSelect,
      contactUs
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../assets/styles/main.scss';
.header {
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  
  .header-content {
    @include flex-between;
    height: 70px;
  }
  
  .logo {
    h1 {
      color: $primary-color;
      font-size: 24px;
      font-weight: bold;
      margin: 0;
    }
  }
  
  .nav {
    flex: 1;
    display: flex;
    justify-content: center;
    
    .nav-menu {
      border: none;
      
      .el-menu-item {
        font-size: 14px;
        font-weight: 500;
        border-bottom: 2px solid transparent;
        
        &:hover {
          color: $primary-color;
          background: transparent;
        }
        
        &.is-active {
          color: $primary-color;
          border-bottom-color: $primary-color;
          background: transparent;
        }
      }
    }
  }
  
  .header-actions {
    .el-button {
      border-radius: 25px;
      padding: 10px 20px;
    }
  }
}

@media (max-width: 768px) {
  .header {
    .header-content {
      flex-direction: column;
      height: auto;
      padding: 10px 0;
    }
    
    .nav {
      margin: 10px 0;
    }
  }
}
</style>
