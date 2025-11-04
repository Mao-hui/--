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
                <span class="item-count" v-if="products.all && products.all.length">
                  {{ products.all.length }}
                </span>
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
                <span class="item-count" v-if="products[child.key] && products[child.key].length">
                  {{ products[child.key].length }}
                </span>
              </div>
              </div>
            </div>
          </div>
          
          <!-- 右侧内容 -->
          <div class="products-main">
            <div class="category-content">
              <div class="category-header">
                <h2>{{ getCurrentCategory().name }}</h2>
                <div class="product-count" v-if="!loading && !error">
                  共 {{ getCurrentProducts().length }} 个产品
                </div>
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
                      <div class="product-icon">
                        <el-icon :size="40">
                          <component :is="product.icon" />
                        </el-icon>
                      </div>
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
    </div>
    
    <el-dialog v-model="dialogVisible" :title="currentProduct && currentProduct.name" width="800px">
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
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import Header from '../components/Header.vue'
import Footer from '../components/Footer.vue'
import { apiGetProduct, apiGetProductDetail } from '@/api'

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
    const detailLoading = ref(false)
    
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
      if (activeCategory.value === categoryKey) return
      activeCategory.value = categoryKey
      // 滚动到顶部
      const mainContent = document.querySelector('.products-main')
      if (mainContent) {
        mainContent.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
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
    
    const openDetail = async (product) => {
      if (!product || !product.id) {
        ElMessage.error('产品信息不完整')
        return
      }
      
      dialogVisible.value = true
      detailLoading.value = true
      currentProduct.value = null
      
      try {
        const res = await apiGetProductDetail({ productId: product.id })
        if (res && res.code === 200 && res.data) {
          const data = res.data
          currentProduct.value = {
            id: data.productId || product.id,
            name: data.productName || product.name || '产品详情',
            tags: product.tags || [],
            content: data.description || data.content || product.description || '暂无描述'
          }
        } else {
          // 如果接口失败，使用列表中的已有数据
          currentProduct.value = {
            ...product,
            content: product.description || product.rawDescription || '暂无描述'
          }
          ElMessage.warning((res && (res.msg || res.message)) || '获取详情失败，显示基本信息')
        }
      } catch (e) {
        // 出错时使用列表中的已有数据
        currentProduct.value = {
          ...product,
          content: product.description || product.rawDescription || '暂无描述'
        }
        ElMessage.warning('加载详情失败，显示基本信息')
      } finally {
        detailLoading.value = false
      }
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
  position: sticky;
  top: 90px;
  
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
        flex: 1;
      }
      
      .item-count {
        font-size: 12px;
        background: rgba(255, 255, 255, 0.3);
        padding: 2px 8px;
        border-radius: 10px;
        min-width: 20px;
        text-align: center;
        margin-left: auto;
      }
      
      &.active .item-count {
        background: rgba(255, 255, 255, 0.4);
      }
    }
  }
}

.products-main {
  .category-content {
    .category-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      
      h2 {
        font-size: 32px;
        color: $text-color-primary;
        margin: 0;
      }
      
      .product-count {
        font-size: 14px;
        color: $text-color-secondary;
        padding: 6px 12px;
        background: $background-color-light;
        border-radius: 16px;
      }
    }
    
    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 24px;
    }
    
    .product-card {
      padding: 20px 20px 16px;
      display: flex;
      flex-direction: column;
      transition: all 0.3s ease;
      border: 1px solid $border-color-lighter;
      
      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(0,0,0,.08);
      }
      
      .product-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 12px;
      }
      .product-icon { 
        width: 44px; height: 44px; border-radius: 12px; background: rgba($primary-color, .08); @include flex-center;
        .el-icon { color: $primary-color; }
      }
      
      .product-title { font-size: 18px; color: $text-color-primary; font-weight: 600; }
      
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
      border-radius: 8px;
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

/* 弹窗富文本区域优化 */
::v-deep(.el-dialog__body) {
  .rich-content img { max-width: 100%; display: block; margin: 12px 0; border-radius: 6px; }
  .rich-content { max-height: 60vh; overflow: auto; line-height: 1.75; }
}
</style>
