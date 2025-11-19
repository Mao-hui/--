<template>
  <header :class="['header', { 'header-hidden': isHeaderHidden }]">
    <div class="container">
      <div class="header-content">
        <div class="logo">
          <img src="@/assets/image/logo.png" alt="向量科技" />
          <span class="logo-title">向量科技</span>
        </div>
        <nav class="nav">
          <div :class="['nav-menu', { 'has-dropdown': showDropdown }]">
            <div 
              v-for="item in menuItems" 
              :key="item.path"
              :class="['nav-item', { 
                active: activeIndex === item.path,
                'dropdown-active': showDropdown === item.path
              }]"
              @mouseenter="handleMouseEnter(item)"
              @mouseleave="handleMouseLeave(item)"
              @click="handleSelect(item)"
            >
              {{ item.name }}
            </div>
          </div>
        </nav>
      </div>
    </div>
    
    <!-- 全屏下拉菜单 - 移到header外部 -->
    <div 
      v-if="showDropdown"
      class="fullscreen-dropdown"
      @mouseenter="handleDropdownEnter"
      @mouseleave="handleDropdownLeave"
    >
      <div class="container">
        <div class="dropdown-content">
          <!-- 产品中心：左侧可折叠导航 -->
          <div v-if="showDropdown === '/products'" class="dropdown-layout">
            <div class="dropdown-left">
              <div 
                v-for="category in getDropdownCategories('/products')"
                :key="category.key"
                class="category-group"
              >
                <div 
                  :class="['category-title', { expanded: expandedCategories[category.key] }]"
                  @click.stop="toggleCategory(category.key)"
                >
                  <span class="category-name">{{ category.name }}</span>
                  <el-icon class="expand-icon">
                    <ArrowDown v-if="!expandedCategories[category.key]" />
                    <ArrowUp v-else />
                  </el-icon>
                </div>
                <transition name="expand">
                  <div v-if="expandedCategories[category.key]" class="sub-categories">
                    <div 
                      v-for="subCategory in getProductSubCategories(category.key)"
                      :key="subCategory.key"
                      :class="['sub-category-item', { active: selectedCategory === subCategory.key }]"
                      @mouseenter="selectCategory(subCategory.key, '/products')"
                      @click.stop
                    >
                      <span>{{ subCategory.name }}</span>
                    </div>
                  </div>
                </transition>
              </div>
            </div>
            <div class="dropdown-right">
              <div v-if="selectedCategory" class="right-content">
                <div class="right-header">
                  <h3>{{ getSelectedCategoryName() }}</h3>
                </div>
                <div class="right-list tags-list">
                  <div 
                    v-for="detail in getDropdownDetails(selectedCategory, '/products')"
                    :key="detail.id"
                    class="tag-item"
                    @click="goToDetail('/products', detail)"
                  >
                    <span>{{ detail.name }}</span>
                    <el-icon class="arrow-icon"><TopRight /></el-icon>
                  </div>
                </div>
              </div>
              <div v-else class="right-empty">
                <p>请选择分类</p>
              </div>
            </div>
          </div>
          
          <!-- 解决方案：左侧不折叠的行业导航 -->
          <div v-else-if="showDropdown === '/solutions'" class="dropdown-layout">
            <div class="dropdown-left solutions-left">
              <div 
                v-for="category in getDropdownCategories('/solutions')"
                :key="category.key"
                :class="['category-item', { active: selectedCategory === category.key }]"
                @mouseenter="selectCategory(category.key, '/solutions')"
                @click.stop
              >
                <span class="category-name">{{ category.name }}</span>
                <el-icon v-if="selectedCategory === category.key" class="arrow-icon">
                  <ArrowRight />
                </el-icon>
              </div>
            </div>
            <div class="dropdown-right">
              <div v-if="selectedCategory" class="right-content">
                <div class="right-header">
                  <h3>{{ getSelectedCategoryName() }}</h3>
                </div>
                <div class="right-list tags-list">
                  <div 
                    v-for="scheme in getSolutionSchemes(selectedCategory)"
                    :key="scheme.id"
                    class="tag-item"
                    @click="goToDetail('/solutions', scheme)"
                  >
                    <span>{{ scheme.name }}</span>
                    <el-icon class="arrow-icon"><TopRight /></el-icon>
                  </div>
                </div>
              </div>
              <div v-else class="right-empty">
                <p>请选择行业类型</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowRight, ArrowDown, ArrowUp, TopRight } from '@element-plus/icons-vue'
import { apiGetProduct, apiGetScheme } from '@/api'

