<template>
  <div class="news">
    <Header />
    
    <!-- Banner区域 -->
    <div class="banner-section" :style="bannerStyle">
      <div class="banner-content">
        <div class="banner-overlay">
          <!-- <h1 class="banner-title">新闻中心</h1>
          <p class="banner-subtitle">了解最新的行业动态和技术资讯</p> -->
        </div>
      </div>
    </div>
    
    <div class="news-content">
      <div class="container">
        <!-- 新闻横幅 -->
        <!-- <div class="news-banner">
          <img src="https://via.placeholder.com/1200x300/4A90E2/FFFFFF?text=新闻中心" alt="新闻中心" />
        </div> -->
        
        <!-- 新闻列表 + 预览分栏布局 -->
        <div class="news-section news-layout">
          <!-- <h2>新闻中心</h2> -->
          <!-- 工具条：年份 + 月份筛选 -->
          <div class="news-toolbar">
            <div class="filter-item" @click="showYearDropdown = !showYearDropdown">
              <el-icon><Calendar /></el-icon>
              <span>{{ yearFilter || '全部年份' }}</span>
              <el-icon class="arrow-icon"><ArrowDown /></el-icon>
              <div v-if="showYearDropdown" class="filter-dropdown" @click.stop>
                <div 
                  class="dropdown-item" 
                  :class="{ active: !yearFilter }"
                  @click="selectYear('')"
                >
                  全部年份
                </div>
                <div 
                  v-for="year in availableYears" 
                  :key="year"
                  class="dropdown-item"
                  :class="{ active: yearFilter === year }"
                  @click="selectYear(year)"
                >
                  {{ year }}
                </div>
              </div>
            </div>
            <div class="filter-item" :class="{ active: !!monthFilter }" @click="showMonthDropdown = !showMonthDropdown">
              <el-icon><Calendar /></el-icon>
              <span>{{ monthFilter || '月份' }}</span>
              <el-icon class="arrow-icon"><ArrowDown /></el-icon>
              <div v-if="showMonthDropdown" class="filter-dropdown month-dropdown" @click.stop>
                <el-date-picker
                  v-model="monthFilter"
                  type="month"
                  placeholder="选择月份"
                  value-format="YYYY-MM"
                  @change="showMonthDropdown = false"
                  style="width: 100%;"
                  :clearable="true"
                />
              </div>
            </div>
          </div>
          <div v-if="loading" class="loading">
            <el-skeleton animated :count="6">
              <template #template>
                <div class="news-card card">
                  <el-skeleton-item variant="image" style="width: 240px; height: 160px; border-radius: 8px;" />
                  <div style="flex: 1; padding: 0 16px">
                    <el-skeleton-item variant="h3" style="width: 70%; margin-bottom: 12px;" />
                    <el-skeleton-item variant="text" style="width: 90%;" />
                  </div>
                </div>
              </template>
            </el-skeleton>
          </div>
          <div v-else-if="error" class="error">{{ error }}</div>
          <el-empty v-else-if="!displayedList.length" description="暂无新闻" />
          <div v-else class="news-grid">
            <div 
              v-for="article in displayedList" 
              :key="article.id"
              :class="['news-card', 'card', { active: selectedArticle === article.id }]"
            >
              <div class="news-date">{{ article.date }}</div>
              <div class="news-image">
                <img :src="article.image" :alt="article.title" />
              </div>
              <h3 class="news-title">{{ article.title }}</h3>
              <div class="news-action">
                <a href="javascript:void(0)" class="learn-more-link" @click.stop="handleOpen(article)">
                  了解更多+
                </a>
              </div>
            </div>
          </div>

          <!-- 分页 -->
          <div class="pagination-section">
            <div class="pagination-info">
              <span>共{{ totalNews }}条</span>
            </div>
            <el-pagination
              v-model:current-page="currentPage"
              :page-size="pageSize"
              :total="totalNews"
              layout="prev, pager, next, jumper"
              @current-change="handlePageChange"
            />
          </div>
        </div>
      </div>
    </div>
    
    <Footer />
  </div>
</template>

<script>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Calendar, ArrowDown } from '@element-plus/icons-vue'
import Header from '../components/Header.vue'
import Footer from '../components/Footer.vue'
import { apiGetNewsList } from '@/api'
import newsImage from '@/assets/image/news.png'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'

