<template>
  <div class="solutions">
    <Header />
    
    <div class="page-header">
      <div class="container">
        <h1>解决方案</h1>
        <p>专业的行业解决方案，助力企业数字化转型</p>
      </div>
    </div>
    
    <div class="solutions-content">
      <div class="container">
        <!-- 解决方案导航 -->
        <div class="solutions-nav">
          <div 
            v-for="solution in solutionCategories" 
            :key="solution.key"
            :class="['nav-item', { active: activeSolution === solution.key }]"
            @click="setActiveSolution(solution.key)"
          >
            <el-icon><component :is="solution.icon" /></el-icon>
            <span>{{ solution.name }}</span>
          </div>
        </div>
        
        <!-- 解决方案内容 -->
        <div class="solution-content">
          <!-- 电商平台解决方案 -->
          <div v-if="activeSolution === 'ecommerce'" class="solution-detail">
            <div class="solution-banner">
              <div class="banner-content">
                <h2>服务快消行业/电商平台</h2>
                <p>专业的电商解决方案，助力企业快速搭建电商平台</p>
              </div>
              <div class="banner-image">
                <img src="https://via.placeholder.com/600x400/4A90E2/FFFFFF?text=电商平台" alt="电商平台" />
              </div>
            </div>
            
            <div class="solution-sections">
              <!-- 常见电商模型 -->
              <div class="section">
                <h3>常见电商模型</h3>
                <div class="models-grid">
                  <div 
                    v-for="model in ecommerceModels" 
                    :key="model.name"
                    class="model-card card"
                  >
                    <div class="model-icon">
                      <el-icon :size="40">
                        <component :is="model.icon" />
                      </el-icon>
                    </div>
                    <h4>{{ model.name }}</h4>
                    <p>{{ model.description }}</p>
                  </div>
                </div>
              </div>
              
              <!-- 电商功能 -->
              <div class="section">
                <h3>电商功能</h3>
                <div class="features-grid">
                  <div 
                    v-for="feature in ecommerceFeatures" 
                    :key="feature.name"
                    class="feature-card card"
                  >
                    <div class="feature-header">
                      <el-icon :size="24">
                        <component :is="feature.icon" />
                      </el-icon>
                      <h4>{{ feature.name }}</h4>
                    </div>
                    <ul class="feature-list">
                      <li v-for="item in feature.items" :key="item">{{ item }}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 工业制造解决方案 -->
          <div v-if="activeSolution === 'manufacturing'" class="solution-detail">
            <div class="solution-banner">
              <div class="banner-content">
                <h2>工厂制造业解决方案</h2>
                <p>专业的工业4.0解决方案，助力制造业数字化转型</p>
              </div>
              <div class="banner-image">
                <img src="https://via.placeholder.com/600x400/7ED321/FFFFFF?text=工业制造" alt="工业制造" />
              </div>
            </div>
            
            <div class="solution-sections">
              <div class="section">
                <h3>核心系统</h3>
                <div class="systems-grid">
                  <div 
                    v-for="system in manufacturingSystems" 
                    :key="system.name"
                    class="system-card card"
                  >
                    <div class="system-icon">
                      <el-icon :size="40">
                        <component :is="system.icon" />
                      </el-icon>
                    </div>
                    <h4>{{ system.name }}</h4>
                    <p>{{ system.description }}</p>
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
import { ref, onMounted } from 'vue'
import Header from '../components/Header.vue'
import Footer from '../components/Footer.vue'
import { apiGetScheme } from '@/api'

export default {
  name: 'Solutions',
  components: {
    Header,
    Footer
  },
  setup() {
    const activeSolution = ref('')
    
    const solutionCategories = ref([])
    
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
    
    const setActiveSolution = (solutionKey) => {
      activeSolution.value = solutionKey
    }
    
    const loadSchemes = async () => {
      try {
        const res = await apiGetScheme()
        if (res && res.code === 200 && Array.isArray(res.data)) {
          // 以大类分组生成导航
          const group = {}
          res.data.forEach(item => {
            const key = item.bigIndustryName || item.bigIndustry || '其他'
            if (!group[key]) group[key] = []
            group[key].push(item)
          })
          solutionCategories.value = Object.keys(group).map((name, idx) => ({
            key: `cat_${idx}`,
            name,
            icon: 'Collection'
          }))
          // 默认选中第一类
          if (solutionCategories.value.length > 0) {
            activeSolution.value = solutionCategories.value[0].key
          }
        }
      } catch (e) {}
    }
    
    onMounted(() => {
      loadSchemes()
    })
    
    return {
      activeSolution,
      solutionCategories,
      ecommerceModels,
      ecommerceFeatures,
      manufacturingSystems,
      setActiveSolution
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../assets/styles/main.scss';
.solutions {
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

.solutions-content {
  padding: 60px 0;
  background: $background-color-light;
  min-height: 600px;
}

.solutions-nav {
  display: flex;
  justify-content: center;
  margin-bottom: 40px;
  background: white;
  border-radius: 8px;
  padding: 10px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  
  .nav-item {
    @include flex-center;
    gap: 8px;
    padding: 15px 30px;
    cursor: pointer;
    border-radius: 6px;
    transition: all 0.3s ease;
    color: $text-color-regular;
    font-weight: 500;
    
    &:hover {
      background: $background-color-light;
      color: $primary-color;
    }
    
    &.active {
      background: $primary-color;
      color: white;
    }
    
    .el-icon {
      font-size: 18px;
    }
  }
}

.solution-content {
  .solution-detail {
    .solution-banner {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
      align-items: center;
      margin-bottom: 60px;
      background: white;
      padding: 40px;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      
      .banner-content {
        h2 {
          font-size: 36px;
          color: $text-color-primary;
          margin-bottom: 20px;
        }
        
        p {
          font-size: 18px;
          color: $text-color-regular;
          line-height: 1.6;
        }
      }
      
      .banner-image {
        img {
          width: 100%;
          height: 300px;
          object-fit: cover;
          border-radius: 8px;
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
          
          .model-icon,
          .system-icon {
            margin-bottom: 20px;
            
            .el-icon {
              color: $primary-color;
            }
          }
          
          h4 {
            font-size: 20px;
            color: $text-color-primary;
            margin-bottom: 15px;
          }
          
          p {
            color: $text-color-regular;
            line-height: 1.6;
          }
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
  
  .solutions-nav {
    flex-direction: column;
    gap: 10px;
    
    .nav-item {
      justify-content: center;
    }
  }
  
  .solution-content .solution-detail .solution-banner {
    grid-template-columns: 1fr;
    gap: 20px;
    padding: 20px;
    
    .banner-content h2 {
      font-size: 24px;
    }
  }
  
  .models-grid,
  .systems-grid,
  .features-grid {
    grid-template-columns: 1fr !important;
  }
}
</style>
