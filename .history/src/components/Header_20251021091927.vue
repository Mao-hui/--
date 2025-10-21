<template>
  <header class="header">
    <div class="container">
      <div class="header-content">
        <div class="logo">
          <h1>向量科技</h1>
        </div>
        <nav class="nav">
          <div class="nav-menu">
            <div 
              v-for="item in menuItems" 
              :key="item.path"
              :class="['nav-item', { active: activeIndex === item.path }]"
              @click="handleSelect(item.path)"
            >
              {{ item.name }}
            </div>
          </div>
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
    
    const menuItems = ref([
      { name: '首页', path: '/' },
      { name: '产品中心', path: '/products' },
      { name: '解决方案', path: '/solutions' },
      { name: '新闻中心', path: '/news' },
      { name: '关于我们', path: '/about' }
    ])
    
    const activeIndex = computed(() => route.path)
    
    const handleSelect = (path) => {
      router.push(path)
    }
    
    const contactUs = () => {
      // 可以添加联系我们的逻辑
      console.log('联系我们')
    }
    
    return {
      menuItems,
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
      display: flex;
      flex-wrap: nowrap;
      
      .el-menu-item {
        font-size: 15px;
        font-weight: 500;
        border-bottom: 2px solid transparent;
        white-space: nowrap;
        flex-shrink: 0;
        
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
      width: 100%;
      
      .nav-menu {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        
        .el-menu-item {
          font-size: 14px;
          padding: 8px 12px;
          margin: 0 2px;
        }
      }
    }
    
    .header-actions {
      margin-top: 10px;
      
      .el-button {
        font-size: 14px;
        padding: 8px 16px;
      }
    }
  }
}

@media (max-width: 480px) {
  .header {
    .nav {
      .nav-menu {
        .el-menu-item {
          font-size: 12px;
          padding: 6px 8px;
          margin: 0 1px;
        }
      }
    }
  }
}
</style>
