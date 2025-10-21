<template>
  <div class="home">
    <Header />
    
    <!-- 轮播图区域 -->
    <section class="hero-carousel">
      <div class="carousel-container">
        <div class="carousel-wrapper" :style="{ transform: `translateX(-${currentSlide * 100}%)` }">
          <div 
            v-for="(slide, index) in carouselSlides" 
            :key="index"
            class="carousel-slide"
          >
            <div class="slide-image">
              <img :src="slide.image" :alt="slide.title" />
            </div>
            <div class="slide-content">
              <div class="container">
                <div class="slide-text">
                  <div class="hero-subtitle">{{ slide.subtitle }}</div>
                  <h1>{{ slide.title }}</h1>
                  <p>{{ slide.description }}</p>
                  <div class="hero-tags" v-if="slide.tags">
                    <span v-for="(tag, tagIndex) in slide.tags" :key="tag" class="hero-tag">
                      {{ tag }}
                      <span v-if="tagIndex < slide.tags.length - 1" class="tag-separator">|</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 轮播图指示器 -->
        <div class="carousel-indicators">
          <span 
            v-for="(slide, index) in carouselSlides" 
            :key="index"
            :class="['indicator', { active: currentSlide === index }]"
            @click="goToSlide(index)"
          ></span>
        </div>
        
        <!-- 轮播图控制按钮 -->
        <div class="carousel-controls">
          <button class="control-btn prev" @click="prevSlide">
            <el-icon><ArrowLeft /></el-icon>
          </button>
          <button class="control-btn next" @click="nextSlide">
            <el-icon><ArrowRight /></el-icon>
          </button>
        </div>
      </div>
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
import { ref, onMounted, onUnmounted } from 'vue'
import Header from '../components/Header.vue'
import Footer from '../components/Footer.vue'

