<template>
  <div class="solutions">
    <Header />
    
    <!-- Banner区域 -->
    <div class="banner-section" :style="bannerStyle">
      <div class="banner-content">
        <div class="banner-overlay">
          <h1 class="banner-title">行业解决方案</h1>
          <p class="banner-subtitle">赋能垂直领域,驱动业务增长</p>
        </div>
      </div>
    </div>
    
    <div class="solutions-content">
      <div class="container">
        <!-- 分类网格 -->
        <div class="category-grid-wrapper">
          <div class="category-grid">
            <div 
              v-for="category in bigCategories" 
              :key="category.key"
              :class="['category-item', { active: activeBig === category.key }]"
              @click="setActiveBig(category.key)"
            >
              {{ category.name }}
            </div>
          </div>
        </div>
        
        <!-- 内容：当前行业下的方案列表 -->
        <div class="solution-content">
          <div class="solution-detail">
            <div class="solution-banner" v-if="currentBig">
              <div class="banner-content">
                <h2>{{ currentBig.name }}</h2>
              </div>
              <div class="banner-image" v-if="currentBig.url">
                <img :src="currentBig.url" :alt="currentBig.name" />
              </div>
            </div>
            <div class="section">
              <h3 style="margin-bottom: 20px;">精选方案</h3>
              <div v-if="loading" class="loading">加载中...</div>
              <div v-else>
                <div v-if="error" class="error">{{ error }}</div>
                <el-empty v-else-if="!currentSchemes.length" description="暂无方案" />
                <div v-else class="schemes-grid">
                  <div class="scheme-card card" v-for="s in currentSchemes" :key="s.id">
                    <div class="scheme-cover">
                      <img :src="s.smallUrl || currentBig.url" :alt="s.smallName" />
                    </div>
                    <div class="scheme-body">
                      <h4 class="scheme-title">{{ s.schemeName }}</h4>
                      <p class="scheme-sub">{{ s.bigName }} · {{ s.smallName }}</p>
                      <p class="scheme-desc">{{ s.brief }}</p>
                      <div class="scheme-tags">
                        <el-tag size="small">{{ s.bigName }}</el-tag>
                        <el-tag size="small">{{ s.smallName }}</el-tag>
                      </div>
                    </div>
                    <div class="scheme-actions">
                      <el-button type="primary" size="small" @click="openDetail(s)">查看详情</el-button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <Footer />
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import Header from '../components/Header.vue'
import Footer from '../components/Footer.vue'
import { apiGetScheme } from '@/api'
import soulImage from '@/assets/image/soul.png'

