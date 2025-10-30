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
        <div class="news-banner">
          <img src="https://via.placeholder.com/1200x300/4A90E2/FFFFFF?text=新闻中心" alt="新闻中心" />
        </div>
        
        <!-- 新闻列表 -->
        <div class="news-section">
          <h2>新闻中心</h2>
          <div class="news-grid">
            <div 
              v-for="article in newsList" 
              :key="article.id"
              :class="['news-card', 'card', { active: selectedArticle === article.id }]"
              @click="selectArticle(article.id)"
            >
              <div class="news-image">
                <img :src="article.image" :alt="article.title" />
              </div>
              <div class="news-content">
                <h3>{{ article.title }}</h3>
                <p class="news-date">{{ article.date }}</p>
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
    
    const totalNewsComputed = computed(() => totalNews.value)
    
    const fetchNews = async () => {
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
            content: item.content
          }))
          totalNews.value = Number(total) || newsList.value.length
        }
      } catch (e) {
        newsList.value = []
        totalNews.value = 0
      }
    }
    
    const selectArticle = (articleId) => {
      selectedArticle.value = articleId
      router.push(`/news/${articleId}`)
    }
    
    const handlePageChange = async (page) => {
      currentPage.value = page
      await fetchNews()
    }
    
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
      handlePageChange
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
  }
}

.news-section {
  h2 {
    font-size: 32px;
    color: $text-color-primary;
    margin-bottom: 30px;
    text-align: center;
  }
  
  .news-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 25px;
    margin-bottom: 40px;
  }
  
  .news-card {
    cursor: pointer;
    transition: all 0.3s ease;
    overflow: hidden;
    
    &:hover {
      transform: translateY(-5px);
    }
    
    &.active {
      border: 2px solid $primary-color;
    }
    
    .news-image {
      height: 200px;
      overflow: hidden;
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.3s ease;
      }
    }
    
    &:hover .news-image img {
      transform: scale(1.05);
    }
    
    .news-content {
      padding: 20px;
      
      h3 {
        font-size: 18px;
        color: $text-color-primary;
        margin-bottom: 10px;
        line-height: 1.4;
        @include text-ellipsis;
      }
      
      .news-date {
        color: $text-color-secondary;
        font-size: 14px;
        margin: 0;
      }
    }
  }
  
  .pagination-section {
    @include flex-between;
    align-items: center;
    margin-top: 40px;
    
    .pagination-info {
      color: $text-color-regular;
      font-size: 16px;
    }
  }
}

@media (max-width: 768px) {
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
