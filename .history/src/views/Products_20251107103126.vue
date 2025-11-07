<template>
  <div class="products">
    <Header />
    
    <!-- Banner区域 -->
    <div class="banner-section" :style="bannerStyle">
      <div class="banner-content">
        <div class="banner-overlay">
          <h1 class="banner-title">产品中心</h1>
          <p class="banner-subtitle">赋能行业数字化升级</p>
        </div>
      </div>
    </div>
    
    <div class="products-content">
      <div class="container">
        <!-- 产品内容 -->
        <div class="products-main">
            <!-- 分类网格 -->
            <div class="category-grid-wrapper">
              <div class="category-grid">
                <div 
                  v-for="category in getAllCategories()" 
                  :key="category.key"
                  :class="['category-item', { active: activeCategory === category.key }]"
                  @click="setActiveCategory(category.key)"
                >
                  {{ category.name }}
                </div>
              </div>
            </div>
            
            <div class="category-content">
              <div class="category-header">
                <h2>{{ getCurrentCategory().name }}</h2>
              </div>
              <div v-if="loading" class="loading">
                <el-skeleton animated :count="6">
                  <template #template>
                    <div class="product-card card">
                      <el-skeleton-item variant="rect" style="width: 44px; height: 44px; border-radius: 12px;" />
                      <div style="flex: 1; padding: 0 12px">
                        <el-skeleton-item variant="h3" style="width: 60%; margin-bottom: 12px;" />
                        <el-skeleton-item variant="text" style="width: 90%;" />
                        <el-skeleton-item variant="text" style="width: 80%;" />
                      </div>
                    </div>
                  </template>
                </el-skeleton>
              </div>
              <div v-else>
                <div v-if="error" class="error">{{ error }}</div>
                <el-empty v-else-if="!getCurrentProducts().length" description="该分类下暂无产品" />
                <div v-else class="products-grid">
                  <div 
                    v-for="product in getCurrentProducts()" 
                    :key="product.id"
                    class="product-card card"
                  >
                    <div class="product-header">
                      <h3 class="product-title">{{ product.name }}</h3>
                    </div>
                    <p class="product-desc">{{ product.description }}</p>
                    <div class="product-tags">
                      <el-tag 
                        v-for="tag in product.tags" 
                        :key="tag" 
                        size="small"
                        effect="light"
                      >
                        {{ tag }}
                      </el-tag>
                    </div>
                    <div class="product-footer">
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
    
    <el-dialog v-model="dialogVisible" :title="currentProduct && currentProduct.name" width="1200px">
      <div class="product-detail" v-loading="detailLoading">
        <div class="product-meta" v-if="currentProduct">
          <div class="meta-item" v-if="currentProduct.tags && currentProduct.tags.length">
            <span class="meta-label">分类：</span>
            <el-tag 
              v-for="tag in currentProduct.tags" 
              :key="tag" 
              size="small"
              style="margin-right: 8px;"
            >
              {{ tag }}
            </el-tag>
          </div>
        </div>
        <div class="rich-content" v-html="currentProduct && currentProduct.content"></div>
      </div>
    </el-dialog>

    <Footer />
  </div>
</template>

<script>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import Header from '../components/Header.vue'
import Footer from '../components/Footer.vue'
import { apiGetProduct, apiGetProductDetail } from '@/api'
import prod1Image from '@/assets/image/prod1.png'