export default {
  name: 'News',
  components: {
    Header,
    Footer,
    Calendar,
    ArrowDown
  },
  setup() {
    const router = useRouter()
    const currentPage = ref(1)
    const pageSize = ref(9)
    const selectedArticle = ref(null)
    
    const newsList = ref([])
    const totalNews = ref(0)
    const loading = ref(false)
    const error = ref('')
    const searchKeyword = ref('')
    const monthFilter = ref('')
    const yearFilter = ref('')
    const showYearDropdown = ref(false)
    const showMonthDropdown = ref(false)
    const availableYears = ref([])
    
    const bannerStyle = computed(() => {
      // 使用本地图片
      return {
        backgroundImage: `url('${newsImage}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }
    })
    
    const stripHtml = (html) => {
      if (!html) return ''
      return String(html).replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim()
    }
    
    const totalNewsComputed = computed(() => totalNews.value)
    
    const fetchNews = async () => {
      loading.value = true
      error.value = ''
      try {
        const res = await apiGetNewsList({
          pageSize: String(pageSize.value),
          pageNum: String(currentPage.value)
        })
        // 兼容常见返回：{ code, data: { rows,total } } 或 { code, rows, total }
        if (res && res.code === 200) {
          const rows = res.data?.rows || res.rows || res.data || []
          const total = res.data?.total || res.total || rows.length
          newsList.value = rows.map((item, idx) => ({
            id: item.id || item.tweetId || idx,
            title: item.title || '新闻',
            date: (item.releaseTime || item.updateTime || '').slice(0, 10),
            image: item.logoUrl || item.url || 'https://via.placeholder.com/300x200/4A90E2/FFFFFF?text=NEWS',
            content: item.content,
            excerpt: (stripHtml(item.content) || '').slice(0, 80)
          }))
          totalNews.value = Number(total) || newsList.value.length
        } else {
          error.value = (res && (res.msg || res.message)) || '加载失败'
        }
      } catch (e) {
        newsList.value = []
        totalNews.value = 0
        error.value = '加载失败，请稍后重试'
      } finally {
        loading.value = false
      }
    }
    
    const selectArticle = (articleId) => {
      selectedArticle.value = articleId
      router.push(`/news/${articleId}`)
    }
    
    const handleOpen = (article) => {
      // 跳转到详情页面
      router.push(`/news/${article.id}`)
    }
    
    const handlePageChange = async (page) => {
      currentPage.value = page
      await fetchNews()
    }
    const selectYear = (year) => {
      yearFilter.value = year
      showYearDropdown.value = false
    }
    
    // 获取所有可用年份
    const updateAvailableYears = () => {
      const years = new Set()
      newsList.value.forEach(item => {
        if (item.date) {
          const year = item.date.slice(0, 4)
          if (year) years.add(year)
        }
      })
      availableYears.value = Array.from(years).sort((a, b) => b.localeCompare(a))
    }
    
    // 点击外部关闭下拉
    const handleClickOutside = (e) => {
      if (!e.target.closest('.filter-item')) {
        showYearDropdown.value = false
        showMonthDropdown.value = false
      }
    }
    
    const displayedList = computed(() => {
      const month = (monthFilter.value || '').trim()
      const year = (yearFilter.value || '').trim()
      return newsList.value.filter(a => {
        const hitMonth = !month || (a.date && a.date.slice(0, 7) === month)
        const hitYear = !year || (a.date && a.date.slice(0, 4) === year)
        return hitMonth && hitYear
      })
    })
    
    onMounted(async () => {
      await fetchNews()
      updateAvailableYears()
      document.addEventListener('click', handleClickOutside)
    })
    
    onBeforeUnmount(() => {
      document.removeEventListener('click', handleClickOutside)
    })
    
    // 监听新闻列表变化，更新可用年份
    watch(() => newsList.value.length, () => {
      if (newsList.value.length > 0) {
        updateAvailableYears()
      }
    })
    
    return {
      currentPage,
      pageSize,
      selectedArticle,
      newsList,
      totalNews: totalNewsComputed,
      selectArticle,
      handlePageChange,
      loading,
      error,
      handleOpen,
      searchKeyword,
      monthFilter,
      yearFilter,
      showYearDropdown,
      showMonthDropdown,
      availableYears,
      selectYear,
      displayedList,
      bannerStyle
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../assets/styles/main.scss';
.news {
  padding-top: 70px;
}

.banner-section {
  position: relative;
  overflow: hidden;
  height: 400px;
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
    background: rgba(0, 0, 0, 0.3);
    z-index: 1;
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
    font-size: 48px;
    font-weight: bold;
    color: white;
    margin-bottom: 20px;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
    line-height: 1.2;
  }
  
  .banner-subtitle {
    font-size: 20px;
    color: white;
    opacity: 0.95;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    line-height: 1.5;
  }
}

.news-content {
  padding: 60px 0;
  background: $background-color-light;
  min-height: 400px;
}

.news-banner {
  margin-bottom: 40px;
  
  img {
    width: 100%;
    height: 300px;
    object-fit: cover;
    // border-radius: 12px;
    box-shadow: 0 12px 26px rgba(0,0,0,.1);
  }
}

.news-section {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 1) 100%);
  border-radius: 16px;
  padding: 50px 40px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(64, 158, 255, 0.1);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(64, 158, 255, 0.03) 0%, transparent 70%);
    animation: rotate 60s linear infinite;
  }
  
  @keyframes rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  &.news-layout {
    display: block;
  }
  
  .news-toolbar {
    display: flex;
    gap: 24px;
    margin-bottom: 30px;
    padding: 0;
    background: transparent;
    border: none;
    
    .filter-item {
      position: relative;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      cursor: pointer;
      color: $text-color-regular;
      font-size: 15px;
      transition: all 0.3s ease;
      border-bottom: 2px solid transparent;
      
      &:hover {
        color: $text-color-primary;
      }
      
      &.active {
        color: $primary-color;
        border-bottom-color: $primary-color;
      }
      
      .el-icon {
        font-size: 16px;
      }
      
      .arrow-icon {
        font-size: 12px;
        margin-left: 4px;
        transition: transform 0.3s ease;
      }
      
      &:hover .arrow-icon {
        transform: translateY(2px);
      }
      
      .filter-dropdown {
        position: absolute;
        top: 100%;
        left: 0;
        margin-top: 8px;
        background: white;
        border: 1px solid $border-color-base;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        z-index: 100;
        min-width: 150px;
        padding: 8px 0;
        
        .dropdown-item {
          padding: 10px 16px;
          cursor: pointer;
          color: $text-color-regular;
          transition: all 0.2s ease;
          
          &:hover {
            background: rgba($primary-color, 0.08);
            color: $primary-color;
          }
          
          &.active {
            background: rgba($primary-color, 0.12);
            color: $primary-color;
            font-weight: 500;
          }
        }
        
        :deep(.el-date-picker) {
          border: none;
          box-shadow: none;
        }
        
        &.month-dropdown {
          padding: 16px;
          min-width: 300px;
        }
      }
    }
  }
  
  h2 {
    font-size: 36px;
    color: $text-color-primary;
    margin-bottom: 40px;
    text-align: center;
    position: relative;
    padding-bottom: 20px;
    font-weight: 600;
    
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 60px;
      height: 3px;
      background: linear-gradient(90deg, $primary-color, lighten($primary-color, 20%));
      border-radius: 2px;
    }
  }
  
  .news-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
    margin-bottom: 30px;
    align-items: start;
  }
  
  .news-card {
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 1) 100%);
    border: 1px solid rgba(64, 158, 255, 0.12);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
    cursor: pointer;
    align-items: stretch;
    padding: 0;
    border-radius: 12px;
    position: relative;
    
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
      z-index: 1;
    }
    
    &:hover {
      transform: translateY(-8px) scale(1.01);
      box-shadow: 0 16px 40px rgba(64, 158, 255, 0.18);
      border-color: rgba($primary-color, 0.4);
      
      &::before {
        transform: scaleX(1);
      }
    }
    
    &.active {
      border: 2px solid $primary-color;
      box-shadow: 0 12px 32px rgba($primary-color, 0.25);
    }
    
    .news-date {
      padding: 12px 16px 8px;
      color: $text-color-secondary;
      font-size: 13px;
      line-height: 1;
      flex-shrink: 0;
    }
    
    .news-image {
      width: 100%;
      height: 200px;
      overflow: hidden;
      position: relative;
      flex-shrink: 0;
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.5s ease;
        display: block;
      }
    }
    
    &:hover .news-image img {
      transform: scale(1.05);
    }
    
    .news-title {
      padding: 16px 16px 12px;
      font-size: 16px;
      color: $text-color-primary;
      margin: 0;
      line-height: 1.4;
      font-weight: 600;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      transition: color 0.3s ease;
      flex: 1;
    }
    
    &:hover .news-title {
      color: $primary-color;
    }
    
    .news-action {
      padding: 0 16px 16px;
      flex-shrink: 0;
      
      .learn-more-link {
        color: $primary-color;
        font-size: 14px;
        text-decoration: none;
        transition: all 0.3s ease;
        display: inline-block;
        
        &:hover {
          color: darken($primary-color, 10%);
          transform: translateX(4px);
        }
      }
    }
  }
  
  .pagination-section {
    @include flex-between;
    align-items: center;
    margin-top: 50px;
    padding-top: 30px;
    border-top: 1px solid $border-color-lighter;
    
    .pagination-info {
      color: $text-color-regular;
      font-size: 16px;
      font-weight: 500;
    }
    
    :deep(.el-pagination) {
      .btn-next,
      .btn-prev {
        border-radius: 6px;
        transition: all 0.3s ease;
        
        &:hover {
          color: $primary-color;
          background: rgba($primary-color, 0.1);
        }
      }
      
      .el-pager li {
        border-radius: 6px;
        transition: all 0.3s ease;
        
        &.is-active {
          background: $primary-color;
          color: white;
          font-weight: 600;
        }
        
        &:hover {
          color: $primary-color;
          background: rgba($primary-color, 0.1);
        }
      }
      
      .el-pagination__jump {
        .el-input__wrapper {
          border-radius: 6px;
        }
      }
    }
  }
  
  .preview-panel {
    position: sticky;
    top: 90px;
    max-height: calc(100vh - 140px);
    overflow-y: auto;
    padding: 30px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    border: 1px solid $border-color-lighter;
    
    &::-webkit-scrollbar {
      width: 6px;
    }
    
    &::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 3px;
    }
    
    &::-webkit-scrollbar-thumb {
      background: $primary-color;
      border-radius: 3px;
      
      &:hover {
        background: darken($primary-color, 10%);
      }
    }
    
    .preview-title {
      margin: 0 0 12px;
      font-size: 22px;
      color: $text-color-primary;
      font-weight: 600;
      line-height: 1.4;
      padding-bottom: 12px;
      border-bottom: 2px solid $border-color-lighter;
    }
    
    .preview-meta {
      color: $text-color-secondary;
      font-size: 13px;
      margin-bottom: 16px;
      padding: 8px 12px;
      background: rgba($primary-color, 0.05);
      border-radius: 6px;
      display: inline-block;
    }
    
    .preview-cover {
      width: 100%;
      height: 240px;
      object-fit: cover;
      margin-bottom: 20px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    }
    
    .rich-content {
      line-height: 1.8;
      color: $text-color-primary;
      
      img {
        max-width: 100%;
        margin: 16px 0;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
      }
      
      p {
        margin-bottom: 12px;
      }
    }
  }
}

.loading {
  padding: 40px 0;
  color: $text-color-regular;
  
  :deep(.el-skeleton) {
    .news-card {
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
    }
  }
}

.error {
  padding: 40px 0;
  color: $danger-color;
  text-align: center;
  font-size: 16px;
  background: rgba($danger-color, 0.05);
  border-radius: 8px;
  border: 1px solid rgba($danger-color, 0.2);
}

@media (max-width: 1400px) {
  .banner-section {
    height: 380px;
    
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
  .news-section {
    padding: 20px;
    border-radius: 12px;
    
    h2 {
      font-size: 28px;
      margin-bottom: 30px;
      
      &::after {
        width: 40px;
      }
    }
  }
  
  .news-toolbar {
    flex-direction: column;
    padding: 16px;
    
    .tb-item {
      max-width: 100%;
    }
  }
  
  .news-card {
    flex-direction: column;
    
    .news-image {
      width: 100%;
      height: 180px;
    }
    
    .news-content {
      padding: 14px 14px 0;
      
      h3 {
        font-size: 18px;
      }
      
      .news-action {
        padding: 12px 0;
        
        &.no-excerpt {
          padding-top: 8px;
        }
      }
    }
  }
  
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
  
  .news-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
  
  @media (max-width: 480px) {
    .news-grid {
      grid-template-columns: 1fr;
      gap: 16px;
    }
  }
  
  .pagination-section {
    flex-direction: column;
    gap: 20px;
    align-items: center;
  }
  
  .preview-panel {
    position: static;
    max-height: none;
    margin-top: 30px;
    padding: 20px;
    
    .preview-title {
      font-size: 20px;
    }
    
    .preview-cover {
      height: 200px;
    }
  }
}
</style>

