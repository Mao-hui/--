<template>
  <div class="home">
    <Header />
    
    <!--  -->
    <section class="hero">
      <!-- 有 banner 数据用轮播展示 -->
      <el-carousel 
        v-if="banners.length > 0" 
        :interval="3000" 
        height="360px" 
        arrow="always" 
        indicator-position="outside"
        trigger="click"
      >
        <el-carousel-item v-for="item in banners" :key="item.id">
          <!-- <img :src="item.url" alt="banner" class="hero-slide" /> -->
          <el-image
            style="width: 100px; height: 100px"
            :src="item.url"
            fit="scale-down"></el-image>
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
            @click="goToProducts"
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
    
    <!-- 解决方案（与移动端一致的主分类/子类型切换） -->
    <section class="solutions-banner section">
      <div class="container">
        <h2 class="section-title">解决方案</h2>
        
        <!-- 主分类视图 -->
        <div v-if="!showSubtypes" class="solutions-banner-content">
          <div 
            v-for="item in solutionsList" 
            :key="item.title" 
            class="solution-item"
            @click="showSolutionSubtypes(item)"
          >
            <div class="solution-image">
              <img :src="item.image" :alt="item.title" />
              <div class="solution-overlay">
                <h3>{{ item.title }}</h3>
              </div>
            </div>
          </div>
        </div>

        <!-- 子类型视图 -->
        <div v-else class="solutions-banner-content">
          <div v-if="showSubtypes" class="back-button" @click="backToMainCategories">
            <el-icon class="back-arrow"><ArrowUp /></el-icon>
          </div>
          <div 
            v-for="sub in currentSolutionSubtypes" 
            :key="sub.title" 
            class="solution-item"
            @click="viewSubtypeDetail(sub)"
          >
            <div class="solution-image">
              <img :src="sub.image" :alt="sub.title" />
              <div class="solution-overlay">
                <h3>{{ sub.title }}</h3>
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
    
    <Footer />
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import Header from '../components/Header.vue'
import Footer from '../components/Footer.vue'
import { apiGetBanner, apiGetDevelopment, apiGetBannerUa, apiGetBannerScheme, apiGetNewsList, apiGetScheme } from '@/api'