export default {
  name: 'Products',
  components: {
    Header,
    Footer
  },
  setup() {
    const route = useRoute()
    const activeCategory = ref('all')
    const loading = ref(false)
    const error = ref('')
    const categoryGroups = ref([]) // [{ key, name, children: [{key,name}] }]
    const products = ref({ all: [] })
    const dialogVisible = ref(false)
    const currentProduct = ref(null)
    const detailLoading = ref(false)
    
    const stripHtml = (html) => {
      if (!html) return ''
      return String(html).replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim()
    }
    
    const bannerStyle = computed(() => {
      // 使用本地图片
      return {
        backgroundImage: `url('${prod1Image}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }
    })
    
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
          
          // 从URL参数中读取category并设置激活分类
          const queryCategory = route.query.category
          if (queryCategory && products.value[queryCategory]) {
            activeCategory.value = queryCategory
          }
          
          // 如果URL中有productId，自动打开详情对话框
          const queryProductId = route.query.productId
          if (queryProductId) {
            // 在所有产品中查找对应的产品
            const allProducts = products.value.all || []
            const foundProduct = allProducts.find(p => String(p.id) === String(queryProductId))
            if (foundProduct) {
              // 延迟打开，确保数据已加载完成
              setTimeout(() => {
                openDetail(foundProduct)
              }, 300)
            }
          }
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
      if (activeCategory.value === categoryKey) return
      activeCategory.value = categoryKey
      // 滚动到顶部
      const mainContent = document.querySelector('.products-main')
      if (mainContent) {
        mainContent.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
    
    // 获取所有分类（小分类）
    const getAllCategories = () => {
      const allCategories = [{ key: 'all', name: '全部产品' }]
      categoryGroups.value.forEach(group => {
        group.children.forEach(child => {
          allCategories.push(child)
        })
      })
      return allCategories
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
      if (!product || !product.id) {
        ElMessage.error('产品信息不完整')
        return
      }
      
      // 通过路由跳转到产品详情页
      router.push({
        path: '/product-detail',
        query: {
          productId: product.id,
          category: product.smallKey
        }
      })
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
      bannerStyle,
      setActiveCategory,
      getCurrentCategory,
      getCurrentProducts,
      getAllCategories,
      dialogVisible,
      currentProduct,
      detailLoading,
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

.banner-section {
  position: relative;
  overflow: hidden;
  height: 450px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.2) 100%);
    z-index: 1;
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 100px;
    background: linear-gradient(to top, rgba(250, 250, 250, 0.3), transparent);
    z-index: 2;
  }
  
  .banner-content {
    position: relative;
    z-index: 2;
    width: 100%;
    max-width: 1600px;
    margin: 0 auto;
    padding: 0 40px;
  }
  
  .banner-overlay {
    padding: 0 20px;
    text-align: center;
  }
  
  .banner-title {
    font-size: 52px;
    font-weight: bold;
    color: white;
    margin-bottom: 20px;
    text-shadow: 0 4px 20px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(64, 158, 255, 0.3);
    line-height: 1.2;
    letter-spacing: 1px;
    animation: fadeInUp 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .banner-subtitle {
    font-size: 22px;
    color: white;
    opacity: 0.95;
    text-shadow: 0 2px 12px rgba(0, 0, 0, 0.4);
    line-height: 1.5;
    letter-spacing: 0.5px;
    animation: fadeInUp 0.8s 0.2s cubic-bezier(0.4, 0, 0.2, 1) backwards;
  }
  
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
}

.products-content {
  padding: 80px 0;
  background: linear-gradient(180deg, $background-color-light 0%, #ffffff 50%, $background-color-light 100%);
  min-height: 600px;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 300px;
    background: radial-gradient(ellipse at top, rgba(64, 158, 255, 0.05) 0%, transparent 70%);
    pointer-events: none;
  }
}

.products-main {
  // 分类网格样式
  .category-grid-wrapper {
    margin-bottom: 50px;
    position: relative;
    z-index: 1;
    
    .category-grid {
      display: grid;
      grid-template-columns: repeat(8, 1fr);
      gap: 0;
      border: 1px solid rgba(64, 158, 255, 0.15);
      border-radius: 12px;
      overflow: hidden;
      background: white;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
      
      .category-item {
        padding: 14px 20px;
        text-align: center;
        font-size: 15px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        background: white;
        color: $text-color-regular;
        border-right: 1px solid $border-color-base;
        border-bottom: 1px solid $border-color-base;
        position: relative;
        line-height: 1.5;
        white-space: nowrap;
        
        // 去除每行最后一列的右边框
        &:nth-child(8n) {
          border-right: none;
        }
        
        &:hover:not(.active) {
          background: rgba(64, 158, 255, 0.08);
          color: $primary-color;
        }
        
        &.active {
          background: $primary-color;
          color: white;
          font-weight: 600;
        }
      }
    }
  }
  
  .category-content {
    .category-header {
      margin-bottom: 30px;
      
      h2 {
        font-size: 32px;
        color: $text-color-primary;
        margin: 0;
      }
      
    }
    
    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 24px;
      animation: fadeIn 0.3s ease;
    }
    
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .product-card {
      padding: 24px 24px 20px;
      display: flex;
      flex-direction: column;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      border: 1px solid rgba(64, 158, 255, 0.12);
      cursor: pointer;
      border-radius: 12px;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 1) 100%);
      position: relative;
      overflow: hidden;
      
      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: linear-gradient(90deg, $primary-color, $primary-light);
        transform: scaleX(0);
        transform-origin: left;
        transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      }
      
      &:hover {
        transform: translateY(-6px) scale(1.01);
        box-shadow: 0 12px 32px rgba(64, 158, 255, 0.15);
        border-color: rgba($primary-color, 0.4);
        
        &::before {
          transform: scaleX(1);
        }
        
        .product-title {
          color: $primary-color;
        }
      }
      
      .product-header {
        margin-bottom: 12px;
      }
      
      .product-title { 
        font-size: 18px; 
        color: $text-color-primary; 
        font-weight: 600; 
        margin: 0;
        text-align: left;
      }
      
      .product-desc { color: $text-color-regular; line-height: 1.7; margin-bottom: 14px; font-size: 14px; display: -webkit-box; -webkit-line-clamp: 3; line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
      
      .product-tags {
        margin-bottom: 12px;
        
        .el-tag {
          margin: 0 6px 6px 0;
          border-color: $border-color-lighter;
        }
      }
      
      .product-footer { margin-top: auto; display: flex; justify-content: flex-end; }
      .product-btn { border-radius: 18px; padding: 6px 14px; }
    }
  }
}

.loading {
  padding: 20px 0;
  
  :deep(.el-skeleton) {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 24px;
    
    .el-skeleton__item {
      padding: 20px;
      display: flex;
      align-items: flex-start;
      gap: 12px;
    }
  }
}

.error {
  padding: 20px 0;
  color: $danger-color;
  text-align: center;
  background: rgba($danger-color, 0.1);
  border-radius: 8px;
  margin: 20px 0;
}

.product-detail {
  .product-meta {
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid $border-color-lighter;
    
    .meta-item {
      display: flex;
      align-items: center;
      margin-bottom: 10px;
      
      .meta-label {
        color: $text-color-regular;
        font-weight: 500;
        margin-right: 8px;
        min-width: 60px;
      }
    }
  }
  
  .rich-content {
    font-size: 15px;
    line-height: 1.8;
    color: $text-color-primary;
    
    :deep(img) {
      max-width: 100%;
      height: auto;
      margin: 20px 0;
      display: block;
    }
    
    :deep(p) {
      margin-bottom: 16px;
      text-align: justify;
      
      &:last-child {
        margin-bottom: 0;
      }
    }
    
    :deep(h1), :deep(h2), :deep(h3), :deep(h4) {
      margin: 20px 0 15px;
      color: $text-color-primary;
    }
    
    :deep(ul), :deep(ol) {
      margin: 16px 0;
      padding-left: 24px;
    }
    
    :deep(li) {
      margin-bottom: 8px;
    }
  }
}

@media (max-width: 1400px) {
  .banner-section {
    height: 450px;
    
    .banner-content {
      padding: 0 30px;
    }
    
    .banner-title {
      font-size: 42px;
    }
    
    .banner-subtitle {
      font-size: 18px;
    }
  }
}

@media (max-width: 768px) {
  
  .banner-section {
    height: 350px;
    
    .banner-content {
      padding: 0 20px;
    }
    
    .banner-title {
      font-size: 32px;
      margin-bottom: 15px;
    }
    
    .banner-subtitle {
      font-size: 16px;
    }
  }
}

/* 弹窗富文本区域优化 */
::v-deep(.el-dialog__body) {
  .rich-content img { max-width: 100%; display: block; margin: 12px 0; }
  .rich-content { max-height: 60vh; overflow: auto; line-height: 1.75; }
}
</style>
