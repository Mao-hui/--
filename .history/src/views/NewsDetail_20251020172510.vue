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
          <div class="article-body">
            <div class="article-image">
              <img :src="article.image" :alt="article.title" />
            </div>
            
            <div class="article-text">
              <p v-for="(paragraph, index) in article.paragraphs" :key="index">
                {{ paragraph }}
              </p>
            </div>
            
            <!-- 相关图片 -->
            <div class="article-images">
              <img 
                v-for="(img, index) in article.relatedImages" 
                :key="index"
                :src="img" 
                :alt="`相关图片${index + 1}`"
                class="related-image"
              />
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
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import Header from '../components/Header.vue'
import Footer from '../components/Footer.vue'

export default {
  name: 'NewsDetail',
  components: {
    Header,
    Footer
  },
  setup() {
    const route = useRoute()
    const articleId = route.params.id
    
    const article = ref({
      id: 1,
      title: '向量科技与马士基合作推进全球供应链脱碳管理',
      date: '2025-10-11',
      image: 'https://via.placeholder.com/800x400/4A90E2/FFFFFF?text=马士基合作',
      paragraphs: [
        '向量科技与马士基集团宣布建立战略合作伙伴关系，共同推进全球供应链的脱碳管理。此次合作将结合向量科技在工业数字化领域的专业技术和马士基在物流供应链方面的丰富经验，为企业提供更环保、更高效的供应链解决方案。',
        '马士基集团首席执行官Robert Maersk Uggla表示："我们很高兴与向量科技建立合作伙伴关系。在应对气候变化挑战的过程中，技术创新是关键。向量科技在工业数字化和智能制造方面的专业能力，将帮助我们更好地实现供应链的可持续发展目标。"',
        '向量科技创始人兼CEO表示："与马士基这样的全球物流巨头合作，是我们技术实力和行业影响力的重要体现。我们将充分发挥在工业4.0、智能制造和数字化转型方面的技术优势，为全球供应链的绿色转型贡献力量。"',
        '此次合作将重点关注以下几个方面：',
        '1. 供应链数字化：利用向量科技的工业互联网平台，实现供应链全流程的数字化管理和监控。',
        '2. 碳排放监测：开发智能化的碳排放监测系统，实时跟踪和优化供应链的碳足迹。',
        '3. 绿色物流：通过数据分析和人工智能技术，优化物流路径和运输方式，减少能源消耗。',
        '4. 可持续发展：建立可持续的供应链管理体系，推动行业向更加环保的方向发展。',
        '双方还计划在未来三年内，共同投资超过5000万元人民币，用于相关技术的研发和应用。预计这一合作将为全球供应链行业带来革命性的变化，推动整个行业向更加绿色、智能的方向发展。',
        '向量科技作为一家专注于工业数字化和智能制造的高科技企业，在工业互联网、人工智能、大数据分析等领域拥有深厚的技术积累。公司研发人员占比超过80%，全部具有本科以上学历，常年服务ABB、奔驰、比亚迪等知名企业。',
        '马士基集团是全球领先的集装箱物流公司，在全球130多个国家设有办事处，拥有超过80,000名员工。公司致力于为客户提供端到端的物流解决方案，并积极推动行业的可持续发展。'
      ],
      relatedImages: [
        'https://via.placeholder.com/400x300/4A90E2/FFFFFF?text=合作签约',
        'https://via.placeholder.com/400x300/7ED321/FFFFFF?text=技术交流'
      ]
    })
    
    // 根据文章ID获取文章内容
    const getArticleById = (id) => {
      // 这里可以根据实际需求从API获取文章内容
      // 目前使用模拟数据
      return article.value
    }
    
    onMounted(() => {
      // 根据路由参数加载对应的文章
      const articleData = getArticleById(articleId)
      if (articleData) {
        article.value = articleData
      }
    })
    
    return {
      article
    }
  }
}
</script>

<style lang="scss" scoped>
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
      border-radius: 8px;
    }
  }
  
  .article-text {
    margin-bottom: 40px;
    
    p {
      font-size: 16px;
      line-height: 1.8;
      color: $text-color-primary;
      margin-bottom: 20px;
      text-align: justify;
      
      &:last-child {
        margin-bottom: 0;
      }
    }
  }
  
  .article-images {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
    margin-bottom: 40px;
    
    .related-image {
      width: 100%;
      height: 200px;
      object-fit: cover;
      border-radius: 8px;
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
