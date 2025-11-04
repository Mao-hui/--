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
            >
              <div class="news-image">
                <img :src="article.image" :alt="article.title" />
              </div>
              <div class="news-content">
                <div class="news-date">{{ article.date }}</div>
                <h3 class="news-title">{{ article.title }}</h3>
                <p class="news-excerpt" v-if="article.excerpt">{{ article.excerpt }}</p>
                <div :class="['news-action', { 'no-excerpt': !article.excerpt }]">
                  <el-button type="primary" class="detail-btn" @click.stop="handleOpen(article)">
                    查看详情
                  </el-button>
                </div>
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
    
    <el-dialog v-model="dialogVisible" :title="detailItem && detailItem.title" width="900px">
      <div class="news-detail" v-loading="detailLoading">
        <img v-if="detailItem && detailItem.image" class="detail-cover" :src="detailItem.image" :alt="detailItem.title" />
        <div class="detail-meta" v-if="detailItem && detailItem.date">{{ detailItem.date }}</div>
        <div class="rich-content" v-html="detailItem && detailItem.content"></div>
      </div>
    </el-dialog>

    <Footer />
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import Header from '../components/Header.vue'
import Footer from '../components/Footer.vue'
import { apiGetNewsList, apiGetNewsDetail } from '@/api'
import newsImage from '@/assets/image/news.png'

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
    const detailLoading = ref(false)
    const previewItem = ref(null)
    const searchKeyword = ref('')
    const monthFilter = ref('')
    
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
    
    // 处理HTML中的图片大小
    const processHtmlImages = (html) => {
      if (!html || typeof html !== 'string') {
        return html
      }
      
      // 使用正则表达式匹配img标签，添加max-width样式
      return html.replace(/<img([^>]*)>/gi, (match, attrs) => {
        // 检查是否已有style属性
        const styleMatch = attrs.match(/style\s*=\s*["']([^"']*)["']/i)
        let style = ''
        
        if (styleMatch) {
          // 如果已有style属性，提取并添加max-width
          style = styleMatch[1]
          // 移除已有的width和max-width相关样式
          style = style.replace(/max-width\s*:\s*[^;]+;?/gi, '')
          style = style.replace(/width\s*:\s*[^;]+;?/gi, '')
          // 添加max-width
          style = style.trim()
          if (style && !style.endsWith(';')) {
            style += ';'
          }
          style += 'max-width:100%;height:auto;'
          // 替换原有的style属性
          attrs = attrs.replace(/style\s*=\s*["'][^"']*["']/i, `style="${style}"`)
        } else {
          // 如果没有style属性，添加一个
          attrs += ' style="max-width:100%;height:auto;"'
        }
        
        return `<img${attrs}>`
      })
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
    
    const openDetail = async (article) => {
      if (!article || !article.id) {
        ElMessage.error('新闻信息不完整')
        return
      }
      
      dialogVisible.value = true
      detailLoading.value = true
      detailItem.value = null
      
      try {
        // 调用详情接口获取完整内容
        const res = await apiGetNewsDetail({ tweetId: article.id })
        if (res && res.code === 200 && res.data) {
          const data = res.data
          // 处理详情内容中的图片大小
          let processedContent = data.content || data.description || article.content || ''
          processedContent = processHtmlImages(processedContent)
          
          detailItem.value = {
            id: data.tweetId || data.id || article.id,
            title: data.title || article.title || '新闻详情',
            date: data.releaseTime || data.createTime || article.date || '',
            image: data.logoUrl || data.imageUrl || article.image || '',
            content: processedContent
          }
        } else {
          // 如果接口失败，使用列表中的已有数据
          let processedContent = article.content || ''
          processedContent = processHtmlImages(processedContent)
          
          detailItem.value = {
            ...article,
            content: processedContent
          }
          ElMessage.warning((res && (res.msg || res.message)) || '获取详情失败，显示基本信息')
        }
      } catch (e) {
        // 出错时使用列表中的已有数据
        let processedContent = article.content || ''
        processedContent = processHtmlImages(processedContent)
        
        detailItem.value = {
          ...article,
          content: processedContent
        }
        ElMessage.warning('加载详情失败，显示基本信息')
      } finally {
        detailLoading.value = false
      }
    }
    
    const handleOpen = (article) => {
      openDetail(article)
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
      detailLoading,
      openDetail,
      previewItem,
      handleOpen,
      searchKeyword,
      monthFilter,
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
    display: block;
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
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
    margin-bottom: 30px;
  }
  
  .news-card {
    transition: all 0.3s ease;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    background: white;
    border-radius: 12px;
    border: 1px solid $border-color-lighter;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
    cursor: pointer;
    
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
      width: 100%;
      height: 140px;
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
    
    .news-content {
      padding: 12px;
      display: flex;
      flex-direction: column;
      flex: 1;
      
      .news-date {
        color: $text-color-secondary;
        font-size: 12px;
        margin-bottom: 8px;
        line-height: 1;
      }
      
      .news-title {
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
        min-height: 40px;
      }
      
      .news-excerpt {
        color: $text-color-regular;
        font-size: 13px;
        line-height: 1.5;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        margin: 6px 0 10px;
        flex: 1;
      }
      
      // 当标题后面没有摘要时，按钮间距较小
      .news-title:not(:has(+ .news-excerpt)) + .news-action,
      .news-action.no-excerpt {
        margin-top: 4px;
      }
      
      // 当标题后面有摘要时，按钮间距由摘要的下边距提供（正常间距）
      .news-excerpt + .news-action {
        margin-top: 0;
      }
      
      .news-action {
        margin-top: auto;
        display: flex;
        justify-content: center;
        
        .detail-btn {
          width: 100%;
          background: #303133;
          border-color: #303133;
          color: white;
          border-radius: 6px;
          font-weight: 500;
          font-size: 14px;
          padding: 10px;
          transition: all 0.3s ease;
          
          &:hover {
            background: #606266;
            border-color: #606266;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(48, 49, 51, 0.3);
          }
        }
      }
    }
    
    &:hover .news-content .news-title {
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
    border-radius: 12px;
    
    .news-image {
      width: 100%;
      height: 220px;
    }
    
    .news-content {
      padding: 20px;
      
      h3 {
        font-size: 18px;
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
