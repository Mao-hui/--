<template>
  <div class="news">
    <Header />
    
    <div class="page-header">
      <div class="container">
        <h1>新闻中心</h1>
        <p>了解最新的行业动态和技术资讯</p>
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
          <h2>新闻中心</h2>
          <!-- 工具条：搜索 + 月份筛选 -->
          <div class="news-toolbar">
            <el-input v-model="searchKeyword" placeholder="搜索新闻标题/内容" clearable prefix-icon="Search" class="tb-item" />
            <el-date-picker
              v-model="monthFilter"
              type="month"
              placeholder="按月份筛选"
              value-format="YYYY-MM"
              class="tb-item"
              clearable
            />
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
              @click="handleOpen(article)"
            >
              <div class="news-image">
                <img :src="article.image" :alt="article.title" />
                <div class="image-mask"></div>
                <div class="date-badge">{{ article.date }}</div>
              </div>
              <div class="news-content">
                <h3>{{ article.title }}</h3>
                <p class="news-excerpt">{{ article.excerpt }}</p>
              </div>
            </div>
          </div>
          <!-- 右侧预览面板（桌面端显示） -->
          <div class="preview-panel card" v-if="previewItem">
            <h3 class="preview-title">{{ previewItem.title }}</h3>
            <div class="preview-meta">{{ previewItem.date }}</div>
            <img v-if="previewItem.image" class="preview-cover" :src="previewItem.image" :alt="previewItem.title" />
            <div class="rich-content" v-html="previewItem.content"></div>
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
    
    <el-dialog v-model="dialogVisible" :title="detailItem && detailItem.title" width="900px">
      <div class="news-detail">
        <img v-if="detailItem && detailItem.image" class="detail-cover" :src="detailItem.image" :alt="detailItem.title" />
        <div class="detail-meta">{{ detailItem && detailItem.date }}</div>
        <div class="rich-content" v-html="detailItem && detailItem.content"></div>
      </div>
    </el-dialog>

    <Footer />
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Header from '../components/Header.vue'
import Footer from '../components/Footer.vue'
import { apiGetNewsList } from '@/api'

