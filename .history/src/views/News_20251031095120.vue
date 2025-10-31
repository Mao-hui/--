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
  &.news-layout {
    display: grid;
    grid-template-columns: 1.6fr 1fr; /* 左列表更宽 */
    gap: 24px;
    align-items: start;
  }
  .news-toolbar { display: flex; gap: 12px; margin-bottom: 16px; }
  .news-toolbar .tb-item { max-width: 280px; }
  h2 {
    font-size: 32px;
    color: $text-color-primary;
    margin-bottom: 30px;
    text-align: center;
  }
  
  .news-grid { display: grid; grid-template-columns: 1fr; gap: 16px; margin-bottom: 24px; }
  
  .news-card { cursor: pointer; transition: all 0.25s ease; overflow: hidden; display: flex; align-items: stretch; }
  .news-card:hover { transform: translateY(-4px); box-shadow: 0 12px 26px rgba(0,0,0,.08); }
  .news-card.active { border: 2px solid $primary-color; }
  .news-card .news-image { width: 240px; height: 160px; overflow: hidden; position: relative; flex-shrink: 0; }
  .news-card .news-image img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s ease; }
  .news-card:hover .news-image img { transform: scale(1.05); }
  .news-card .news-image .image-mask { position: absolute; left: 0; right: 0; bottom: 0; height: 54px; background: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,.35) 100%); }
  .news-card .news-image .date-badge { position: absolute; left: 12px; bottom: 10px; color: #fff; font-size: 12px; padding: 4px 8px; border-radius: 12px; background: rgba(0,0,0,.45); backdrop-filter: blur(2px); }
  .news-card .news-content { padding: 16px; display: flex; flex-direction: column; justify-content: center; }
  .news-card .news-content h3 { font-size: 18px; color: $text-color-primary; margin: 0 0 6px; line-height: 1.4; @include text-ellipsis; }
  .news-card .news-content .news-excerpt { color: $text-color-regular; font-size: 14px; line-height: 1.7; display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin: 0; }
  
  .pagination-section {
    @include flex-between;
    align-items: center;
    margin-top: 40px;
    
    .pagination-info {
      color: $text-color-regular;
      font-size: 16px;
    }
  }
  .preview-panel { position: sticky; top: 90px; max-height: calc(100vh - 140px); overflow: auto; padding: 20px; }
  .preview-title { margin: 0 0 6px; font-size: 20px; color: $text-color-primary; }
  .preview-meta { color: $text-color-secondary; font-size: 12px; margin-bottom: 10px; }
  .preview-cover { width: 100%; height: 220px; object-fit: cover; border-radius: 8px; margin-bottom: 12px; }
}

.loading, .error { padding: 20px 0; color: $text-color-regular; }

/* 详情弹窗样式增强 */
::v-deep(.el-dialog__body) {
  .news-detail { max-height: 65vh; overflow: auto; }
  .detail-cover { width: 100%; height: 260px; object-fit: cover; border-radius: 8px; margin-bottom: 12px; }
  .detail-meta { color: $text-color-secondary; font-size: 13px; margin-bottom: 8px; }
  .rich-content img { max-width: 100%; display: block; margin: 12px 0; border-radius: 6px; }
  .rich-content { line-height: 1.8; }
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
