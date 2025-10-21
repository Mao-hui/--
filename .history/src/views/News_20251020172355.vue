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
    
    const newsList = ref([
      {
        id: 1,
        title: '向量科技与马士基合作推进全球供应链脱碳管理',
        date: '2025-10-11',
        image: 'https://via.placeholder.com/300x200/4A90E2/FFFFFF?text=马士基合作',
        content: '向量科技与马士基集团宣布建立战略合作伙伴关系，共同推进全球供应链的脱碳管理。此次合作将结合向量科技在工业数字化领域的专业技术和马士基在物流供应链方面的丰富经验，为企业提供更环保、更高效的供应链解决方案。'
      },
      {
        id: 2,
        title: '工业4.0时代：智能制造的新机遇与挑战',
        date: '2025-10-10',
        image: 'https://via.placeholder.com/300x200/7ED321/FFFFFF?text=工业4.0',
        content: '随着工业4.0技术的不断发展，智能制造正在重塑传统制造业。本文深入分析了当前智能制造领域的新机遇与挑战，探讨了数字化转型对企业发展的重要意义。'
      },
      {
        id: 3,
        title: '电商平台技术升级：提升用户体验的关键',
        date: '2025-10-09',
        image: 'https://via.placeholder.com/300x200/FF6B6B/FFFFFF?text=电商升级',
        content: '在竞争激烈的电商市场中，用户体验成为决定平台成功的关键因素。本文介绍了最新的电商平台技术升级方案，帮助企业提升用户满意度和转化率。'
      },
      {
        id: 4,
        title: '数字化转型：传统企业的必经之路',
        date: '2025-10-08',
        image: 'https://via.placeholder.com/300x200/4ECDC4/FFFFFF?text=数字化转型',
        content: '数字化转型已成为传统企业发展的必然趋势。本文分析了数字化转型的核心要素和实施策略，为企业提供实用的转型指导。'
      },
      {
        id: 5,
        title: '云计算在工业领域的应用前景',
        date: '2025-10-07',
        image: 'https://via.placeholder.com/300x200/45B7D1/FFFFFF?text=云计算',
        content: '云计算技术正在工业领域发挥越来越重要的作用。本文探讨了云计算在工业应用中的优势、挑战和未来发展趋势。'
      },
      {
        id: 6,
        title: '人工智能助力智能制造升级',
        date: '2025-10-06',
        image: 'https://via.placeholder.com/300x200/96CEB4/FFFFFF?text=人工智能',
        content: '人工智能技术正在推动智能制造向更高层次发展。本文介绍了AI在制造业中的具体应用案例和未来发展方向。'
      },
      {
        id: 7,
        title: '数据安全：企业数字化转型的重要保障',
        date: '2025-10-05',
        image: 'https://via.placeholder.com/300x200/FECA57/FFFFFF?text=数据安全',
        content: '在数字化转型过程中，数据安全成为企业必须重视的问题。本文分析了数据安全面临的挑战和相应的解决方案。'
      },
      {
        id: 8,
        title: '移动应用开发：企业服务的新趋势',
        date: '2025-10-04',
        image: 'https://via.placeholder.com/300x200/FF9FF3/FFFFFF?text=移动应用',
        content: '移动应用正在成为企业服务的重要载体。本文探讨了移动应用开发的最新趋势和最佳实践。'
      },
      {
        id: 9,
        title: '区块链技术在供应链管理中的应用',
        date: '2025-10-03',
        image: 'https://via.placeholder.com/300x200/54A0FF/FFFFFF?text=区块链',
        content: '区块链技术为供应链管理带来了新的可能性。本文分析了区块链在供应链中的应用场景和实际效果。'
      }
    ])
    
    const totalNews = computed(() => newsList.value.length)
    
    const selectArticle = (articleId) => {
      selectedArticle.value = articleId
      router.push(`/news/${articleId}`)
    }
    
    const handlePageChange = (page) => {
      currentPage.value = page
      // 这里可以添加加载更多新闻的逻辑
    }
    
    onMounted(() => {
      // 页面加载时的初始化逻辑
    })
    
    return {
      currentPage,
      pageSize,
      selectedArticle,
      newsList,
      totalNews,
      selectArticle,
      handlePageChange
    }
  }
}
</script>

<style lang="scss" scoped>
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
