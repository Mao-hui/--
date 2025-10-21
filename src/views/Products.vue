<template>
  <div class="products">
    <Header />
    
    <div class="page-header">
      <div class="container">
        <h1>产品中心</h1>
        <p>专业的技术解决方案，助力企业数字化转型</p>
      </div>
    </div>
    
    <div class="products-content">
      <div class="container">
        <div class="products-layout">
          <!-- 左侧导航 -->
          <div class="products-sidebar">
            <div class="sidebar-title">产品分类</div>
            <div class="sidebar-menu">
              <div 
                v-for="category in categories" 
                :key="category.key"
                :class="['menu-item', { active: activeCategory === category.key }]"
                @click="setActiveCategory(category.key)"
              >
                <el-icon><component :is="category.icon" /></el-icon>
                <span>{{ category.name }}</span>
              </div>
            </div>
          </div>
          
          <!-- 右侧内容 -->
          <div class="products-main">
            <div class="category-content">
              <h2>{{ getCurrentCategory().name }}</h2>
              <div class="products-grid">
                <div 
                  v-for="product in getCurrentProducts()" 
                  :key="product.id"
                  class="product-card card"
                >
                  <div class="product-icon">
                    <el-icon :size="40">
                      <component :is="product.icon" />
                    </el-icon>
                  </div>
                  <h3>{{ product.name }}</h3>
                  <p>{{ product.description }}</p>
                  <div class="product-tags">
                    <el-tag 
                      v-for="tag in product.tags" 
                      :key="tag" 
                      size="small"
                      type="info"
                    >
                      {{ tag }}
                    </el-tag>
                  </div>
                  <el-button type="primary" size="small" class="product-btn">
                    了解详情
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <Footer />
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import Header from '../components/Header.vue'
import Footer from '../components/Footer.vue'

export default {
  name: 'Products',
  components: {
    Header,
    Footer
  },
  setup() {
    const activeCategory = ref('service')
    
    const categories = ref([
      {
        key: 'service',
        name: '服务快消',
        icon: 'ShoppingCart'
      },
      {
        key: 'manufacturing',
        name: '工厂制造',
        icon: 'Setting'
      }
    ])
    
    const products = ref({
      service: [
        {
          id: 1,
          name: '电商平台',
          icon: 'Shop',
          description: '专业的电商解决方案，支持多种商业模式',
          tags: ['B2C', 'B2B2C', 'O2O', '跨境电商']
        },
        {
          id: 2,
          name: '外卖点餐系统',
          icon: 'Food',
          description: '完整的外卖点餐解决方案，支持多平台对接',
          tags: ['美团', '饿了么', '蜂鸟众包', '自营平台']
        },
        {
          id: 3,
          name: '会员管理系统',
          icon: 'User',
          description: '智能会员管理，提升客户粘性和复购率',
          tags: ['积分系统', '等级管理', '营销工具', '数据分析']
        },
        {
          id: 4,
          name: '支付系统',
          icon: 'CreditCard',
          description: '安全可靠的支付解决方案，支持多种支付方式',
          tags: ['微信支付', '支付宝', '银联', '数字货币']
        }
      ],
      manufacturing: [
        {
          id: 5,
          name: 'MES生产管理系统',
          icon: 'Monitor',
          description: '制造执行系统，实现生产过程的数字化管理',
          tags: ['生产计划', '工艺管理', '质量控制', '设备监控']
        },
        {
          id: 6,
          name: 'WMS仓储管理系统',
          icon: 'Box',
          description: '智能仓储管理，提升库存周转效率',
          tags: ['入库管理', '出库管理', '库存盘点', '智能补货']
        },
        {
          id: 7,
          name: '设备监控系统',
          icon: 'Warning',
          description: '实时设备状态监控，预防性维护管理',
          tags: ['实时监控', '故障预警', '维护计划', '数据分析']
        },
        {
          id: 8,
          name: '质量管理系统',
          icon: 'Check',
          description: '全流程质量管理，确保产品质量标准',
          tags: ['检验标准', '不良品管理', '质量追溯', '统计分析']
        }
      ]
    })
    
    const setActiveCategory = (categoryKey) => {
      activeCategory.value = categoryKey
    }
    
    const getCurrentCategory = () => {
      return categories.value.find(cat => cat.key === activeCategory.value)
    }
    
    const getCurrentProducts = () => {
      return products.value[activeCategory.value] || []
    }
    
    return {
      activeCategory,
      categories,
      products,
      setActiveCategory,
      getCurrentCategory,
      getCurrentProducts
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../assets/styles/main.scss';
.products {
  padding-top: 70px;
}

.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 80px 0;
  text-align: center;
  
  h1 {
    font-size: 48px;
    font-weight: bold;
    margin-bottom: 20px;
  }
  
  p {
    font-size: 20px;
    opacity: 0.9;
  }
}

.products-content {
  padding: 60px 0;
  background: $background-color-light;
  min-height: 600px;
}

.products-layout {
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 40px;
}

.products-sidebar {
  background: white;
  border-radius: 8px;
  padding: 30px 0;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  height: fit-content;
  
  .sidebar-title {
    font-size: 18px;
    font-weight: bold;
    color: $text-color-primary;
    padding: 0 20px 20px;
    border-bottom: 1px solid $border-color-lighter;
    margin-bottom: 20px;
  }
  
  .sidebar-menu {
    .menu-item {
      @include flex-center;
      gap: 10px;
      padding: 15px 20px;
      cursor: pointer;
      transition: all 0.3s ease;
      color: $text-color-regular;
      
      &:hover {
        background: $background-color-light;
        color: $primary-color;
      }
      
      &.active {
        background: $primary-color;
        color: white;
      }
      
      .el-icon {
        font-size: 18px;
      }
      
      span {
        font-size: 16px;
        font-weight: 500;
      }
    }
  }
}

.products-main {
  .category-content {
    h2 {
      font-size: 32px;
      color: $text-color-primary;
      margin-bottom: 30px;
    }
    
    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 25px;
    }
    
    .product-card {
      padding: 30px 20px;
      text-align: center;
      transition: all 0.3s ease;
      
      &:hover {
        transform: translateY(-5px);
      }
      
      .product-icon {
        margin-bottom: 20px;
        
        .el-icon {
          color: $primary-color;
        }
      }
      
      h3 {
        font-size: 20px;
        color: $text-color-primary;
        margin-bottom: 15px;
      }
      
      p {
        color: $text-color-regular;
        line-height: 1.6;
        margin-bottom: 20px;
        font-size: 14px;
      }
      
      .product-tags {
        margin-bottom: 20px;
        
        .el-tag {
          margin: 0 5px 5px 0;
        }
      }
      
      .product-btn {
        width: 100%;
        border-radius: 20px;
      }
    }
  }
}

@media (max-width: 768px) {
  .products-layout {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .products-sidebar {
    .sidebar-menu {
      display: flex;
      overflow-x: auto;
      
      .menu-item {
        white-space: nowrap;
        flex-shrink: 0;
      }
    }
  }
  
  .page-header {
    padding: 60px 0;
    
    h1 {
      font-size: 32px;
    }
    
    p {
      font-size: 16px;
    }
  }
}
</style>
