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
        <!-- 顶部行业导航（接口生成） -->
        <div class="solutions-nav">
          <div 
            v-for="cat in bigCategories" 
            :key="cat.key"
            :class="['nav-item', { active: activeBig === cat.key }]"
            @click="setActiveBig(cat.key)"
          >
            <span>{{ cat.name }}</span>
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
              <h3>精选方案</h3>
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
    
    <el-dialog v-model="dialogVisible" :title="detailItem && detailItem.schemeName" width="900px">
      <div v-loading="detailLoading" class="rich-content" v-html="detailItem && detailItem.description"></div>
    </el-dialog>
    
    <Footer />
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import Header from '../components/Header.vue'
import Footer from '../components/Footer.vue'
import { apiGetScheme, apiGetSchemeDetail } from '@/api'
import soulImage from '@/assets/image/soul.png'

export default {
  name: 'Solutions',
  components: {
    Header,
    Footer
  },
  setup() {
    const route = useRoute()
    const loading = ref(false)
    const error = ref('')
    const dialogVisible = ref(false)
    const detailItem = ref(null)
    const detailLoading = ref(false)
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
    
    const setActiveBig = (key) => { activeBig.value = key }
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
    const openDetail = async (item) => {
      if (!item || !item.id) {
        ElMessage.error('方案信息不完整')
        return
      }
      
      dialogVisible.value = true
      detailLoading.value = true
      detailItem.value = null
      
      try {
        const res = await apiGetSchemeDetail({ schemeId: item.id })
        if (res && res.code === 200 && res.data) {
          const data = res.data
          detailItem.value = {
            schemeName: data.schemeName || item.schemeName || '方案详情',
            description: data.description || data.content || item.description || '暂无描述'
          }
        } else {
          // 如果接口失败，使用列表中的已有数据
          detailItem.value = {
            schemeName: item.schemeName || '方案详情',
            description: item.description || item.brief || '暂无描述'
          }
          ElMessage.warning((res && (res.msg || res.message)) || '获取详情失败，显示基本信息')
        }
      } catch (e) {
        // 出错时使用列表中的已有数据
        detailItem.value = {
          schemeName: item.schemeName || '方案详情',
          description: item.description || item.brief || '暂无描述'
        }
        ElMessage.warning('加载详情失败，显示基本信息')
      } finally {
        detailLoading.value = false
      }
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
      dialogVisible,
      detailItem,
      detailLoading,
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

.solutions-content {
  padding: 60px 0;
  background: $background-color-light;
  min-height: 600px;
}

.solutions-nav {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 40px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  padding: 10px 12px;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 70px;
  z-index: 5;
  backdrop-filter: saturate(150%) blur(8px);
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  &::-webkit-scrollbar { display: none; }
  
  .nav-item {
    padding: 12px 18px;
    cursor: pointer;
    border-radius: 22px;
    transition: all 0.25s ease;
    color: $text-color-regular;
    font-weight: 600;
    position: relative;
    border: 1px solid transparent;
    
    &:hover { color: $primary-color; background: $background-color-light; }
    &.active { color: $primary-color; background: rgba($primary-color, .08); border-color: rgba($primary-color, .2); }
    &.active::after {
      content: '';
      position: absolute; left: 16px; right: 16px; bottom: 6px; height: 2px; background: $primary-color; border-radius: 2px;
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
  
  .solutions-nav {
    flex-direction: column;
    gap: 10px;
    
    .nav-item {
      justify-content: center;
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
  .schemes-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
  .scheme-card { display: flex; flex-direction: column; padding: 0; overflow: hidden; transition: transform .25s ease, box-shadow .25s ease; }
  .scheme-cover { width: 100%; height: 120px; background: #f6f8fa; }
  .scheme-cover img { width: 100%; height: 100%; object-fit: cover; }
  .scheme-body { padding: 14px; }
  .scheme-title { font-size: 16px; margin: 0 0 5px; color: $text-color-primary; }
  .scheme-sub { margin: 0 0 6px; color: $text-color-secondary; font-size: 12px; }
  .scheme-desc { color: $text-color-regular; font-size: 13px; line-height: 1.6; display: -webkit-box; -webkit-line-clamp: 3; line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
  .scheme-tags { margin-top: 8px; display: flex; gap: 5px; }
  .scheme-actions { padding: 10px 14px 14px; display: flex; justify-content: flex-end; }
  .scheme-card:hover { transform: translateY(-3px); box-shadow: 0 8px 20px rgba(0,0,0,.08); }
}

.loading, .error { padding: 20px 0; color: $text-color-regular; }

/* 弹窗富文本优化 */
::v-deep(.el-dialog__body) {
  .rich-content img { max-width: 100%; display: block; margin: 12px 0; }
  .rich-content { max-height: 60vh; overflow: auto; line-height: 1.75; }
}
</style>