export default {
  name: 'News',
  components: {
    Header,
    Footer
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
    const dialogVisible = ref(false)
    const detailItem = ref(null)
    const previewItem = ref(null)
    const searchKeyword = ref('')
    const monthFilter = ref('')
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
    const openDetail = (article) => { detailItem.value = article; dialogVisible.value = true }
    const handleOpen = (article) => {
      previewItem.value = article
      // 移动端用弹窗，桌面端仅右侧预览
      if (window.matchMedia && window.matchMedia('(max-width: 1024px)').matches) {
        openDetail(article)
      }
      selectedArticle.value = article.id
    }
    
    const handlePageChange = async (page) => {
      currentPage.value = page
      await fetchNews()
    }
    const displayedList = computed(() => {
      const kw = (searchKeyword.value || '').trim().toLowerCase()
      const month = (monthFilter.value || '').trim()
      return newsList.value.filter(a => {
        const hitKw = !kw || (a.title && a.title.toLowerCase().includes(kw)) || (a.excerpt && a.excerpt.toLowerCase().includes(kw))
        const hitMonth = !month || (a.date && a.date.slice(0, 7) === month)
        return hitKw && hitMonth
      })
    })
    
    onMounted(() => {
      fetchNews()
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
      dialogVisible,
      detailItem,
      openDetail,
      previewItem,
      handleOpen,
      searchKeyword,
      monthFilter,
      displayedList
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../assets/styles/main.scss';
.news {
  padding-top: 70px;
}

.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 100px 0;
  text-align: center;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse"><path d="M 100 0 L 0 0 0 100" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
    opacity: 0.3;
  }
  
  .container {
    position: relative;
    z-index: 1;
  }
  
  h1 {
    font-size: 48px;
    font-weight: bold;
    margin-bottom: 20px;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    letter-spacing: 2px;
  }
  
  p {
    font-size: 20px;
    opacity: 0.95;
    font-weight: 300;
  }
}

.news-content {
  padding: 60px 0;
  background: $background-color-light;
  min-height: 600px;
}

.news-banner {
  margin-bottom: 40px;
  
  img {
    width: 100%;
    height: 300px;
    object-fit: cover;
    border-radius: 12px;
    box-shadow: 0 12px 26px rgba(0,0,0,.1);
  }
}

.news-section {
  background: white;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.06);
  
  &.news-layout {
    display: grid;
    grid-template-columns: 1.6fr 1fr;
    gap: 30px;
    align-items: start;
  }
  
  .news-toolbar {
    display: flex;
    gap: 16px;
    margin-bottom: 30px;
    padding: 20px;
    background: linear-gradient(135deg, rgba($primary-color, 0.03) 0%, rgba($primary-color, 0.01) 100%);
    border-radius: 12px;
    border: 1px solid rgba($primary-color, 0.1);
    
    .tb-item {
      flex: 1;
      max-width: 300px;
      
      :deep(.el-input__wrapper) {
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        transition: all 0.3s ease;
        
        &:hover {
          box-shadow: 0 4px 12px rgba($primary-color, 0.15);
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
    grid-template-columns: 1fr;
    gap: 20px;
    margin-bottom: 30px;
  }
  
  .news-card {
    cursor: pointer;
    transition: all 0.3s ease;
    overflow: hidden;
    display: flex;
    align-items: stretch;
    background: white;
    border-radius: 12px;
    border: 1px solid $border-color-lighter;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
    
    &:hover {
      transform: translateY(-6px);
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.12);
      border-color: rgba($primary-color, 0.3);
    }
    
    &.active {
      border: 2px solid $primary-color;
      box-shadow: 0 8px 24px rgba($primary-color, 0.2);
    }
    
    .news-image {
      width: 280px;
      height: 180px;
      overflow: hidden;
      position: relative;
      flex-shrink: 0;
      border-radius: 12px 0 0 12px;
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.5s ease;
      }
      
      .image-mask {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        height: 60px;
        background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.5) 100%);
      }
      
      .date-badge {
        position: absolute;
        left: 16px;
        bottom: 12px;
        color: #fff;
        font-size: 13px;
        padding: 6px 12px;
        border-radius: 20px;
        background: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(4px);
        font-weight: 500;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      }
    }
    
    &:hover .news-image img {
      transform: scale(1.1);
    }
    
    .news-content {
      padding: 24px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      flex: 1;
      
      h3 {
        font-size: 20px;
        color: $text-color-primary;
        margin: 0 0 12px;
        line-height: 1.5;
        font-weight: 600;
        @include text-ellipsis;
        transition: color 0.3s ease;
      }
      
      .news-excerpt {
        color: $text-color-regular;
        font-size: 14px;
        line-height: 1.8;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        margin: 0;
      }
    }
    
    &:hover .news-content h3 {
      color: $primary-color;
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
      border-radius: 10px;
      margin-bottom: 20px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    }
    
    .rich-content {
      line-height: 1.8;
      color: $text-color-primary;
      
      img {
        max-width: 100%;
        border-radius: 8px;
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

/* 详情弹窗样式增强 */
::v-deep(.el-dialog__body) {
  .news-detail {
    max-height: 65vh;
    overflow-y: auto;
    padding: 10px 0;
    
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
  }
  
  .detail-cover {
    width: 100%;
    height: 300px;
    object-fit: cover;
    border-radius: 12px;
    margin-bottom: 20px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  }
  
  .detail-meta {
    color: $text-color-secondary;
    font-size: 14px;
    margin-bottom: 20px;
    padding: 10px 16px;
    background: rgba($primary-color, 0.05);
    border-radius: 8px;
    display: inline-block;
  }
  
  .rich-content {
    line-height: 2;
    color: $text-color-primary;
    
    img {
      max-width: 100%;
      display: block;
      margin: 20px 0;
      border-radius: 8px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    }
    
    p {
      margin-bottom: 16px;
      text-align: justify;
    }
    
    h1, h2, h3, h4, h5, h6 {
      color: $text-color-primary;
      margin-top: 24px;
      margin-bottom: 16px;
      font-weight: 600;
    }
  }
}

@media (max-width: 768px) {
  .news-section.news-layout { grid-template-columns: 1fr; }
  .news-toolbar { flex-direction: column; }
  .news-card { flex-direction: column; }
  .news-card .news-image { width: 100%; height: 200px; }
  .page-header {
    padding: 60px 0;
    
    h1 {
      font-size: 32px;
    }
    
    p {
      font-size: 16px;
    }
  }
  
  .news-grid {
    grid-template-columns: 1fr;
  }
  
  .pagination-section {
    flex-direction: column;
    gap: 20px;
  }
}
</style>