export default {
  name: 'Header',
  components: {
    ArrowRight,
    ArrowDown,
    ArrowUp,
    TopRight
  },
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
    const expandedCategories = ref({}) // 产品中心折叠状态
    const productsData = ref({ categories: [], subCategories: {}, details: {} })
    const solutionsData = ref({ categories: [], details: {} })
    
    const activeIndex = computed(() => route.path)
    
    const stripHtml = (html) => {
      if (!html) return ''
      return String(html).replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim()
    }
    
    // 加载产品数据（按大行业和小行业两层结构）
    const loadProducts = async () => {
      try {
        const res = await apiGetProduct()
        if (res && res.code === 200 && Array.isArray(res.data)) {
          const bigMap = new Map()
          const subCategoriesMap = {} // { bigKey: [{ key, name, smallIndustryId }] }
          const detailsMap = {} // { smallKey: [products] }
          
          res.data.forEach((item) => {
            const bigKey = `big-${item.bigIndustryId}`
            const smallKey = `small-${item.smallIndustryId}`
            
            // 添加大行业
            if (!bigMap.has(bigKey)) {
              bigMap.set(bigKey, { 
                key: bigKey, 
                name: item.bigIndustryName,
                bigIndustryId: item.bigIndustryId
              })
              subCategoriesMap[bigKey] = []
            }
            
            // 添加小行业（去重）
            if (!subCategoriesMap[bigKey].find(sub => sub.key === smallKey)) {
              subCategoriesMap[bigKey].push({
                key: smallKey,
                name: item.smallIndustryName,
                smallIndustryId: item.smallIndustryId,
                bigKey: bigKey
              })
            }
            
            // 添加产品详情到对应小行业
            if (!detailsMap[smallKey]) {
              detailsMap[smallKey] = []
            }
            
            detailsMap[smallKey].push({
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
            subCategories: subCategoriesMap,
            details: detailsMap
          }
          
          // 默认展开第一个大行业
          const firstCategory = Array.from(bigMap.values())[0]
          if (firstCategory) {
            expandedCategories.value[firstCategory.key] = true
          }
        }
      } catch (e) {
        console.error('加载产品数据失败:', e)
      }
    }
    
    // 加载解决方案数据（按小行业分组）
    const loadSolutions = async () => {
      try {
        const res = await apiGetScheme()
        if (res && res.code === 200 && Array.isArray(res.data)) {
          const bigMap = new Map()
          const detailsMap = {} // { bigKey: [{ smallIndustryName, schemes: [] }] }
          
          res.data.forEach((item) => {
            const bigKey = `big-${item.bigIndustryId}`
            const smallName = item.smallIndustryName || '其他'
            
            if (!bigMap.has(bigKey)) {
              bigMap.set(bigKey, { 
                key: bigKey, 
                name: item.bigIndustryName,
                bigIndustryId: item.bigIndustryId
              })
              detailsMap[bigKey] = []
            }
            
            // 查找是否已存在该小行业
            let smallGroup = detailsMap[bigKey].find(g => g.smallIndustryName === smallName)
            if (!smallGroup) {
              smallGroup = {
                smallIndustryName: smallName,
                schemes: []
              }
              detailsMap[bigKey].push(smallGroup)
            }
            
            // 添加方案到对应小行业
            smallGroup.schemes.push({
              id: item.schemeId,
              name: item.schemeName || '方案',
              description: stripHtml(item.description) || '—',
              bigIndustryId: item.bigIndustryId,
              smallIndustryName: smallName
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
    
    // 使用 ref 来存储定时器和状态，确保响应式和清理
    const hideTimer = ref(null)
    const currentHoverItem = ref(null)
    const isInDropdown = ref(false) // 标记鼠标是否在下拉菜单内
    
    // 延迟时间配置（毫秒）
    const DELAY_CONFIG = {
      SHOW: 0,           // 立即显示，无延迟
      HIDE_NAV: 150,     // 从导航项移开的延迟
      HIDE_DROPDOWN: 100 // 从下拉菜单移开的延迟
    }
    
    // 滚动控制相关
    const isHeaderHidden = ref(false)
    let lastScrollTop = 0
    let lastScrollTime = Date.now()
    let scrollTimeout = null
    
    // 清除定时器的辅助函数
    const clearHideTimer = () => {
      if (hideTimer.value) {
        clearTimeout(hideTimer.value)
        hideTimer.value = null
      }
    }
    
    const clearAllTimers = () => {
      clearHideTimer()
    }
    
    const handleMouseEnter = (item) => {
      // 清除所有隐藏定时器，确保菜单能显示
      clearHideTimer()
      
      // 记录当前悬停的项
      currentHoverItem.value = item
      
      if (item.hasDropdown) {
        // 如果是同一个菜单，不重新加载
        if (showDropdown.value === item.path) {
          return
        }
        
        // 立即显示菜单，不添加延迟，确保响应及时
        showDropdown.value = item.path
        
        // 显示下拉菜单时，确保导航栏也显示
        isHeaderHidden.value = false
        
        // 自动选择第一个分类
        if (item.path === '/products') {
          // 产品中心：自动展开第一个大行业，并选择第一个小行业
          const categories = getDropdownCategories(item.path)
          if (categories.length > 0) {
            const firstBigCategory = categories[0]
            expandedCategories.value[firstBigCategory.key] = true
            const subCategories = getProductSubCategories(firstBigCategory.key)
            if (subCategories.length > 0) {
              selectedCategory.value = subCategories[0].key
            }
          }
        } else if (item.path === '/solutions') {
          // 解决方案：自动选择第一个大行业
          const categories = getDropdownCategories(item.path)
          if (categories.length > 0) {
            selectedCategory.value = categories[0].key
          }
        }
      } else {
        // 如果没有下拉菜单，立即清除显示状态
        if (showDropdown.value) {
          showDropdown.value = ''
          selectedCategory.value = ''
          isInDropdown.value = false
        }
      }
    }
    
    const handleMouseLeave = (item) => {
      // 如果当前悬停的项不是这个项，说明已经移到了其他项，不需要隐藏
      if (currentHoverItem.value !== item) {
        return
      }
      
      // 如果鼠标已经在下拉菜单内，不隐藏
      if (isInDropdown.value && showDropdown.value === item.path) {
        return
      }
      
      // 延迟隐藏，以便用户能移动到下拉菜单
      clearHideTimer()
      hideTimer.value = setTimeout(() => {
        // 再次检查，确保用户没有移动到下拉菜单或其他导航项
        if (showDropdown.value === item.path) {
          // 如果鼠标已经移入下拉菜单，不隐藏
          if (isInDropdown.value) {
            return
          }
          // 如果鼠标移到了其他导航项，不隐藏当前菜单（让新项处理）
          if (currentHoverItem.value && currentHoverItem.value !== item) {
            return
          }
          // 只有在确定鼠标不在任何相关区域时才隐藏
          showDropdown.value = ''
          selectedCategory.value = ''
          currentHoverItem.value = null
          isInDropdown.value = false
        }
        hideTimer.value = null
      }, DELAY_CONFIG.HIDE_NAV) // 使用配置的延迟时间
    }
    
    const handleDropdownEnter = (item) => {
      // 清除隐藏定时器，保持下拉菜单显示
      clearHideTimer()
      // 标记鼠标在下拉菜单内
      isInDropdown.value = true
      // 保持 currentHoverItem，确保下拉菜单继续显示
      if (item) {
        currentHoverItem.value = item
      } else if (!currentHoverItem.value && showDropdown.value) {
        // 根据当前显示的菜单路径找到对应的菜单项
        const menuItem = menuItems.value.find(m => m.path === showDropdown.value)
        if (menuItem) {
          currentHoverItem.value = menuItem
        }
      }
    }
    
    const handleDropdownLeave = () => {
      // 标记鼠标已离开下拉菜单
      isInDropdown.value = false
      
      // 延迟隐藏，给用户时间移回导航项
      clearHideTimer()
      hideTimer.value = setTimeout(() => {
        // 如果鼠标已经移回导航项或其他区域，隐藏菜单
        if (!isInDropdown.value && (!currentHoverItem.value || showDropdown.value !== currentHoverItem.value.path)) {
          clearAllTimers()
          currentHoverItem.value = null
          showDropdown.value = ''
          selectedCategory.value = ''
        }
        hideTimer.value = null
      }, DELAY_CONFIG.HIDE_DROPDOWN) // 使用配置的延迟时间
    }
    
    // 保存滚动监听器清理函数
    let scrollCleanup = null
    
    const getDropdownCategories = (path) => {
      if (path === '/products') {
        return productsData.value.categories
      } else if (path === '/solutions') {
        return solutionsData.value.categories
      }
      return []
    }
    
    // 切换产品中心大行业的折叠状态
    const toggleCategory = (categoryKey) => {
      const isCurrentlyExpanded = expandedCategories.value[categoryKey]
      
      // 手风琴效果：先关闭所有分类
      Object.keys(expandedCategories.value).forEach(key => {
        expandedCategories.value[key] = false
      })
      
      // 如果当前是关闭状态，则展开；如果当前是展开状态，则保持关闭（实现折叠效果）
      if (!isCurrentlyExpanded) {
        expandedCategories.value[categoryKey] = true
        
        // 展开时，自动选择第一个小行业
        const subCategories = getProductSubCategories(categoryKey)
        if (subCategories.length > 0) {
          selectedCategory.value = subCategories[0].key
        }
      } else {
        // 如果是关闭当前展开的分类，清空选中的分类
        selectedCategory.value = ''
      }
    }
    
    // 获取产品中心指定大行业下的小行业列表
    const getProductSubCategories = (bigCategoryKey) => {
      return productsData.value.subCategories[bigCategoryKey] || []
    }
    
    const selectCategory = (categoryKey, path) => {
      selectedCategory.value = categoryKey
    }
    
    const getSelectedCategoryName = () => {
      // 对于产品中心，查找小行业名称
      if (selectedCategory.value.startsWith('small-')) {
        for (const bigKey in productsData.value.subCategories) {
          const subCategory = productsData.value.subCategories[bigKey].find(
            sub => sub.key === selectedCategory.value
          )
          if (subCategory) {
            return subCategory.name
          }
        }
      }
      
      // 对于解决方案，查找大行业名称
      const category = solutionsData.value.categories.find(c => c.key === selectedCategory.value)
      return category ? category.name : ''
    }
    
    const getDropdownDetails = (categoryKey, path) => {
      if (path === '/products') {
        // 产品中心返回小行业的产品列表
        return productsData.value.details[categoryKey] || []
      } else if (path === '/solutions') {
        // 返回按小行业分组的数据
        return solutionsData.value.details[categoryKey] || []
      }
      return []
    }
    
    // 获取解决方案的扁平化列表（用于网格布局）
    const getSolutionSchemes = (categoryKey) => {
      const groupedData = solutionsData.value.details[categoryKey] || []
      const schemes = []
      
      // 将分组数据扁平化
      groupedData.forEach(group => {
        if (group.schemes && Array.isArray(group.schemes)) {
          group.schemes.forEach(scheme => {
            schemes.push(scheme)
          })
        }
      })
      
      return schemes
    }
    
    const goToPage = (path) => {
      // 产品中心和解决方案页面隐藏，不跳转到列表页
      if (path === '/products' || path === '/solutions') {
        return
      }
      router.push(path)
      showDropdown.value = ''
      selectedCategory.value = ''
    }
    
    const goToDetail = (path, detail) => {
      if (path === '/products') {
        // 通过路由跳转到产品详情页
        router.push({
          path: '/product-detail',
          query: {
            productId: detail.id,
            category: detail.smallKey
          }
        })
      } else if (path === '/solutions') {
        // 通过路由跳转到解决方案详情页
        router.push({
          path: '/solution-detail',
          query: {
            schemeId: detail.id,
            bigIndustryId: detail.bigIndustryId
          }
        })
      }
      showDropdown.value = ''
      selectedCategory.value = ''
    }
    
    const handleSelect = (item) => {
      // 产品中心和解决方案不跳转到列表页，只通过下拉菜单跳转到详情页
      if (item.path === '/products' || item.path === '/solutions') {
        return
      }
      
      // 如果有下拉菜单
      if (item.hasDropdown) {
        // 检查当前路由是否与目标路由一致
        const currentPath = route.path
        if (currentPath !== item.path) {
          // 如果不在目标页面，则跳转并关闭下拉菜单
          router.push(item.path)
          showDropdown.value = ''
          selectedCategory.value = ''
        }
        // 如果已经在目标页面，则不做任何操作（保持下拉菜单状态）
        return
      }
      
      // 没有下拉菜单的导航项，跳转并关闭菜单
      router.push(item.path)
      showDropdown.value = ''
      selectedCategory.value = ''
    }
    
    const contactUs = () => {
      console.log('联系我们')
    }
    
    // 处理滚动事件
    const handleScroll = () => {
      const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop
      const currentTime = Date.now()
      const timeDiff = currentTime - lastScrollTime
      const scrollDiff = Math.abs(currentScrollTop - lastScrollTop)
      
      // 计算滚动速度（px/ms）
      const scrollSpeed = timeDiff > 0 ? scrollDiff / timeDiff : 0
      
      // 清除之前的滚动定时器
      if (scrollTimeout) {
        clearTimeout(scrollTimeout)
      }
      
      // 如果下拉菜单显示，保持导航栏显示
      if (showDropdown.value) {
        isHeaderHidden.value = false
        lastScrollTop = currentScrollTop
        lastScrollTime = currentTime
        return
      }
      
      // 向下滚动且速度较快（> 0.5 px/ms）时隐藏导航栏
      if (currentScrollTop > lastScrollTop && currentScrollTop > 100 && scrollSpeed > 0.5) {
        isHeaderHidden.value = true
      } 
      // 向上滚动时显示导航栏
      else if (currentScrollTop < lastScrollTop) {
        isHeaderHidden.value = false
      }
      // 滚动到顶部时显示导航栏
      else if (currentScrollTop <= 100) {
        isHeaderHidden.value = false
      }
      
      lastScrollTop = currentScrollTop
      lastScrollTime = currentTime
      
      // 设置滚动结束后的延迟处理，确保滚动停止后也能正确显示
      scrollTimeout = setTimeout(() => {
        // 如果滚动停止且距离顶部较近，显示导航栏
        const stoppedScrollTop = window.pageYOffset || document.documentElement.scrollTop
        if (stoppedScrollTop <= 200) {
          isHeaderHidden.value = false
        }
      }, 150)
    }
    
    // 处理全局点击事件，点击外部区域时关闭下拉菜单
    const handleGlobalClick = (event) => {
      // 如果没有显示下拉菜单，不处理
      if (!showDropdown.value) return
      
      // 检查点击是否在导航区域内
      const nav = event.target.closest('.nav')
      const dropdown = event.target.closest('.fullscreen-dropdown')
      
      // 如果点击的不是导航或下拉菜单，关闭下拉菜单
      if (!nav && !dropdown) {
        clearAllTimers()
        showDropdown.value = ''
        selectedCategory.value = ''
        currentHoverItem.value = null
        isInDropdown.value = false
      }
    }
    
    // 处理ESC键关闭下拉菜单
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && showDropdown.value) {
        clearAllTimers()
        showDropdown.value = ''
        selectedCategory.value = ''
        currentHoverItem.value = null
        isInDropdown.value = false
      }
    }
    
    onMounted(() => {
      loadProducts()
      loadSolutions()
      
      // 初始化滚动位置
      lastScrollTop = window.pageYOffset || document.documentElement.scrollTop
      lastScrollTime = Date.now()
      
      // 监听滚动事件，使用节流优化性能
      let ticking = false
      const throttledScroll = () => {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            handleScroll()
            ticking = false
          })
          ticking = true
        }
      }
      
      window.addEventListener('scroll', throttledScroll, { passive: true })
      
      // 添加全局点击和键盘事件监听
      document.addEventListener('click', handleGlobalClick)
      document.addEventListener('keydown', handleEscKey)
      
      // 保存清理函数
      scrollCleanup = () => {
        window.removeEventListener('scroll', throttledScroll)
        document.removeEventListener('click', handleGlobalClick)
        document.removeEventListener('keydown', handleEscKey)
        if (scrollTimeout) {
          clearTimeout(scrollTimeout)
        }
      }
    })
    
    // 组件卸载时清理定时器和滚动监听器
    onBeforeUnmount(() => {
      clearAllTimers()
      currentHoverItem.value = null
      isInDropdown.value = false
      if (scrollCleanup) {
        scrollCleanup()
      }
    })
    
    return {
      menuItems,
      activeIndex,
      showDropdown,
      selectedCategory,
      expandedCategories,
      handleSelect,
      handleMouseEnter,
      handleMouseLeave,
      handleDropdownEnter,
      handleDropdownLeave,
      getDropdownCategories,
      toggleCategory,
      getProductSubCategories,
      selectCategory,
      getSelectedCategoryName,
      getDropdownDetails,
      getSolutionSchemes,
      goToPage,
      goToDetail,
      contactUs,
      isHeaderHidden
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../assets/styles/main.scss';
.header {
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0.98), rgba(255, 255, 255, 0.95));
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.08);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  transform: translateY(0);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-bottom: 1px solid rgba(64, 158, 255, 0.1);
  
  &.header-hidden {
    transform: translateY(-100%);
    box-shadow: none;
  }
  
  :deep(.container) {
    padding-left: 200px;
    padding-right: 20px;
  }
  
  .header-content {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    height: 70px;
    padding-right: 0;
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
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  
  &:hover {
    transform: translateX(3px);
    
    img {
      transform: rotate(5deg) scale(1.05);
    }
    
    .logo-title {
      background: linear-gradient(135deg, $primary-color 0%, #66B1FF 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
  }
  
  img { 
    height: 44px; 
    display: block;
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    filter: drop-shadow(0 2px 4px rgba(64, 158, 255, 0.2));
  }
  
  .logo-title {
    background: linear-gradient(135deg, $primary-color 0%, #357ABD 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-size: 26px;
    font-weight: bold;
    letter-spacing: 2px;
    line-height: 1;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
}
  
  .nav {
    display: flex;
    margin-left: 50px;
    
    .nav-menu {
      display: flex;
      gap: 0;
      
      .nav-item {
        font-size: 15px;
        font-weight: 500;
        padding: 0 24px;
        height: 30px;
        line-height: 30px;
        cursor: pointer;
        border-bottom: 2px solid transparent;
        white-space: nowrap;
        flex-shrink: 0;
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        color: $text-color-primary;
        position: relative;
        
        // hover时显示主题色
        &:hover {
          color: $primary-color;
          background: transparent;
          border-bottom-color: $primary-color;
          transform: translateY(-1px); // 轻微上移效果
        }
        
        // 当前激活的页面路由（但如果有下拉菜单显示，则优先显示下拉菜单的项）
        &.active:not(.dropdown-active) {
          color: $primary-color;
          border-bottom-color: $primary-color;
          background: transparent;
        }
        
        // 显示下拉菜单时显示主题色
        &.dropdown-active {
          color: $primary-color;
          border-bottom-color: transparent; // 移除蓝色下划线
          background: transparent;
        }
        
      }
      
      // 当有下拉菜单显示时，隐藏其他项的蓝色下划线
      .nav-menu.has-dropdown {
        .nav-item {
          &:not(.dropdown-active):not(:hover) {
            border-bottom-color: transparent !important;
          }
          
          &.active:not(.dropdown-active) {
            border-bottom-color: transparent !important;
          }
        }
      }
      
    }
  }
}

// 全屏下拉菜单
.fullscreen-dropdown {
  position: fixed;
  top: 70px; // header高度
  left: 0;
  right: 0;
  width: 100vw;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15), 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 999;
  animation: fadeInDown 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  
  .dropdown-content {
    padding: 0;
  }
  
  .dropdown-layout {
    display: flex;
    min-height: 400px;
    max-height: 500px;
    
    .dropdown-left {
      width: 280px;
      background: rgba(245, 247, 250, 0.6);
      border-right: 1px solid rgba(0, 0, 0, 0.08);
      padding: 12px 0;
      overflow-y: auto;
      overflow-x: hidden;
      
      &::-webkit-scrollbar {
        width: 5px;
      }
      
      &::-webkit-scrollbar-track {
        background: transparent;
      }
      
      &::-webkit-scrollbar-thumb {
        background: rgba(0, 0, 0, 0.2);
        border-radius: 3px;
        
        &:hover {
          background: rgba(0, 0, 0, 0.3);
        }
      }
      
      // 产品中心的分类组（可折叠）
      .category-group {
        margin: 2px 8px;
        
        .category-title {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          color: rgba(48, 49, 51, 0.85);
          border-radius: 4px;
          background: transparent;
          font-weight: 600;
          font-size: 15px;
          
          &:hover {
            background: rgba(64, 158, 255, 0.08);
            color: $primary-color;
          }
          
          &.expanded {
            color: $primary-color;
            background: rgba(64, 158, 255, 0.08);
          }
          
          .category-name {
            letter-spacing: 0.3px;
          }
          
          .expand-icon {
            font-size: 14px;
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
        }
        
        .sub-categories {
          padding: 4px 0;
          
          .sub-category-item {
            padding: 10px 16px 10px 32px;
            cursor: pointer;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            color: rgba(48, 49, 51, 0.75);
            font-size: 14px;
            border-radius: 4px;
            margin: 2px 0;
            position: relative;
            
            &::before {
              content: '';
              position: absolute;
              left: 16px;
              top: 50%;
              transform: translateY(-50%);
              width: 4px;
              height: 4px;
              border-radius: 50%;
              background: rgba(48, 49, 51, 0.3);
              transition: all 0.2s;
            }
            
            &:hover {
              background: rgba(64, 158, 255, 0.08);
              color: $primary-color;
              padding-left: 36px;
              
              &::before {
                background: $primary-color;
                width: 6px;
                height: 6px;
              }
            }
            
            &.active {
              background: rgba(64, 158, 255, 0.12);
              color: $primary-color;
              font-weight: 500;
              padding-left: 36px;
              
              &::before {
                background: $primary-color;
                width: 6px;
                height: 6px;
              }
            }
          }
        }
      }
      
      // 解决方案的分类项（不折叠）
      &.solutions-left {
        .category-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 24px;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          color: rgba(48, 49, 51, 0.85);
          position: relative;
          margin: 2px 8px;
          border-radius: 4px;
          
          &::before {
            content: '';
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            width: 3px;
            height: 0;
            background: $primary-color;
            border-radius: 0 2px 2px 0;
            transition: height 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          }
          
          &:hover {
            background: rgba(64, 158, 255, 0.08);
            color: $primary-color;
            
            &::before {
              height: 60%;
              top: 20%;
            }
          }
          
          &.active {
            background: rgba(64, 158, 255, 0.12);
            color: $primary-color;
            
            &::before {
              height: 100%;
            }
          }
          
          .category-name {
            font-size: 14px;
            font-weight: 500;
            letter-spacing: 0.3px;
          }
          
          &.active .category-name {
            font-weight: 600;
          }
          
          .arrow-icon {
            font-size: 16px;
            color: $primary-color;
            transition: transform 0.25s;
          }
          
          &.active .arrow-icon {
            transform: translateX(3px);
          }
        }
      }
    }
    
    .dropdown-right {
      flex: 1;
      padding: 24px 32px;
      overflow-y: auto;
      background: transparent;
      
      &::-webkit-scrollbar {
        width: 6px;
      }
      
      &::-webkit-scrollbar-track {
        background: transparent;
      }
      
      &::-webkit-scrollbar-thumb {
        background: rgba(0, 0, 0, 0.2);
        border-radius: 3px;
        
        &:hover {
          background: rgba(0, 0, 0, 0.3);
        }
      }
      
      .right-content {
        .right-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
          padding-bottom: 14px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
          
          h3 {
            font-size: 19px;
            font-weight: 700;
            color: $text-color-primary;
            margin: 0;
            letter-spacing: 0.6px;
          }
          
          .link-text {
            font-size: 13px;
            color: $primary-color;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            padding: 8px 14px;
            border-radius: 6px;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 6px;
            background: rgba(64, 158, 255, 0.08);
            
            &:hover {
              color: white;
              background: $primary-color;
              transform: translateY(-1px);
              box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
            }
            
            &::after {
              content: '↗';
              font-size: 13px;
              margin-left: 2px;
              transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            &:hover::after {
              transform: translate(3px, -3px);
            }
          }
        }
        
        .right-list {
          &.tags-list {
            display: flex;
            flex-direction: column;
            flex-wrap: wrap;
            row-gap: 14px; // 行间距
            column-gap: 60px; // 列间距，参照商汤样式
            max-height: 380px; // 限制高度，超出后自动换列
            align-content: flex-start;
            
            .tag-item {
              display: inline-flex;
              align-items: center;
              justify-content: space-between;
              gap: 8px;
              padding: 12px 24px;
              background: transparent;
              border-radius: 0;
              cursor: pointer;
              transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
              border: none;
              border-bottom: 1px solid rgba(0, 0, 0, 0.08);
              font-size: 18px;
              font-weight: 500;
              color: $text-color-primary;
              letter-spacing: 0.5px;
              white-space: nowrap;
              
              span {
                flex: 1;
              }
              
              .arrow-icon {
                font-size: 16px;
                color: rgba(48, 49, 51, 0.4);
                transition: all 0.3s ease;
                opacity: 0; // 默认隐藏
                visibility: hidden;
              }
              
              &:hover {
                background: rgba(64, 158, 255, 0.05);
                color: $primary-color;
                
                .arrow-icon {
                  color: $primary-color;
                  opacity: 1; // 悬停时显示
                  visibility: visible;
                  transform: translate(2px, -2px);
                }
              }
            }
          }
        }
        
      }
      
      .right-empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 200px;
        gap: 12px;
        
        p {
          color: rgba(48, 49, 51, 0.5);
          font-size: 14px;
        }
      }
    }
  }
}

// 折叠动画
.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
}

.expand-enter-to,
.expand-leave-from {
  max-height: 500px;
  opacity: 1;
}

// 下拉菜单动画
@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// 移除旧的header相关样式，因为已经在.header内定义
.header-actions {
  .el-button {
    border-radius: 25px;
    padding: 10px 20px;
  }
}

@media (max-width: 768px) {
  .header {
    box-shadow: 0 1px 10px rgba(0, 0, 0, 0.06);
    
    :deep(.container) {
      padding-left: 12px;
      padding-right: 12px;
    }
    
    .header-content {
      height: 56px;
      padding: 0;
      justify-content: space-between;
    }
    
    .logo {
      gap: 8px;
      flex-shrink: 0;
      
      img {
        height: 30px;
        filter: drop-shadow(0 1px 3px rgba(64, 158, 255, 0.15));
      }
      
      .logo-title {
        font-size: 17px;
        letter-spacing: 1px;
      }
      
      // 移动端禁用 hover 效果
      &:hover {
        transform: none;
        
        img {
          transform: none;
        }
      }
    }
    
    .nav {
      margin-left: 8px;
      flex: 1;
      overflow-x: auto;
      overflow-y: hidden;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
      -ms-overflow-style: none;
      
      &::-webkit-scrollbar {
        display: none;
        width: 0;
        height: 0;
      }
      
      // 添加渐变遮罩提示可滚动
      &::after {
        content: '';
        position: absolute;
        right: 0;
        top: 0;
        bottom: 0;
        width: 20px;
        background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.95));
        pointer-events: none;
        z-index: 1;
      }
      
      .nav-menu {
        gap: 0;
        padding-right: 20px;
        
        .nav-item {
          font-size: 13px;
          padding: 0 14px;
          height: 32px;
          line-height: 32px;
          white-space: nowrap;
          flex-shrink: 0;
          border-bottom-width: 2px;
          position: relative;
          z-index: 2;
          
          // 移动端优化触摸反馈
          &:active {
            background: rgba(64, 158, 255, 0.08);
            transform: scale(0.98);
          }
          
          &.active:not(.dropdown-active) {
            border-bottom-width: 2px;
          }
        }
      }
    }
    
    .fullscreen-dropdown {
      top: 56px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
      
      .dropdown-layout {
        flex-direction: column;
        min-height: auto;
        max-height: calc(100vh - 56px);
        
        .dropdown-left {
          width: 100%;
          border-right: none;
          border-bottom: 1px solid rgba(0, 0, 0, 0.08);
          max-height: 180px;
          padding: 8px 0;
          
          .category-group {
            margin: 2px 4px;
            
            .category-title {
              padding: 10px 12px;
              font-size: 14px;
            }
            
            .sub-categories {
              .sub-category-item {
                padding: 8px 12px 8px 28px;
                font-size: 13px;
              }
            }
          }
          
          &.solutions-left {
            .category-item {
              padding: 10px 16px;
              font-size: 13px;
            }
          }
        }
        
        .dropdown-right {
          padding: 12px;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
          
          .right-content {
            .right-header {
              margin-bottom: 12px;
              padding-bottom: 10px;
              
              h3 {
                font-size: 15px;
              }
            }
            
            .right-list.tags-list {
              max-height: calc(100vh - 200px);
              row-gap: 10px;
              
              .tag-item {
                padding: 10px 12px;
                font-size: 13px;
                border-bottom-width: 1px;
                
                &:active {
                  background: rgba(64, 158, 255, 0.1);
                }
              }
            }
          }
        }
      }
    }
  }
}

@media (max-width: 480px) {
  .header {
    :deep(.container) {
      padding-left: 10px;
      padding-right: 10px;
    }
    
    .header-content {
      height: 52px;
    }
    
    .logo {
      gap: 6px;
      
      img {
        height: 26px;
      }
      
      .logo-title {
        font-size: 15px;
        letter-spacing: 0.5px;
      }
    }
    
    .nav {
      margin-left: 6px;
      
      &::after {
        width: 15px;
      }
      
      .nav-menu {
        padding-right: 15px;
        
        .nav-item {
          font-size: 12px;
          padding: 0 10px;
          height: 30px;
          line-height: 30px;
          border-bottom-width: 1.5px;
        }
      }
    }
    
    .fullscreen-dropdown {
      top: 52px;
      
      .dropdown-layout {
        max-height: calc(100vh - 52px);
        
        .dropdown-left {
          max-height: 140px;
          padding: 6px 0;
          
          .category-group {
            margin: 1px 2px;
            
            .category-title {
              padding: 8px 10px;
              font-size: 13px;
            }
            
            .sub-categories {
              .sub-category-item {
                padding: 6px 10px 6px 24px;
                font-size: 12px;
              }
            }
          }
          
          &.solutions-left {
            .category-item {
              padding: 8px 12px;
              font-size: 12px;
            }
          }
        }
        
        .dropdown-right {
          padding: 10px;
          
          .right-content {
            .right-header {
              margin-bottom: 10px;
              padding-bottom: 8px;
              
              h3 {
                font-size: 14px;
              }
            }
            
            .right-list.tags-list {
              max-height: calc(100vh - 180px);
              row-gap: 8px;
              
              .tag-item {
                padding: 8px 10px;
                font-size: 12px;
              }
            }
          }
        }
      }
    }
  }
}
</style>