export default {
  name: 'Home',
  components: {
    Header,
    Footer
  },
  setup() {
    const currentSlide = ref(0)
    const autoPlayTimer = ref(null)
    
    const carouselSlides = ref([
      {
        image: require('../assets/image/ban1.png'),
        subtitle: '客户服务系统',
        title: '售后服务工单CSS',
        description: '更满意的客户 更高效的服务 更轻松的管理',
        tags: ['全渠道报修', '工单过程监控', '配件', '结算', '客户评价', '大数据分析']
      },
      {
        image: require('../assets/image/ban2.png'),
        subtitle: '工业4.0解决方案',
        title: '智能制造系统',
        description: '数字化转型 智能生产 高效管理',
        tags: ['MES系统', '设备监控', '数据分析', '质量控制', '生产优化']
      },
      {
        image: require('../assets/image/ban3.png'),
        subtitle: '电商平台开发',
        title: '全渠道电商解决方案',
        description: '一站式电商平台 多渠道管理 智能营销',
        tags: ['B2C商城', 'B2B平台', 'O2O系统', '跨境电商', '移动端']
      },
      {
        image: require('../assets/image/ban4.png'),
        subtitle: '微信生态开发',
        title: '微信小程序与公众号',
        description: '微信生态全栈开发 小程序定制 公众号运营',
        tags: ['小程序开发', '公众号开发', '企业微信', '微信支付', '用户管理']
      },
      {
        image: require('../assets/image/ban5.png'),
        subtitle: '数据可视化',
        title: '智能数据分析平台',
        description: '数据驱动决策 实时监控 智能分析',
        tags: ['数据大屏', '实时监控', '报表分析', '预测分析', 'BI系统']
      }
    ])
    
    const heroTags = ref([
      '全渠道报修',
      '工单过程监控',
      '配件',
      '结算',
      '客户评价',
      '大数据分析'
    ])
    
    const capabilities = ref([
      {
        icon: 'Monitor',
        title: '响应式网站与平台开发',
        description: '专业开发跨设备适配的现代Web应用与后台管理系统，结合前沿前端与后端技术，构建体验流畅、性能卓越、安全稳定的在线业务平台与数据可视化界面。'
      },
      {
        icon: 'Setting',
        title: '工业上位机与监控系统开发',
        description: '专业定制工业上位机系统、生产监控看板及数据采集与监控控制系统，致力于实现生产设备的实时数据采集、工艺流程可视化、智能报警与高效控制。'
      },
      {
        icon: 'ChatDotRound',
        title: '微信生态开发',
        description: '专业定制微信小程序、微信公众号、企业微信应用，包括工业设备监控小程序、移动巡检系统、微信服务号消息推送、微商城工业配件销售等。'
      }
    ])
    
    const solutions = ref([
      {
        title: '工厂制造业',
        image: 'https://via.placeholder.com/500x300/4A90E2/FFFFFF?text=工厂制造业'
      },
      {
        title: '服务快消',
        image: 'https://via.placeholder.com/500x300/7ED321/FFFFFF?text=服务快消'
      }
    ])
    
    const features = ref([
      {
        icon: 'User',
        title: '超强技术团队',
        description: '拥有80%以上本科学历的研发团队，常年服务ABB、奔驰、比亚迪等知名企业'
      },
      {
        icon: 'Clock',
        title: '售后及时响应',
        description: '7x24小时技术支持，快速响应客户需求，确保项目稳定运行'
      },
      {
        icon: 'Heart',
        title: '完整的服务流程',
        description: '从需求分析到项目交付，提供端到端的完整解决方案'
      },
      {
        icon: 'Box',
        title: '产品专业定制',
        description: '深度理解客户需求，提供个性化的定制化软件服务'
      }
    ])
    
    // 轮播图控制方法
    const nextSlide = () => {
      currentSlide.value = (currentSlide.value + 1) % carouselSlides.value.length
    }
    
    const prevSlide = () => {
      currentSlide.value = currentSlide.value === 0 ? carouselSlides.value.length - 1 : currentSlide.value - 1
    }
    
    const goToSlide = (index) => {
      currentSlide.value = index
    }
    
    const startAutoPlay = () => {
      autoPlayTimer.value = setInterval(() => {
        nextSlide()
      }, 5000) // 5秒自动切换
    }
    
    const stopAutoPlay = () => {
      if (autoPlayTimer.value) {
        clearInterval(autoPlayTimer.value)
        autoPlayTimer.value = null
      }
    }
    
    // 生命周期钩子
    onMounted(() => {
      startAutoPlay()
    })
    
    onUnmounted(() => {
      stopAutoPlay()
    })
    
    return {
      currentSlide,
      carouselSlides,
      heroTags,
      capabilities,
      solutions,
      features,
      nextSlide,
      prevSlide,
      goToSlide,
      startAutoPlay,
      stopAutoPlay
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../assets/styles/main.scss';
.home {
  padding-top: 70px;
}

.hero-carousel {
  height: 600px;
  position: relative;
  overflow: hidden;
  
  .carousel-container {
    position: relative;
    width: 100%;
    height: 100%;
  }
  
  .carousel-wrapper {
    display: flex;
    width: 500%; // 5张图片
    height: 100%;
    transition: transform 0.5s ease-in-out;
  }
  
  .carousel-slide {
    width: 20%; // 100% / 5
    height: 100%;
    position: relative;
    
    .slide-image {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
    
    .slide-content {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.4);
      display: flex;
      align-items: center;
      z-index: 2;
      
      .slide-text {
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
      }
    }
  }
  
  .carousel-indicators {
    position: absolute;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 10px;
    z-index: 3;
    
    .indicator {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.5);
      cursor: pointer;
      transition: all 0.3s ease;
      
      &:hover {
        background: rgba(255, 255, 255, 0.8);
      }
      
      &.active {
        background: white;
        transform: scale(1.2);
      }
    }
  }
  
  .carousel-controls {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 100%;
    display: flex;
    justify-content: space-between;
    padding: 0 30px;
    z-index: 3;
    
    .control-btn {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.3);
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      
      &:hover {
        background: rgba(255, 255, 255, 0.3);
        transform: scale(1.1);
      }
      
      .el-icon {
        font-size: 20px;
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

@media (max-width: 768px) {
  .hero-carousel {
    height: 500px;
    
    .carousel-slide .slide-content .slide-text {
      h1 {
        font-size: 32px;
      }
      
      p {
        font-size: 16px;
      }
      
      .hero-tags {
        .hero-tag {
          font-size: 12px;
          padding: 6px 12px;
        }
      }
    }
    
    .carousel-controls {
      padding: 0 15px;
      
      .control-btn {
        width: 40px;
        height: 40px;
        
        .el-icon {
          font-size: 16px;
        }
      }
    }
    
    .carousel-indicators {
      bottom: 20px;
      
      .indicator {
        width: 10px;
        height: 10px;
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