export default {
  name: 'Home',
  components: {
    Header,
    Footer
  },
  setup() {
    const router = useRouter()
    
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
    // PC 解决方案（主分类/子类型结构）
    const solutionsList = ref([])
    const showSubtypes = ref(false)
    const currentSolution = ref(null)
    const currentSolutionSubtypes = ref([])
    
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
        // 使用 PC 首页接口：与移动端一致的数据结构
        const res = await apiGetScheme()
        if (res && res.code === 200 && Array.isArray(res.data)) {
          const list = res.data
          // 按大类分组
          const groupMap = {}
          list.forEach(item => {
            const big = item.bigIndustryName || '其他'
            if (!groupMap[big]) groupMap[big] = []
            groupMap[big].push(item)
          })
          // 转换为主分类/子类型结构
          const mapped = Object.keys(groupMap).map(bigName => {
            const children = groupMap[bigName]
            const subtypes = children.map(c => ({
              title: c.smallIndustryName,
              image: c.smallIndustryUrl || c.bigIndustryUrl,
              type: c.smallIndustryName,
              bigIndustryId: c.bigIndustryId, // 保存大类ID用于跳转
              bigIndustryName: c.bigIndustryName // 保存大类名称用于跳转
            }))
            return {
              title: bigName,
              image: children[0]?.bigIndustryUrl || children[0]?.smallIndustryUrl,
              subtypes
            }
          })
          solutionsList.value = mapped
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
      // 跳转到新闻列表页面
      router.push('/news')
    }

    const showSolutionSubtypes = (solution) => {
      currentSolution.value = solution
      currentSolutionSubtypes.value = solution?.subtypes || []
      showSubtypes.value = true
    }

    const backToMainCategories = () => {
      showSubtypes.value = false
      currentSolution.value = null
      currentSolutionSubtypes.value = []
    }

    const viewSubtypeDetail = (sub) => {
      // 跳转到解决方案页面，并传递大类ID参数
      if (sub && sub.bigIndustryId) {
        router.push({
          path: '/solutions',
          query: {
            bigIndustryId: sub.bigIndustryId
          }
        })
      } else {
        // 如果没有大类ID，直接跳转到解决方案页面
        router.push('/solutions')
      }
    }

    const goToProducts = () => {
      router.push('/products')
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
      solutionsList,
      showSubtypes,
      currentSolution,
      currentSolutionSubtypes,
      features,
      heroStyle,
      banners,
      newsList,
      newsLoading,
      goNewsDetail,
      showSolutionSubtypes,
      backToMainCategories,
      viewSubtypeDetail,
      goToProducts
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
  height: 480px;
  position: relative;
  overflow: hidden;
  width: 100%;
  
  :deep(.el-carousel) {
    width: 100%;
    height: 100%;
  }
  
  :deep(.el-carousel__container) {
    width: 100%;
    height: 100%;
  }
  
  :deep(.el-carousel__item) {
    width: 100%;
    height: 100%;
  }
  
  :deep(.el-carousel__arrow) {
    width: 50px;
    height: 50px;
    background-color: rgba(255, 255, 255, 0.9);
    border: none;
    color: $primary-color;
    transition: all 0.3s ease;
    
    &:hover {
      background-color: $primary-color;
      color: white;
      transform: scale(1.1);
    }
  }
  
  :deep(.el-carousel__indicators) {
    .el-carousel__indicator {
      .el-carousel__button {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background-color: rgba(255, 255, 255, 0.5);
        transition: all 0.3s ease;
      }
      
      &.is-active .el-carousel__button {
        background-color: white;
        width: 30px;
        border-radius: 5px;
      }
    }
  }
  
  .hero-slide {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    pointer-events: none;
    user-select: none;
    -webkit-user-drag: none;
    transition: transform 0.5s ease;
  }
}

.capabilities {
  background: linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%);
  
  .capabilities-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 24px;
    margin-top: 40px;
  }
  
  .capability-card {
    padding: 32px 28px;
    text-align: center;
    position: relative;
    overflow: hidden;
    border: 1px solid rgba(64, 158, 255, 0.1);
    cursor: pointer;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(64, 158, 255, 0.05), transparent);
      transition: left 0.5s ease;
    }
    
    &:hover {
      transform: translateY(-8px);
      box-shadow: 0 12px 40px rgba(64, 158, 255, 0.2);
      border-color: rgba(64, 158, 255, 0.3);
      
      &::before {
        left: 100%;
      }
      
      .capability-icon {
        transform: scale(1.15) rotate(5deg);
        
        .el-icon {
          color: $primary-color;
        }
      }
    }
    
    .capability-icon {
      margin-bottom: 18px;
      transition: transform 0.3s ease;
      
      .el-icon {
        color: $primary-color;
        transition: color 0.3s ease;
        font-size: 48px;
      }
    }
    
    h3 {
      font-size: 20px;
      margin-bottom: 14px;
      color: $text-color-primary;
      font-weight: 600;
      transition: color 0.3s ease;
    }
    
    p {
      color: $text-color-regular;
      line-height: 1.7;
      font-size: 14px;
      margin: 0;
    }
  }
}

.solutions-banner {
  background: white;
  
  .solutions-banner-content {
    position: relative;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-top: 28px;
  }
  
  .back-button {
    position: absolute;
    top: -20px;
    right: 20px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: white;
    cursor: pointer;
    transition: all 0.3s ease;
    z-index: 10;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    
    &:hover {
      background: $primary-color;
      transform: scale(1.1);
      box-shadow: 0 6px 20px rgba(64, 158, 255, 0.4);
      
      .back-arrow {
        color: white;
      }
    }
  }

  .back-arrow {
    transform: rotate(270deg);
    transition: color 0.3s ease;
    color: $primary-color;
  }
  
  .solution-item {
    position: relative;
    border-radius: 8px;
    overflow: hidden;
    height: 160px;
    cursor: pointer;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    
    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.2);
      
      .solution-image {
        img {
          transform: scale(1.03);
        }
        
        .solution-overlay {
          background: linear-gradient(135deg, rgba(64, 158, 255, 0.85) 0%, rgba(37, 122, 189, 0.85) 100%);
          
          h3 {
            transform: scale(1.02);
          }
        }
      }
    }
    
    .solution-image {
      position: relative;
      width: 100%;
      height: 100%;
      overflow: hidden;
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
      }
      
      .solution-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0.4) 100%);
        @include flex-center;
        transition: background 0.4s ease;
        
        h3 {
          color: white;
          font-size: 18px;
          font-weight: 600;
          text-align: center;
          padding: 0 10px;
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
          transition: transform 0.3s ease;
        }
      }
    }
  }
}

