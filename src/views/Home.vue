<template>
  <div class="home">
    <Header />
    
    <!--  -->
    <section class="hero">
      <!-- 有 banner 数据用轮播展示 -->
      <el-carousel 
        v-if="banners.length > 0" 
        :interval="3000" 
        height="420px" 
        arrow="always" 
        indicator-position="outside"
        trigger="click"
      >
        <el-carousel-item v-for="item in banners" :key="item.id">
          <img :src="item.url" alt="banner" class="hero-slide" />
        </el-carousel-item>
      </el-carousel>
    </section>
    
    <!-- 企业开发能力 -->
    <section class="capabilities section">
      <div class="container">
        <h2 class="section-title">企业开发能力</h2>
        <div class="capabilities-grid">
          <div 
            v-for="capability in capabilities" 
            :key="capability.title"
            class="capability-card card"
          >
            <div class="capability-icon">
              <el-icon :size="60">
                <component :is="capability.icon" />
              </el-icon>
            </div>
            <h3>{{ capability.title }}</h3>
            <p>{{ capability.description }}</p>
          </div>
        </div>
      </div>
    </section>
    
    <!-- 解决方案横幅 -->
    <section class="solutions-banner section">
      <div class="container">
        <h2 class="section-title">解决方案</h2>
        <div class="solutions-banner-content">
          <div class="solution-item">
            <div class="solution-image">
              <img src="https://via.placeholder.com/600x300/4A90E2/FFFFFF?text=工厂制造业" alt="工厂制造业" />
              <div class="solution-overlay">
                <h3>工厂制造业</h3>
              </div>
            </div>
          </div>
          <div class="solution-item">
            <div class="solution-image">
              <img src="https://via.placeholder.com/600x300/7ED321/FFFFFF?text=服务快消" alt="服务快消" />
              <div class="solution-overlay">
                <h3>服务快消</h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    
    <!-- 为什么选择我们 -->
    <section class="why-choose section">
      <div class="container">
        <h2 class="section-title">为什么选择我们</h2>
        <div class="features-grid">
          <div 
            v-for="feature in features" 
            :key="feature.title"
            class="feature-card card"
          >
            <div class="feature-icon">
              <el-icon :size="50">
                <component :is="feature.icon" />
              </el-icon>
            </div>
            <h3>{{ feature.title }}</h3>
            <p>{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </section>
    
    <!-- 新闻中心 -->
    <section class="news section">
      <div class="container">
        <h2 class="section-title">新闻中心</h2>
        <div v-if="newsLoading && newsList.length === 0" class="news-empty">正在加载新闻...</div>
        <div v-else-if="!newsLoading && newsList.length === 0" class="news-empty">暂无新闻数据</div>
        <div v-else class="news-list">
          <div 
            v-for="item in newsList" 
            :key="item.id" 
            class="news-item card"
            @click="goNewsDetail(item)"
          >
            <div class="news-content">
              <h3 class="news-title">{{ item.title }}</h3>
              <div class="news-date">{{ item.date }}</div>
            </div>
            <div class="news-thumb">
              <img :src="item.image" alt="news" />
            </div>
          </div>
        </div>
      </div>
    </section>
    
    <!-- 浮动联系按钮 -->
    <div class="floating-actions">
      <el-button type="primary" circle size="large" class="floating-btn">
        <el-icon><Phone /></el-icon>
      </el-button>
      <el-button type="primary" circle size="large" class="floating-btn">
        <el-icon><ChatDotRound /></el-icon>
      </el-button>
    </div>
    
    <Footer />
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import Header from '../components/Header.vue'
import Footer from '../components/Footer.vue'
import { apiGetBanner, apiGetDevelopment, apiGetBannerUa, apiGetBannerScheme, apiGetNewsList } from '@/api'

export default {
  name: 'Home',
  components: {
    Header,
    Footer
  },
  setup() {
    const heroTags = ref([
      '全渠道报修',
      '工单过程监控',
      '配件',
      '结算',
      '客户评价',
      '大数据分析'
    ])
    
    const capabilities = ref([])
    
    const solutions = ref([])
    
    const features = ref([])

    const banners = ref([])

    const newsList = ref([])
    const newsLoading = ref(false)

    const stripHtml = (html) => {
      if (!html) return ''
      return String(html).replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim()
    }

    const heroStyle = computed(() => {
      const first = banners.value[0]
      const img = first && first.url ? first.url : ''
      const bgImg = img ? `, url('${img}') center/cover no-repeat` : ''
      return {
        background: `linear-gradient(135deg, #4A90E2 0%, #357ABD 100%)${bgImg}`
      }
    })

    const loadBanner = async () => {
      try {
        const res = await apiGetBanner()
        if (res && res.code === 200 && Array.isArray(res.data)) {
          banners.value = res.data
        }
      } catch (e) {
        // 忽略，使用默认渐变背景
      }
    }

    const loadDevelopment = async () => {
      try {
        const res = await apiGetDevelopment()
        if (res && res.code === 200 && Array.isArray(res.data)) {
          capabilities.value = res.data.map(item => ({
            icon: 'Picture',
            title: item.title,
            description: stripHtml(item.content) || stripHtml(item.description) || '',
            image: item.url
          }))
        }
      } catch (e) {}
    }

    const loadAdvantages = async () => {
      try {
        const res = await apiGetBannerUa()
        if (res && res.code === 200 && Array.isArray(res.data)) {
          features.value = res.data.map(item => ({
            icon: 'Picture',
            title: item.title || '优势',
            description: stripHtml(item.description) || '',
            image: item.url
          }))
        }
      } catch (e) {}
    }

    const loadSolutions = async () => {
      try {
        const res = await apiGetBannerScheme()
        if (res && res.code === 200 && Array.isArray(res.data)) {
          // 取不同的大类，或直接取前2条展示
          const list = res.data
          const grouped = {}
          list.forEach(i => {
            const key = i.bigIndustry || i.code || '分类'
            if (!grouped[key]) grouped[key] = []
            grouped[key].push(i)
          })
          const mapped = Object.keys(grouped).map(k => ({
            title: String(k),
            image: grouped[k][0]?.bigUrl || grouped[k][0]?.smallUrl
          }))
          solutions.value = mapped.slice(0, 2)
        }
      } catch (e) {}
    }

    const formatDate = (val) => {
      if (!val) return ''
      const d = new Date(val)
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${y}-${m}-${day}`
    }

    const loadNews = async () => {
      try {
        newsLoading.value = true
        const res = await apiGetNewsList({ pageSize: '2', pageNum: '1' })
        if (res && res.code === 200) {
          const rows = Array.isArray(res.rows) ? res.rows : []
          newsList.value = rows.slice(0, 2).map(item => ({
            id: item.tweetId || item.id,
            title: item.title,
            date: formatDate(item.releaseTime || item.createTime),
            image: item.logoUrl || banners.value[0]?.url || 'https://via.placeholder.com/120x120/EEE/999?text=News',
            content: item.content
          }))
        }
      } catch (e) {
        newsList.value = []
      } finally {
        newsLoading.value = false
      }
    }

    const goNewsDetail = (item) => {
      // 约定路由：/news/:id 或 /news/detail?id=
      // 这里采用查询参数，避免配置动态路由
      window.location.hash = `#/news?id=${encodeURIComponent(item.id)}`
    }

    onMounted(async () => {
      await Promise.all([
        loadBanner(),
        loadDevelopment(),
        loadAdvantages(),
        loadSolutions(),
        loadNews()
      ])
    })
    
    return {
      heroTags,
      capabilities,
      solutions,
      features,
      heroStyle,
      banners,
      newsList,
      newsLoading,
      goNewsDetail
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../assets/styles/main.scss';
.home {
  padding-top: 70px;
}

.hero {
  height: 420px;
  position: relative;
  overflow: hidden;
  
  .hero-slide {
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
    background: #f5f7fa; /* 避免等比缩放时两侧或上下留黑 */
    pointer-events: none; /* 不拦截触摸/鼠标拖动，便于手势切换 */
    user-select: none;
    -webkit-user-drag: none;
  }
  
  .hero-background {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, #4A90E2 0%, #357ABD 100%);
    display: flex;
    align-items: center;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('https://via.placeholder.com/1920x600/4A90E2/FFFFFF?text=工业4.0+智能制造') center/cover;
      opacity: 0.4;
    }
  }
  
  .hero-content {
    position: relative;
    z-index: 2;
    width: 100%;
    
    .hero-text {
      color: white;
      text-align: left;
      max-width: 600px;
      
      .hero-subtitle {
        font-size: 18px;
        margin-bottom: 10px;
        opacity: 0.9;
      }
      
      h1 {
        font-size: 48px;
        font-weight: bold;
        margin-bottom: 20px;
        line-height: 1.2;
      }
      
      p {
        font-size: 20px;
        margin-bottom: 30px;
        opacity: 0.9;
        line-height: 1.6;
      }
      
      .hero-tags {
        margin-bottom: 30px;
        
        .hero-tag {
          display: inline-block;
          padding: 8px 16px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 20px;
          margin-right: 10px;
          font-size: 14px;
          color: white;
        }
        
        .tag-separator {
          margin: 0 10px;
          opacity: 0.6;
        }
      }
      
      .hero-indicators {
        display: flex;
        gap: 10px;
        
        .indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.3);
          
          &.active {
            background: white;
          }
        }
      }
    }
  }
}

.capabilities {
  background: $background-color-light;
  
  .capabilities-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 30px;
  }
  
  .capability-card {
    padding: 40px 30px;
    text-align: center;
    
    .capability-icon {
      margin-bottom: 20px;
      
      .el-icon {
        color: $primary-color;
      }
    }
    
    h3 {
      font-size: 24px;
      margin-bottom: 20px;
      color: $text-color-primary;
    }
    
    p {
      color: $text-color-regular;
      line-height: 1.8;
      font-size: 16px;
    }
  }
}

