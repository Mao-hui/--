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
                :class="['menu-item', { active: activeCategory === 'all' }]"
                @click="setActiveCategory('all')"
              >
                <el-icon><component :is="'Box'" /></el-icon>
                <span>全部产品</span>
              </div>
              <div
                class="menu-group"
                v-for="group in categoryGroups"
                :key="group.key"
              >
                <div class="group-title">{{ group.name }}</div>
                <div
                  v-for="child in group.children"
                  :key="child.key"
                  :class="['menu-item', { active: activeCategory === child.key }]"
                  @click="setActiveCategory(child.key)"
                >
                  <el-icon><component :is="child.icon || 'Collection'" /></el-icon>
                  <span>{{ child.name }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 右侧内容 -->
          <div class="products-main">
            <div class="category-content">
              <h2>{{ getCurrentCategory().name }}</h2>
              <div v-if="loading" class="loading">加载中...</div>
              <div v-else>
                <div v-if="error" class="error">{{ error }}</div>
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
                    <el-button type="primary" size="small" class="product-btn" @click="openDetail(product)">
                      了解详情
                    </el-button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <el-dialog v-model="dialogVisible" :title="currentProduct && currentProduct.name" width="720px">
      <div class="rich-content" v-html="currentProduct && currentProduct.rawDescription"></div>
    </el-dialog>

    <Footer />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import Header from '../components/Header.vue'
import Footer from '../components/Footer.vue'
import { apiGetProduct } from '@/api'

export default {
  name: 'Products',
  components: {
    Header,
    Footer
  },
  setup() {
    const activeCategory = ref('all')
    const loading = ref(false)
    const error = ref('')
    const categoryGroups = ref([]) // [{ key, name, children: [{key,name}] }]
    const products = ref({ all: [] })
    const dialogVisible = ref(false)
    const currentProduct = ref(null)
    
    const stripHtml = (html) => {
      if (!html) return ''
      return String(html).replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim()
    }
    
    const loadProducts = async () => {
      loading.value = true
      error.value = ''
      try {
        const res = await apiGetProduct()
        if (res && res.code === 200 && Array.isArray(res.data)) {
          // 构建分组与产品映射
          const bigMap = new Map()
          const smallMap = new Map()
          const allList = []
          res.data.forEach((item, idx) => {
            const bigKey = `big-${item.bigIndustryId}`
            const smallKey = `small-${item.smallIndustryId}`
            if (!bigMap.has(bigKey)) {
              bigMap.set(bigKey, { key: bigKey, name: item.bigIndustryName, children: [] })
            }
            if (!smallMap.has(smallKey)) {
              smallMap.set(smallKey, { key: smallKey, name: item.smallIndustryName, icon: 'Collection' })
              bigMap.get(bigKey).children.push(smallMap.get(smallKey))
            }
            const product = {
              id: item.productId || idx,
              name: item.productName || '产品',
              icon: 'Box',
              description: stripHtml(item.description) || '—',
              rawDescription: item.description || '',
              tags: [item.bigIndustryName, item.smallIndustryName],
              smallKey
            }
            allList.push(product)
            if (!products.value[smallKey]) products.value[smallKey] = []
            products.value[smallKey].push(product)
          })
          products.value.all = allList
          categoryGroups.value = Array.from(bigMap.values())
        } else {
          error.value = (res && (res.msg || res.message)) || '加载失败'
        }
      } catch (e) {
        error.value = '加载失败，请稍后重试'
      } finally {
        loading.value = false
      }
    }
    
    const setActiveCategory = (categoryKey) => {
      activeCategory.value = categoryKey
    }
    
    const getCurrentCategory = () => {
      if (activeCategory.value === 'all') return { key: 'all', name: '全部产品' }
      for (const g of categoryGroups.value) {
        const f = g.children.find(c => c.key === activeCategory.value)
        if (f) return f
      }
      return { key: 'all', name: '全部产品' }
    }
    
    const getCurrentProducts = () => {
      return products.value[activeCategory.value] || []
    }
    
    const openDetail = (product) => {
      currentProduct.value = product
      dialogVisible.value = true
    }
    
    onMounted(() => {
      loadProducts()
    })
    
    return {
      activeCategory,
      categoryGroups,
      products,
      loading,
      error,
      setActiveCategory,
      getCurrentCategory,
      getCurrentProducts,
      dialogVisible,
      currentProduct,
      openDetail
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
    .menu-group {
      .group-title {
        font-size: 14px;
        color: $text-color-secondary;
        padding: 10px 20px 5px;
      }
    }
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

.loading, .error {
  padding: 20px 0;
  color: $text-color-regular;
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