export default {
  name: 'Solutions',
  components: {
    Header,
    Footer
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const loading = ref(false)
    const error = ref('')
    const bigCategories = ref([])
    const activeBig = ref('')
    const bigToSchemes = ref({})
    
    const ecommerceModels = ref([
      {
        name: 'B2C零售商城',
        icon: 'Shop',
        description: '专注会员和流量，为品牌商和零售商提供运营策略和流量工具'
      },
      {
        name: 'B2B2C多商户零售商城',
        icon: 'OfficeBuilding',
        description: '为大中型企业打造多商户零售平台，整合上下游供应链资源'
      },
      {
        name: 'B2B采购商城',
        icon: 'Truck',
        description: '为经销商或品牌供应商提供订货系统，支持多种分销模式'
      },
      {
        name: 'O2O多门店零售',
        icon: 'Location',
        description: '为新零售提供线上管理工具，实现多门店统一管理'
      },
      {
        name: '跨境电商系统',
        icon: 'Globe',
        description: '支持海淘或出口网站，对接海关数据，处理各种税费计算'
      },
      {
        name: 'S2B2C新零售平台',
        icon: 'Connection',
        description: '整合上游供应链资源，赋能零售终端，实现供应链协同'
      }
    ])
    
    const ecommerceFeatures = ref([
      {
        name: '商品管理',
        icon: 'Box',
        items: [
          '手动创建商品',
          'Excel批量导入',
          '多区域仓库管理',
          '缺货登记',
          '到货通知',
          '库存预警'
        ]
      },
      {
        name: '会员管理',
        icon: 'User',
        items: [
          '会员信息管理',
          '等级积分策略',
          '积分商城',
          '预存款卡',
          '咨询评价互动',
          '会员行为分析'
        ]
      },
      {
        name: '订单管理',
        icon: 'Document',
        items: [
          '订单管理',
          '退换货售后管理',
          '订单拣货',
          '打包出库流程',
          '订单状态跟踪',
          '批量操作'
        ]
      },
      {
        name: '物流管理',
        icon: 'Truck',
        items: [
          '第三方物流对接',
          '物流状态实时显示',
          '运费计算',
          '物流轨迹跟踪',
          '异常处理',
          '物流报表'
        ]
      },
      {
        name: '营销管理',
        icon: 'Promotion',
        items: [
          '推广员分销',
          '拼团购买',
          '优惠券系统',
          '秒杀活动',
          '满减满赠',
          '积分商城'
        ]
      },
      {
        name: '智能看板/数据分析',
        icon: 'DataAnalysis',
        items: [
          '流量数据分析',
          '交易数据分析',
          '会员生命周期分析',
          '商品销售分析',
          '运营效率提升',
          '数据可视化'
        ]
      }
    ])
    
    const manufacturingSystems = ref([
      {
        name: 'MES制造执行系统',
        icon: 'Monitor',
        description: '生产计划管理、工艺路线管理、生产进度跟踪、质量控制'
      },
      {
        name: 'WMS仓储管理系统',
        icon: 'Box',
        description: '入库管理、出库管理、库存盘点、智能补货、库存优化'
      },
      {
        name: '设备监控系统',
        icon: 'Warning',
        description: '设备状态监控、故障预警、维护计划、设备效率分析'
      },
      {
        name: '质量管理系统',
        icon: 'Check',
        description: '检验标准管理、不良品管理、质量追溯、统计分析'
      }
    ])
    
    const setActiveBig = (key) => {
      if (activeBig.value === key) return
      activeBig.value = key
      // 滚动到顶部
      const mainContent = document.querySelector('.solution-content')
      if (mainContent) {
        mainContent.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
    
    const stripHtml = (html) => {
      if (!html) return ''
      return String(html).replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim()
    }
    const loadSchemes = async () => {
      loading.value = true
      error.value = ''
      try {
        const res = await apiGetScheme()
        if (res && res.code === 200 && Array.isArray(res.data)) {
          const bigMap = new Map()
          const bucket = {}
          res.data.forEach((it, idx) => {
            const bigKey = `big-${it.bigIndustryId}`
            if (!bigMap.has(bigKey)) {
              bigMap.set(bigKey, { key: bigKey, name: it.bigIndustryName, url: it.bigIndustryUrl })
              bucket[bigKey] = []
            }
            bucket[bigKey].push({
              id: it.schemeId || idx,
              schemeName: it.schemeName,
              description: it.description || '',
              brief: stripHtml(it.description) || '—',
              bigName: it.bigIndustryName,
              smallName: it.smallIndustryName,
              smallUrl: it.smallIndustryUrl
            })
          })
          bigCategories.value = Array.from(bigMap.values())
          bigToSchemes.value = bucket
          
          // 检查路由查询参数，如果有 bigIndustryId，则设置对应的 activeBig
          const queryBigId = route.query.bigIndustryId
          if (queryBigId) {
            const targetKey = `big-${queryBigId}`
            const targetCategory = bigCategories.value.find(cat => cat.key === targetKey)
            if (targetCategory) {
              activeBig.value = targetKey
            } else if (bigCategories.value.length) {
              activeBig.value = bigCategories.value[0].key
            }
          } else if (bigCategories.value.length) {
            activeBig.value = bigCategories.value[0].key
          }
        } else {
          error.value = (res && (res.msg || res.message)) || '加载失败'
        }
      } catch (e) {
        error.value = '加载失败，请稍后重试'
      } finally {
        loading.value = false
      }
    }
    const openDetail = (item) => {
      if (!item || !item.id) {
        ElMessage.error('方案信息不完整')
        return
      }
      
      // 通过路由跳转到解决方案详情页
      router.push({
        path: '/solution-detail',
        query: {
          schemeId: item.id,
          bigIndustryId: item.bigIndustryId
        }
      })
    }
    const currentBig = computed(() => bigCategories.value.find(b => b.key === activeBig.value))
    const currentSchemes = computed(() => bigToSchemes.value[activeBig.value] || [])
    
    const bannerStyle = computed(() => {
      // 使用本地图片
      return {
        backgroundImage: `url('${soulImage}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }
    })
    
    onMounted(() => {
      loadSchemes()
    })
    
    return {
      loading,
      error,
      bigCategories,
      activeBig,
      currentBig,
      currentSchemes,
      ecommerceModels,
      ecommerceFeatures,
      manufacturingSystems,
      setActiveBig,
      openDetail,
      bannerStyle
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../assets/styles/main.scss';
.solutions {
  padding-top: 70px;
}

.banner-section {
  position: relative;
  overflow: hidden;
  height: 450px;
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
    background: linear-gradient(135deg, rgba(0, 0, 0, 0.45) 0%, rgba(0, 0, 0, 0.25) 100%);
    z-index: 1;
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 100px;
    background: linear-gradient(to top, rgba(250, 250, 250, 0.3), transparent);
    z-index: 2;
  }
  
  .banner-content {
    position: relative;
    z-index: 2;
    width: 100%;
    max-width: 800px;
    margin: 0 auto;
    padding: 0 16px;
  }
  
  .banner-overlay {
    padding: 0;
    text-align: left;
  }
  
  .banner-title {
    font-size: 52px;
    font-weight: bold;
    color: white;
    margin-bottom: 20px;
    text-shadow: 0 4px 20px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(64, 158, 255, 0.3);
    line-height: 1.2;
    letter-spacing: 1px;
    animation: fadeInUp 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .banner-subtitle {
    font-size: 22px;
    color: white;
    opacity: 0.95;
    text-shadow: 0 2px 12px rgba(0, 0, 0, 0.4);
    line-height: 1.5;
    letter-spacing: 0.5px;
    animation: fadeInUp 0.8s 0.2s cubic-bezier(0.4, 0, 0.2, 1) backwards;
  }
  
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
}

.solutions-content {
  padding: 80px 0;
  background: linear-gradient(180deg, $background-color-light 0%, #ffffff 50%, $background-color-light 100%);
  min-height: 600px;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 300px;
    background: radial-gradient(ellipse at top, rgba(64, 158, 255, 0.05) 0%, transparent 70%);
    pointer-events: none;
  }
}

// 分类网格样式（与产品中心一致）
.category-grid-wrapper {
  margin-bottom: 50px;
  position: relative;
  z-index: 1;
  
  .category-grid {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    gap: 0;
    border: 1px solid rgba(64, 158, 255, 0.15);
    border-radius: 12px;
    overflow: hidden;
    background: white;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
    
      .category-item {
        padding: 14px 20px;
        text-align: center;
        font-size: 15px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        background: white;
        color: $text-color-regular;
        border-right: 1px solid $border-color-base;
        border-bottom: 1px solid $border-color-base;
        position: relative;
        line-height: 1.5;
        white-space: nowrap;
      
      // 去除每行最后一列的右边框
      &:nth-child(8n) {
        border-right: none;
      }
      
      &:hover:not(.active) {
        background: rgba(64, 158, 255, 0.08);
        color: $primary-color;
      }
      
      &.active {
        background: $primary-color;
        color: white;
        font-weight: 600;
      }
    }
  }
}

.solution-content {
  .solution-detail {
    .solution-banner {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 28px;
      align-items: center;
      margin-bottom: 40px;
      background: white;
      padding: 28px;
      border-radius: 10px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      
      .banner-content {
        h2 {
          font-size: 28px;
          color: $text-color-primary;
          margin: 0;
        }
      }
      
      .banner-image {
        img {
          width: 100%;
          height: 200px;
          object-fit: cover;
          box-shadow: 0 8px 20px rgba(0,0,0,.1);
        }
      }
    }
    
    .solution-sections {
      .section {
        margin-bottom: 60px;
        
        h3 {
          font-size: 28px;
          color: $text-color-primary;
          margin-bottom: 30px;
          text-align: center;
        }
        
        .models-grid,
        .systems-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 25px;
        }
        
        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 25px;
        }
        
        .model-card,
        .system-card {
          padding: 30px 20px;
          text-align: center;
          transition: transform .25s ease, box-shadow .25s ease;
          
          .model-icon,
          .system-icon {
            margin-bottom: 20px;
            
            .el-icon { color: $primary-color; }
          }
          
          h4 { font-size: 20px; color: $text-color-primary; margin-bottom: 15px; }
          p { color: $text-color-regular; line-height: 1.6; }
          &:hover { transform: translateY(-4px); box-shadow: 0 10px 24px rgba(0,0,0,.08); }
        }
        
        .feature-card {
          padding: 25px;
          
          .feature-header {
            @include flex-center;
            gap: 10px;
            margin-bottom: 20px;
            
            .el-icon {
              color: $primary-color;
            }
            
            h4 {
              font-size: 18px;
              color: $text-color-primary;
              margin: 0;
            }
          }
          
          .feature-list {
            list-style: none;
            padding: 0;
            
            li {
              padding: 8px 0;
              color: $text-color-regular;
              border-bottom: 1px solid $border-color-lighter;
              
              &:last-child {
                border-bottom: none;
              }
              
              &::before {
                content: '•';
                color: $primary-color;
                font-weight: bold;
                margin-right: 8px;
              }
            }
          }
        }
      }
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
  
  .solution-content .solution-detail .solution-banner {
    grid-template-columns: 1fr;
    gap: 16px;
    padding: 20px;
    
    .banner-content h2 {
      font-size: 22px;
      margin: 0;
    }
    
    .banner-image img {
      height: 160px;
    }
  }
  
  .models-grid,
  .systems-grid,
  .features-grid {
    grid-template-columns: 1fr !important;
  }
}

/* 新增：方案卡样式与通用状态样式 */
.solution-content {
  .schemes-grid { 
    display: grid; 
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); 
    gap: 24px; 
    position: relative;
    z-index: 1;
  }
  
  .scheme-card { 
    display: flex; 
    flex-direction: column; 
    padding: 0; 
    overflow: hidden; 
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); 
    border-radius: 12px;
    border: 1px solid rgba(64, 158, 255, 0.12);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
    position: relative;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, $primary-color, $primary-light);
      transform: scaleX(0);
      transform-origin: left;
      transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      z-index: 1;
    }
  }
  
  .scheme-cover { 
    width: 100%; 
    height: 160px; 
    background: #f6f8fa; 
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); 
    overflow: hidden;
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.05) 100%);
    }
  }
  
  .scheme-cover img { 
    width: 100%; 
    height: 100%; 
    object-fit: cover; 
    transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1); 
  }
  
  .scheme-body { padding: 20px; }
  
  .scheme-title { 
    font-size: 17px; 
    margin: 0 0 8px; 
    color: $text-color-primary; 
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); 
    font-weight: 600;
    letter-spacing: 0.3px;
  }
  
  .scheme-sub { 
    margin: 0 0 10px; 
    color: $text-color-secondary; 
    font-size: 13px; 
  }
  
  .scheme-desc { 
    color: $text-color-regular; 
    font-size: 14px; 
    line-height: 1.7; 
    display: -webkit-box; 
    -webkit-line-clamp: 3; 
    line-clamp: 3; 
    -webkit-box-orient: vertical; 
    overflow: hidden; 
  }
  
  .scheme-tags { 
    margin-top: 12px; 
    display: flex; 
    gap: 6px; 
  }
  
  .scheme-actions { 
    padding: 12px 20px 16px; 
    display: flex; 
    justify-content: flex-end; 
  }
  
  .scheme-card:hover { 
    transform: translateY(-6px) scale(1.01); 
    box-shadow: 0 12px 32px rgba(64, 158, 255, 0.15);
    border-color: rgba($primary-color, 0.3);
    
    &::before {
      transform: scaleX(1);
    }
    
    .scheme-cover img { 
      transform: scale(1.1); 
    }
    
    .scheme-title { 
      color: $primary-color; 
      transform: translateX(3px);
    }
  }
}

.loading, .error { padding: 20px 0; color: $text-color-regular; }

/* 弹窗富文本优化 */
::v-deep(.el-dialog__body) {
  .rich-content img { max-width: 100%; display: block; margin: 12px 0; }
  .rich-content { max-height: 60vh; overflow: auto; line-height: 1.75; }
}
</style>
