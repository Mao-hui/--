<template>
  <div class="news-detail">
    <Header />
    
    <div class="page-header">
      <div class="container">
        <h1>新闻中心</h1>
        <p>了解最新的行业动态和技术资讯</p>
      </div>
    </div>
    
    <div class="news-detail-content">
      <div class="container">
        <div class="article-container">
          <!-- 文章标题 -->
          <div class="article-header">
            <h1>{{ article.title }}</h1>
            <p class="article-date">{{ article.date }}</p>
          </div>
          
          <!-- 文章内容 -->
          <div class="article-body" v-loading="loading">
            <div class="article-image" v-if="article.image">
              <img :src="article.image" :alt="article.title" />
            </div>
            
            <div class="article-text">
              <div class="rich-content" v-html="article.content"></div>
            </div>
          </div>
          
          <!-- 浮动操作按钮 -->
          <div class="floating-actions">
            <el-button type="primary" circle size="large">
              <el-icon><Phone /></el-icon>
            </el-button>
            <el-button type="primary" circle size="large">
              <el-icon><Share /></el-icon>
            </el-button>
          </div>
        </div>
      </div>
    </div>
    
    <Footer />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Phone, Share } from '@element-plus/icons-vue'
import Header from '../components/Header.vue'
import Footer from '../components/Footer.vue'
import { apiGetNewsDetail } from '@/api'

export default {
  name: 'NewsDetail',
  components: {
    Header,
    Footer,
    Phone,
    Share
  },
  setup() {
    const route = useRoute()
    const loading = ref(false)
    const article = ref({
      title: '',
      date: '',
      image: '',
      content: ''
    })
    
    const formatDate = (val) => {
      if (!val) return ''
      const d = new Date(val)
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${y}-${m}-${day}`
    }
    
    const loadNewsDetail = async () => {
      // 从路由参数或查询参数获取 tweetId
      const tweetId = route.params.id || route.query.id || route.query.tweetId
      
      if (!tweetId) {
        ElMessage.error('缺少新闻ID参数')
        return
      }
      
      loading.value = true
      try {
        const res = await apiGetNewsDetail({ tweetId })
        if (res && res.code === 200 && res.data) {
          const data = res.data
          article.value = {
            title: data.title || '无标题',
            date: formatDate(data.releaseTime || data.createTime || data.updateTime),
            image: data.logoUrl || data.imageUrl || '',
            content: data.content || data.description || ''
          }
        } else {
          ElMessage.error((res && (res.msg || res.message)) || '获取新闻详情失败')
        }
      } catch (e) {
        ElMessage.error('加载新闻详情失败，请稍后重试')
      } finally {
        loading.value = false
      }
    }
    
    onMounted(() => {
      loadNewsDetail()
    })
    
    return {
      article,
      loading
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../assets/styles/main.scss';
.news-detail {
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

.news-detail-content {
  padding: 60px 0;
  background: white;
  min-height: 600px;
}

.article-container {
  max-width: 800px;
  margin: 0 auto;
  position: relative;
}

.article-header {
  text-align: center;
  margin-bottom: 40px;
  padding-bottom: 20px;
  border-bottom: 1px solid $border-color-lighter;
  
  h1 {
    font-size: 36px;
    color: $text-color-primary;
    margin-bottom: 20px;
    line-height: 1.4;
  }
  
  .article-date {
    color: $text-color-secondary;
    font-size: 16px;
    margin: 0;
  }
}

.article-body {
  .article-image {
    margin-bottom: 30px;
    
    img {
      width: 100%;
      height: 400px;
      object-fit: cover;
    }
  }
  
  .article-text {
    margin-bottom: 40px;
    
    .rich-content {
      font-size: 16px;
      line-height: 1.8;
      color: $text-color-primary;
      text-align: justify;
      
      :deep(img) {
        max-width: 100%;
        height: auto;
        margin: 20px 0;
        display: block;
      }
      
      :deep(p) {
        margin-bottom: 20px;
        
        &:last-child {
          margin-bottom: 0;
        }
      }
      
      :deep(h1), :deep(h2), :deep(h3), :deep(h4) {
        margin: 20px 0 15px;
        color: $text-color-primary;
      }
    }
  }
}

.floating-actions {
  position: fixed;
  right: 30px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 15px;
  z-index: 100;
  
  .el-button {
    width: 50px;
    height: 50px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    
    &:hover {
      transform: scale(1.1);
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
  
  .article-header h1 {
    font-size: 24px;
  }
  
  .article-body {
    .article-image img {
      height: 250px;
    }
    
    .article-text p {
      font-size: 14px;
    }
  }
  
  .floating-actions {
    right: 15px;
    
    .el-button {
      width: 40px;
      height: 40px;
    }
  }
}
</style>
