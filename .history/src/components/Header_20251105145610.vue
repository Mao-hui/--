<template>
  <header class="header">
    <div class="container">
      <div class="header-content">
        <div class="logo">
          <img src="@/assets/image/logo.png" alt="向量科技" />
          <span class="logo-title">向量科技</span>
        </div>
        <nav class="nav">
          <div class="nav-menu">
            <div 
              v-for="item in menuItems" 
              :key="item.path"
              :class="['nav-item', { active: activeIndex === item.path }]"
              @mouseenter="handleMouseEnter(item)"
              @mouseleave="handleMouseLeave(item)"
              @click="handleSelect(item.path)"
            >
              {{ item.name }}
              <!-- 下拉菜单 -->
              <div 
                v-if="item.hasDropdown && showDropdown === item.path"
                class="dropdown-menu"
                @mouseenter="handleDropdownEnter"
                @mouseleave="handleDropdownLeave"
              >
                <div class="dropdown-content">
                  <!-- 左侧分类列表 -->
                  <div class="dropdown-left">
                    <div 
                      v-for="category in getDropdownCategories(item.path)"
                      :key="category.key"
                      :class="['category-item', { active: selectedCategory === category.key }]"
                      @mouseenter="selectCategory(category.key, item.path)"
                    >
                      <span class="category-name">{{ category.name }}</span>
                      <el-icon v-if="selectedCategory === category.key" class="arrow-icon">
                        <ArrowRight />
                      </el-icon>
                    </div>
                  </div>
                  <!-- 右侧详细列表 -->
                  <div class="dropdown-right">
                    <div v-if="selectedCategory" class="right-content">
                      <div class="right-header">
                        <h3>{{ getSelectedCategoryName() }}</h3>
                        <span class="link-text" @click="goToPage(item.path)">查看全部</span>
                      </div>
                      <div class="right-list">
                        <div 
                          v-for="detail in getDropdownDetails(selectedCategory, item.path)"
                          :key="detail.id"
                          class="detail-item"
                          @click="goToDetail(item.path, detail)"
                        >
                          <div class="detail-name">{{ detail.name }}</div>
                          <div class="detail-desc">{{ detail.description }}</div>
                        </div>
                      </div>
                    </div>
                    <div v-else class="right-empty">
                      <p>请选择分类</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </nav>
        <!-- <div class="header-actions">
          <el-button type="primary" @click="contactUs">
            <el-icon><Phone /></el-icon>
            联系我们
          </el-button>
        </div> -->
      </div>
    </div>
  </header>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowRight } from '@element-plus/icons-vue'
import { apiGetProduct, apiGetScheme } from '@/api'