.solutions-banner {
  .solutions-banner-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-top: 40px;
  }
  
  .solution-item {
    position: relative;
    border-radius: 12px;
    overflow: hidden;
    height: 300px;
    
    .solution-image {
      position: relative;
      width: 100%;
      height: 100%;
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      
      .solution-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        @include flex-center;
        
        h3 {
          color: white;
          font-size: 28px;
          font-weight: bold;
        }
      }
    }
  }
}

.why-choose {
  background: $background-color-light;
  
  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 30px;
  }
  
  .feature-card {
    padding: 30px 20px;
    text-align: center;
    
    .feature-icon {
      margin-bottom: 20px;
      
      .el-icon {
        color: $primary-color;
      }
    }
    
    h3 {
      font-size: 20px;
      margin-bottom: 15px;
      color: $text-color-primary;
    }
    
    p {
      color: $text-color-regular;
      line-height: 1.6;
      font-size: 14px;
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
  z-index: 1000;
  
  .floating-btn {
    width: 60px;
    height: 60px;
    padding: 0; /* 消除按钮内边距导致的视觉偏移 */
    margin: 0;  /* 保证两枚按钮水平位置完全一致 */
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 20px rgba(64, 158, 255, 0.3);
    transition: all 0.3s ease;
    
    &:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 25px rgba(64, 158, 255, 0.4);
    }
    
    .el-icon {
      font-size: 24px;
    }
  }
}

