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
              @click="handleSelect(item.path)"
            >
              {{ item.name }}
              <!-- 下拉菜单 -->
              <div 
                v-if="item.hasDropdown && showDropdown === item.path"
                class="dropdown-menu"
                @mouseenter="handleDropdownEnter(item)"
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
                      <!-- 产品中心：显示产品列表 -->
                      <div v-if="item.path === '/products'" class="right-list">
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
                      <!-- 解决方案：按小行业分组显示 -->
                      <div v-else-if="item.path === '/solutions'" class="right-list-solutions">
                        <div 
                          v-for="smallGroup in getDropdownDetails(selectedCategory, item.path)"
                          :key="smallGroup.smallIndustryName"
                          class="small-industry-group"
                        >
                          <div class="small-industry-name">{{ smallGroup.smallIndustryName }}</div>
                          <div class="schemes-list">
                            <div
                              v-for="scheme in smallGroup.schemes"
                              :key="scheme.id"
                              class="scheme-item"
                              @click="goToDetail(item.path, scheme)"
                            >
                              {{ scheme.name }}
                            </div>
                          </div>
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
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
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
    
    // 使用 ref 来存储定时器，确保在组件卸载时也能清理
    let hideTimer = null
    let showTimer = null
    let currentHoverItem = null
    let isInDropdown = false // 标记鼠标是否在下拉菜单内
    
    // 滚动控制相关
    const isHeaderHidden = ref(false)
    let lastScrollTop = 0
    let lastScrollTime = Date.now()
    let scrollTimeout = null
    
    const clearHideTimer = () => {
      if (hideTimer) {
        clearTimeout(hideTimer)
        hideTimer = null
      }
    }
    
    const clearShowTimer = () => {
      if (showTimer) {
        clearTimeout(showTimer)
        showTimer = null
      }
    }
    
    const clearAllTimers = () => {
      clearHideTimer()
      clearShowTimer()
    }
    
    const handleMouseEnter = (item) => {
      // 清除所有隐藏定时器，确保菜单能显示
      clearHideTimer()
      
      // 记录当前悬停的项
      currentHoverItem = item
      
      if (item.hasDropdown) {
        // 立即显示菜单，不添加延迟，确保响应及时
        showDropdown.value = item.path
        
        // 显示下拉菜单时，确保导航栏也显示
        isHeaderHidden.value = false
        
        // 自动选择第一个分类
        const categories = getDropdownCategories(item.path)
        if (categories.length > 0) {
          // 如果当前选中的分类不在当前菜单的分类列表中，则选择第一个
          const currentCategory = categories.find(c => c.key === selectedCategory.value)
          if (!currentCategory) {
            selectedCategory.value = categories[0].key
          }
        }
        
        // 清除显示定时器（如果有的话）
        clearShowTimer()
      } else {
        // 如果没有下拉菜单，立即清除显示状态
        if (showDropdown.value) {
          showDropdown.value = ''
          selectedCategory.value = ''
          isInDropdown = false
        }
      }
    }
    
    const handleMouseLeave = (item) => {
      // 如果当前悬停的项不是这个项，说明已经移到了其他项，不需要隐藏
      if (currentHoverItem !== item) {
        return
      }
      
      // 清除显示定时器
      clearShowTimer()
      
      // 如果鼠标已经在下拉菜单内，不隐藏
      if (isInDropdown && showDropdown.value === item.path) {
        return
      }
      
      // 延迟隐藏，以便用户能移动到下拉菜单
      clearHideTimer()
      hideTimer = setTimeout(() => {
        // 再次检查，确保用户没有移动到下拉菜单或其他导航项
        if (showDropdown.value === item.path) {
          // 如果鼠标已经移入下拉菜单，不隐藏
          if (isInDropdown) {
            return
          }
          // 如果鼠标移到了其他导航项，不隐藏当前菜单（让新项处理）
          if (currentHoverItem && currentHoverItem !== item) {
            return
          }
          // 只有在确定鼠标不在任何相关区域时才隐藏
          showDropdown.value = ''
          selectedCategory.value = ''
          currentHoverItem = null
          isInDropdown = false
        }
        hideTimer = null
      }, 200) // 200ms 延迟，给用户足够时间移动到下拉菜单
    }
    
    const handleDropdownEnter = (item) => {
      // 清除隐藏定时器，保持下拉菜单显示
      clearHideTimer()
      // 清除显示定时器
      clearShowTimer()
      // 标记鼠标在下拉菜单内
      isInDropdown = true
      // 保持 currentHoverItem，确保下拉菜单继续显示
      if (item) {
        currentHoverItem = item
      } else if (!currentHoverItem && showDropdown.value) {
        // 根据当前显示的菜单路径找到对应的菜单项
        const menuItem = menuItems.value.find(m => m.path === showDropdown.value)
        if (menuItem) {
          currentHoverItem = menuItem
        }
      }
    }
    
    const handleDropdownLeave = () => {
      // 标记鼠标已离开下拉菜单
      isInDropdown = false
      
      // 延迟隐藏，给用户时间移回导航项
      clearHideTimer()
      hideTimer = setTimeout(() => {
        // 如果鼠标已经移回导航项或其他区域，隐藏菜单
        if (!isInDropdown && (!currentHoverItem || showDropdown.value !== currentHoverItem.path)) {
          clearAllTimers()
          currentHoverItem = null
          showDropdown.value = ''
          selectedCategory.value = ''
        }
        hideTimer = null
      }, 150)
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
        // 返回按小行业分组的数据
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
        // 跳转到产品页面，并传递productId，页面会自动打开详情对话框
        router.push({
          path: '/products',
          query: {
            category: detail.smallKey,
            productId: detail.id
          }
        })
      } else if (path === '/solutions') {
        // 在新窗口打开解决方案详情页
        const url = router.resolve({
          path: '/solutions',
          query: {
            bigIndustryId: detail.bigIndustryId,
            schemeId: detail.id
          }
        }).href
        window.open(url, '_blank')
      }
      showDropdown.value = ''
      selectedCategory.value = ''
    }
    
    const handleSelect = (path) => {
      router.push(path)
      // 关闭下拉菜单
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
      
      // 保存清理函数
      scrollCleanup = () => {
        window.removeEventListener('scroll', throttledScroll)
        if (scrollTimeout) {
          clearTimeout(scrollTimeout)
        }
      }
    })
    
    // 组件卸载时清理定时器和滚动监听器
    onBeforeUnmount(() => {
      clearAllTimers()
      currentHoverItem = null
      if (scrollCleanup) {
        scrollCleanup()
      }
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
      contactUs,
      isHeaderHidden
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
  transform: translateY(0);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &.header-hidden {
    transform: translateY(-100%);
    box-shadow: none;
  }
  
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
        padding: 0 24px;
        height: 30px;
        line-height: 30px;
        cursor: pointer;
        border-bottom: 2px solid transparent;
        white-space: nowrap;
        flex-shrink: 0;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        color: $text-color-primary;
        position: relative;
        
        // 为有下拉菜单的项创建连接区域
        &.dropdown-active::after {
          content: '';
          position: absolute;
          bottom: -8px;
          left: 0;
          right: 0;
          height: 8px;
          background: transparent;
          z-index: 1002;
        }
        
        // hover时显示主题色
        &:hover {
          color: $primary-color;
          background: transparent;
          border-bottom-color: $primary-color;
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
          border-bottom-color: $primary-color;
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
      
      // 下拉菜单样式（浅色半透明背景）
      .dropdown-menu {
        position: absolute;
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        width: 1200px;
        max-height: 400px;
        background: rgba(255, 255, 255, 0.98);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border-radius: 0 0 8px 8px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15), 0 2px 8px rgba(0, 0, 0, 0.1);
        z-index: 1001;
        margin-top: 0;
        overflow: visible; // 改为visible以显示连接区域
        animation: fadeInDown 0.35s cubic-bezier(0.4, 0, 0.2, 1);
        border: 1px solid rgba(0, 0, 0, 0.08);
        border-top: none;
        
        // 创建连接区域，防止鼠标从导航项移动到下拉菜单时触发leave事件
        &::before {
          content: '';
          position: absolute;
          top: -10px; // 扩展到导航项下方
          left: 0;
          right: 0;
          height: 10px;
          background: transparent;
          pointer-events: auto; // 确保能捕获鼠标事件
        }
        
        .dropdown-content {
          display: flex;
          height: 100%;
          max-height: 400px;
          position: relative;
          z-index: 1;
          overflow: hidden; // 内容区域保持overflow hidden
        }
        
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
          
          .category-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 12px 24px;
            cursor: pointer;
            transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
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
                background: $primary-color;
              }
            }
            
            &.active {
              background: rgba(64, 158, 255, 0.12);
              color: $primary-color;
              
              &::before {
                height: 100%;
                background: $primary-color;
              }
            }
            
            .category-name {
              font-size: 14px;
              font-weight: 500;
              letter-spacing: 0.3px;
              transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
              line-height: 1.5;
            }
            
            &.active .category-name {
              font-weight: 600;
              letter-spacing: 0.4px;
            }
            
            .arrow-icon {
              font-size: 16px;
              color: rgba(48, 49, 51, 0.4);
              transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            &.active .arrow-icon {
              color: $primary-color;
              transform: translateX(3px);
            }
            
            &:hover .arrow-icon {
              color: rgba(64, 158, 255, 0.8);
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
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 14px;
              
              .detail-item {
                padding: 14px 16px;
                background: rgba(245, 247, 250, 0.5);
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                border: 1px solid rgba(0, 0, 0, 0.06);
                position: relative;
                overflow: hidden;
                
                &::before {
                  content: '';
                  position: absolute;
                  left: 0;
                  top: 0;
                  bottom: 0;
                  width: 2px;
                  background: $primary-color;
                  transform: scaleY(0);
                  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                
                &:hover {
                  background: rgba(64, 158, 255, 0.08);
                  border-color: rgba(64, 158, 255, 0.2);
                  transform: translateY(-2px);
                  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
                  
                  .detail-name {
                    color: $primary-color;
                  }
                  
                  .detail-desc {
                    opacity: 1;
                    color: rgba(48, 49, 51, 0.8);
                  }
                  
                  &::before {
                    transform: scaleY(1);
                  }
                }
                
                .detail-name {
                  font-size: 14px;
                  font-weight: 600;
                  color: $text-color-primary;
                  margin-bottom: 8px;
                  transition: all 0.3s ease;
                  letter-spacing: 0.3px;
                  line-height: 1.5;
                }
                
                .detail-desc {
                  font-size: 12px;
                  color: rgba(48, 49, 51, 0.65);
                  line-height: 1.6;
                  display: -webkit-box;
                  -webkit-line-clamp: 2;
                  line-clamp: 2;
                  -webkit-box-orient: vertical;
                  overflow: hidden;
                  opacity: 0.85;
                  transition: all 0.3s ease;
                }
              }
            }
            
            // 解决方案的样式（按小行业分组）
            .right-list-solutions {
              display: flex;
              flex-direction: column;
              gap: 16px;
              
              .small-industry-group {
                margin-bottom: 0;
                
                .small-industry-name {
                  font-size: 16px;
                  font-weight: 600;
                  color: $text-color-primary;
                  margin-bottom: 10px;
                  padding-bottom: 8px;
                  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
                  letter-spacing: 0.4px;
                }
                
                .schemes-list {
                  display: flex;
                  flex-direction: column;
                  gap: 6px;
                  
                  .scheme-item {
                    padding: 10px 14px;
                    background: rgba(245, 247, 250, 0.5);
                    border-radius: 6px;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    color: rgba(48, 49, 51, 0.85);
                    font-size: 14px;
                    position: relative;
                    border: 1px solid rgba(0, 0, 0, 0.06);
                    
                    &::after {
                      content: '';
                      position: absolute;
                      left: 0;
                      bottom: 0;
                      width: 0;
                      height: 2px;
                      background: $primary-color;
                      transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                      border-radius: 0 2px 2px 0;
                    }
                    
                    &:hover {
                      background: rgba(64, 158, 255, 0.08);
                      color: $primary-color;
                      border-color: rgba(64, 158, 255, 0.2);
                      transform: translateX(4px);
                      box-shadow: 0 2px 8px rgba(64, 158, 255, 0.15);
                      
                      &::after {
                        width: 100%;
                      }
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