export default {
  name: 'Header',
  setup() {
    const router = useRouter()
    const route = useRoute()
    
    const menuItems = ref([
      { name: '首页', path: '/', hasDropdown: false },
      { name: '产品中心', path: '/products', hasDropdown: true },
      { name: '解决方案', path: '/solutions', hasDropdown: true },
      { name: '新闻中心', path: '/news', hasDropdown: false },
      { name: '关于我们', path: '/about', hasDropdown: false }
    ])
    
    const showDropdown = ref('')
    const selectedCategory = ref('')
    const productsData = ref({ categories: [], details: {} })
    const solutionsData = ref({ categories: [], details: {} })
    
    const activeIndex = computed(() => route.path)
    
    const stripHtml = (html) => {
      if (!html) return ''
      return String(html).replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim()
    }
    
    // 加载产品数据
    const loadProducts = async () => {
      try {
        const res = await apiGetProduct()
        if (res && res.code === 200 && Array.isArray(res.data)) {
          const bigMap = new Map()
          const detailsMap = {}
          
          res.data.forEach((item) => {
            const bigKey = `big-${item.bigIndustryId}`
            const smallKey = `small-${item.smallIndustryId}`
            
            if (!bigMap.has(bigKey)) {
              bigMap.set(bigKey, { 
                key: bigKey, 
                name: item.bigIndustryName,
                bigIndustryId: item.bigIndustryId
              })
              detailsMap[bigKey] = []
            }
            
            detailsMap[bigKey].push({
              id: item.productId,
              name: item.productName || '产品',
              description: stripHtml(item.description) || '—',
              smallKey,
              smallIndustryName: item.smallIndustryName,
              bigIndustryId: item.bigIndustryId
            })
          })
          
          productsData.value = {
            categories: Array.from(bigMap.values()),
            details: detailsMap
          }
        }
      } catch (e) {
        console.error('加载产品数据失败:', e)
      }
    }
    
    // 加载解决方案数据
    const loadSolutions = async () => {
      try {
        const res = await apiGetScheme()
        if (res && res.code === 200 && Array.isArray(res.data)) {
          const bigMap = new Map()
          const detailsMap = {}
          
          res.data.forEach((item) => {
            const bigKey = `big-${item.bigIndustryId}`
            
            if (!bigMap.has(bigKey)) {
              bigMap.set(bigKey, { 
                key: bigKey, 
                name: item.bigIndustryName,
                bigIndustryId: item.bigIndustryId
              })
              detailsMap[bigKey] = []
            }
            
            detailsMap[bigKey].push({
              id: item.schemeId,
              name: item.schemeName || '方案',
              description: stripHtml(item.description) || '—',
              bigIndustryId: item.bigIndustryId,
              smallIndustryName: item.smallIndustryName
            })
          })
          
          solutionsData.value = {
            categories: Array.from(bigMap.values()),
            details: detailsMap
          }
        }
      } catch (e) {
        console.error('加载解决方案数据失败:', e)
      }
    }
    
    const handleMouseEnter = (item) => {
      if (item.hasDropdown) {
        showDropdown.value = item.path
        // 自动选择第一个分类
        const categories = getDropdownCategories(item.path)
        if (categories.length > 0) {
          // 如果当前选中的分类不在当前菜单的分类列表中，则选择第一个
          const currentCategory = categories.find(c => c.key === selectedCategory.value)
          if (!currentCategory) {
            selectedCategory.value = categories[0].key
          }
        }
      }
    }
    
    const handleMouseLeave = (item) => {
      // 延迟隐藏，以便用户能移动到下拉菜单
      setTimeout(() => {
        if (showDropdown.value === item.path) {
          showDropdown.value = ''
          selectedCategory.value = ''
        }
      }, 200)
    }
    
    const handleDropdownEnter = () => {
      // 鼠标进入下拉菜单时不清空
    }
    
    const handleDropdownLeave = () => {
      showDropdown.value = ''
      selectedCategory.value = ''
    }
    
    const getDropdownCategories = (path) => {
      if (path === '/products') {
        return productsData.value.categories
      } else if (path === '/solutions') {
        return solutionsData.value.categories
      }
      return []
    }
    
    const selectCategory = (categoryKey, path) => {
      selectedCategory.value = categoryKey
    }
    
    const getSelectedCategoryName = () => {
      const category = productsData.value.categories.find(c => c.key === selectedCategory.value) ||
                      solutionsData.value.categories.find(c => c.key === selectedCategory.value)
      return category ? category.name : ''
    }
    
    const getDropdownDetails = (categoryKey, path) => {
      if (path === '/products') {
        return productsData.value.details[categoryKey] || []
      } else if (path === '/solutions') {
        return solutionsData.value.details[categoryKey] || []
      }
      return []
    }
    
    const goToPage = (path) => {
      router.push(path)
      showDropdown.value = ''
      selectedCategory.value = ''
    }
    
    const goToDetail = (path, detail) => {
      if (path === '/products') {
        router.push({
          path: '/products',
          query: {
            category: detail.smallKey,
            productId: detail.id
          }
        })
      } else if (path === '/solutions') {
        router.push({
          path: '/solutions',
          query: {
            bigIndustryId: detail.bigIndustryId,
            schemeId: detail.id
          }
        })
      }
      showDropdown.value = ''
      selectedCategory.value = ''
    }
    
    const handleSelect = (path) => {
      const item = menuItems.value.find(m => m.path === path)
      if (!item || !item.hasDropdown) {
        router.push(path)
      }
    }
    
    const contactUs = () => {
      console.log('联系我们')
    }
    
    onMounted(() => {
      loadProducts()
      loadSolutions()
    })
    
    return {
      menuItems,
      activeIndex,
      showDropdown,
      selectedCategory,
      handleSelect,
      handleMouseEnter,
      handleMouseLeave,
      handleDropdownEnter,
      handleDropdownLeave,
      getDropdownCategories,
      selectCategory,
      getSelectedCategoryName,
      getDropdownDetails,
      goToPage,
      goToDetail,
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
  
  // .logo {
  //   display: flex;
  //   align-items: center;
  //   img { height: 36px; display: block; }
  // }
  .logo {
  display: flex;
  align-items: center;
  gap: 12px;
  img { height: 36px; display: block; }
  .logo-title {
    color: $primary-color;
    font-size: 22px;
    font-weight: bold;
    letter-spacing: 2px;
    line-height: 1;
  }
}
  
  .nav {
    flex: 1;
    display: flex;
    justify-content: center;
    
    .nav-menu {
      display: flex;
      gap: 0;
      
      .nav-item {
        font-size: 15px;
        font-weight: 500;
        padding: 0 20px;
        height: 70px;
        line-height: 70px;
        cursor: pointer;
        border-bottom: 2px solid transparent;
        white-space: nowrap;
        flex-shrink: 0;
        transition: all 0.3s ease;
        color: $text-color-primary;
        
        &:hover {
          color: $primary-color;
          background: transparent;
        }
        
        &.active {
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