.news {
  .news-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-top: 24px;
  }

  .news-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px 20px;
    cursor: pointer;
    transition: background 0.2s ease;

    &:hover {
      background: #f8f9fb;
    }
  }

  .news-content {
    flex: 1;
    padding-right: 16px;
  }

  .news-title {
    font-size: 18px;
    color: $text-color-primary;
    margin: 0 0 8px 0;
    line-height: 1.5;
  }

  .news-date {
    font-size: 12px;
    color: $text-color-secondary;
  }

  .news-thumb {
    width: 90px;
    height: 90px;
    border-radius: 10px;
    overflow: hidden;
    flex-shrink: 0;
    background: #f2f3f5;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
  }

  .news-empty {
    text-align: center;
    color: $text-color-regular;
    padding: 24px 0;
  }
}

@media (max-width: 768px) {
  .hero {
    height: 300px;
    
    :deep(.el-carousel__container) {
      height: 300px !important;
    }
    
    .hero-content .hero-text {
      h1 {
        font-size: 32px;
      }
      
      h2 {
        font-size: 24px;
      }
      
      p {
        font-size: 16px;
      }
    }
  }
  
  .capabilities .capabilities-grid,
  .solutions-banner .solutions-banner-content,
  .why-choose .features-grid {
    grid-template-columns: 1fr;
  }
  
  .floating-actions {
    right: 15px;
    
    .floating-btn {
      width: 50px;
      height: 50px;
      
      .el-icon {
        font-size: 20px;
      }
    }
  }
}
</style>