.why-choose {
  background: linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%);
  
  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 24px;
    margin-top: 40px;
  }
  
  .feature-card {
    padding: 28px 24px;
    text-align: center;
    position: relative;
    background: white;
    border-radius: 10px;
    transition: all 0.3s ease;
    border: 1px solid rgba(64, 158, 255, 0.1);
    
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, $primary-color, #66B1FF);
      transform: scaleX(0);
      transform-origin: left;
      transition: transform 0.3s ease;
    }
    
    &:hover {
      transform: translateY(-6px);
      box-shadow: 0 10px 35px rgba(64, 158, 255, 0.15);
      
      &::after {
        transform: scaleX(1);
      }
      
      .feature-icon {
        transform: translateY(-5px) scale(1.1);
        
        .el-icon {
          color: $primary-color;
        }
      }
      
      h3 {
        color: $primary-color;
      }
    }
    
    .feature-icon {
      margin-bottom: 18px;
      transition: transform 0.3s ease;
      
      .el-icon {
        color: $primary-color;
        transition: color 0.3s ease;
        font-size: 42px;
      }
    }
    
    h3 {
      font-size: 18px;
      margin-bottom: 12px;
      color: $text-color-primary;
      font-weight: 600;
      transition: color 0.3s ease;
    }
    
    p {
      color: $text-color-regular;
      line-height: 1.7;
      font-size: 14px;
      margin: 0;
    }
  }
}

.news {
  background: linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%);
  
  .news-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-top: 32px;
  }

  .news-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px 22px;
    cursor: pointer;
    transition: all 0.3s ease;
    border-left: 4px solid transparent;
    position: relative;
    overflow: hidden;
    
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 4px;
      background: linear-gradient(180deg, $primary-color, #66B1FF);
      transform: scaleY(0);
      transform-origin: top;
      transition: transform 0.3s ease;
    }

    &:hover {
      transform: translateX(8px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
      border-left-color: $primary-color;
      
      &::before {
        transform: scaleY(1);
      }
      
      .news-title {
        color: $primary-color;
      }
      
      .news-thumb {
        img {
          transform: scale(1.1);
        }
      }
    }
  }

  .news-content {
    flex: 1;
    padding-right: 20px;
  }

  .news-title {
    font-size: 17px;
    color: $text-color-primary;
    margin: 0 0 8px 0;
    line-height: 1.5;
    font-weight: 600;
    transition: color 0.3s ease;
  }

  .news-date {
    font-size: 13px;
    color: $text-color-secondary;
    display: flex;
    align-items: center;
    
    &::before {
      content: '📅';
      margin-right: 6px;
    }
  }

  .news-thumb {
    width: 100px;
    height: 100px;
    border-radius: 10px;
    overflow: hidden;
    flex-shrink: 0;
    background: #f2f3f5;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      transition: transform 0.4s ease;
    }
  }

  .news-empty {
    text-align: center;
    color: $text-color-regular;
    padding: 32px 0;
    font-size: 15px;
  }
}

@media (max-width: 768px) {
  .hero {
    height: 320px;
    
    :deep(.el-carousel__container) {
      height: 320px !important;
    }
    
    :deep(.el-carousel__arrow) {
      width: 40px;
      height: 40px;
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
  
  .section-title {
    font-size: 28px;
  }
  
  .capabilities {
    .capabilities-grid {
      grid-template-columns: 1fr;
      gap: 20px;
      margin-top: 30px;
    }
    
    .capability-card {
      padding: 28px 20px;
      
      .capability-icon .el-icon {
        font-size: 40px;
      }
      
      h3 {
        font-size: 18px;
        margin-bottom: 12px;
      }
      
      p {
        font-size: 13px;
      }
    }
  }
  
  .solutions-banner {
    .solutions-banner-content {
      grid-template-columns: 1fr;
      gap: 12px;
      margin-top: 20px;
    }
    
    .solution-item {
      height: 140px;
      
      .solution-image .solution-overlay h3 {
        font-size: 16px;
      }
    }
    
    .back-button {
      top: -15px;
      right: 15px;
      width: 36px;
      height: 36px;
    }
  }
  
  .why-choose {
    .features-grid {
      grid-template-columns: 1fr;
      gap: 20px;
      margin-top: 30px;
    }
    
    .feature-card {
      padding: 24px 18px;
      
      .feature-icon .el-icon {
        font-size: 36px;
      }
      
      h3 {
        font-size: 16px;
        margin-bottom: 10px;
      }
      
      p {
        font-size: 13px;
      }
    }
  }
  
  .news {
    .news-item {
      flex-direction: column;
      align-items: flex-start;
      padding: 20px;
      
      .news-thumb {
        width: 100%;
        height: 160px;
        margin-top: 12px;
      }
      
      .news-content {
        padding-right: 0;
      }
      
      .news-title {
        font-size: 16px;
      }
    }
  }
}
</style>
