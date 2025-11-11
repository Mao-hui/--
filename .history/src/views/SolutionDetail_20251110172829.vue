<template>
  <div class="solution-detail-page">
    <Header />
    
    <!-- 面包屑导航 -->
    <!-- <div class="breadcrumb-section">
      <div class="container">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item :to="{ path: '/solutions' }">解决方案</el-breadcrumb-item>
          <el-breadcrumb-item>{{ solutionInfo.name || '方案详情' }}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
    </div> -->
    
    <!-- Banner区域 - 方案名称嵌入静态图片 -->
    <div class="banner-section" :style="bannerStyle" v-if="!loading && !error && solutionInfo.name">
      <div class="banner-content">
        <h1 class="solution-name">{{ solutionInfo.name }}</h1>
      </div>
    </div>
    
    <!-- 详情内容 -->
    <div class="detail-content">
      <div class="container">
        <div v-loading="loading" class="content-wrapper">
          <div v-if="error" class="error-message">
            <el-result icon="error" :title="error">
              <template #extra>
                <el-button type="primary" @click="$router.push('/solutions')">返回解决方案列表</el-button>
              </template>
            </el-result>
          </div>
          
          <div v-else-if="solutionInfo" class="detail-main">
            <!-- 方案详细内容 - 富文本 -->
            <div class="detail-body">
              <div class="rich-content" v-html="solutionInfo.content"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <Footer />
  </div>
</template>

<script>
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import Header from '../components/Header.vue'
import Footer from '../components/Footer.vue'
import { apiGetScheme, apiGetSchemeDetail } from '@/api'
import soulImage from '@/assets/image/soul.png'

export default {
  name: 'SolutionDetail',
  components: {
    Header,
    Footer
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const loading = ref(false)
    const error = ref('')
    const solutionInfo = ref({})
    
    // Banner背景图样式 - 使用方案的 smallIndustryUrl 或 bigIndustryUrl
    const bannerStyle = computed(() => {
      const imageUrl = solutionInfo.value.imageUrl || soulImage
      return {
        backgroundImage: `url('${imageUrl}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }
    })
    
    // 去除HTML标签，用于显示纯文本描述
    const stripHtml = (html) => {
      if (!html) return ''
      return String(html).replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim()
    }
    
    // 解码HTML实体编码
    const decodeHtml = (html) => {
      if (!html) return ''
      const txt = document.createElement('textarea')
      txt.innerHTML = html
      return txt.value
    }
    
    const loadSolutionDetail = async () => {
      const schemeId = route.query.schemeId
      
      if (!schemeId) {
        error.value = '缺少方案ID参数'
        ElMessage.error('缺少方案ID参数')
        return
      }
      
      loading.value = true
      error.value = ''
      
      try {
        // 使用 apiGetScheme 获取完整的方案列表（包含图片URL）
        const listRes = await apiGetScheme()
        console.log('方案列表API返回数据:', listRes)
        
        if (listRes && listRes.code === 200 && Array.isArray(listRes.data)) {
          // 从列表中找到对应的方案
          const schemeItem = listRes.data.find(item => String(item.schemeId) === String(schemeId))
          console.log('找到的方案数据:', schemeItem)
          
          if (!schemeItem) {
            error.value = '未找到该方案'
            ElMessage.error(error.value)
            return
          }
          
          // 再调用详情接口获取富文本内容
          const detailRes = await apiGetSchemeDetail({ schemeId })
          console.log('方案详情API返回数据:', detailRes)
          
          // 提取详情接口的富文本内容
          let rawContent = '<p>暂无详细内容</p>'
          if (detailRes && detailRes.code === 200 && detailRes.data) {
            const detailItem = Array.isArray(detailRes.data) ? detailRes.data[0] : detailRes.data
            rawContent = detailItem?.description || detailItem?.content || rawContent
          }
          
          // 提取图片URL（从列表接口获取）
          const imageUrl = schemeItem.smallIndustryUrl || schemeItem.bigIndustryUrl || ''
          console.log('提取的图片URL:', imageUrl)
          console.log('smallIndustryUrl:', schemeItem.smallIndustryUrl)
          console.log('bigIndustryUrl:', schemeItem.bigIndustryUrl)
          
          solutionInfo.value = {
            name: schemeItem.schemeName || '方案详情',
            brief: stripHtml(rawContent), // 纯文本简介（去除HTML标签）
            content: decodeHtml(rawContent), // 富文本内容（解码HTML实体）
            tags: [],
            // 方案图片：从列表接口获取，优先使用小分类图片(smallIndustryUrl)
            imageUrl: imageUrl
          }
          
          // 添加行业标签
          if (schemeItem.bigIndustryName) {
            solutionInfo.value.tags.push(schemeItem.bigIndustryName)
          }
          if (schemeItem.smallIndustryName) {
            solutionInfo.value.tags.push(schemeItem.smallIndustryName)
          }
        } else {
          error.value = listRes?.msg || listRes?.message || '加载方案列表失败'
          ElMessage.error(error.value)
        }
      } catch (e) {
        console.error('加载方案详情失败:', e)
        error.value = '加载方案详情失败，请稍后重试'
        ElMessage.error(error.value)
      } finally {
        loading.value = false
      }
    }
    
    onMounted(() => {
      // 页面加载时滚动到顶部
      window.scrollTo(0, 0)
      loadSolutionDetail()
    })
    
    // 监听路由参数变化，当切换方案时重新加载数据
    watch(() => route.query.schemeId, (newId, oldId) => {
      if (newId && newId !== oldId) {
        // 切换方案时，先滚动到顶部
        window.scrollTo({ top: 0, behavior: 'smooth' })
        loadSolutionDetail()
      }
    })
    
    return {
      loading,
      error,
      solutionInfo,
      bannerStyle
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../assets/styles/main.scss';

.solution-detail-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  // background: #f5f7fa;
}

// 面包屑导航
.breadcrumb-section {
  background: white;
  padding: 20px 0;
  // border-bottom: 1px solid #e4e7ed;
  margin-top: 70px; // header高度
  
  :deep(.container) {
    max-width: 1000px;
    padding-left: 80px;
    padding-right: 80px;
    text-align: left;
  }
  
  :deep(.el-breadcrumb) {
    text-align: left;
  }
}

// Banner区域
.banner-section {
  position: relative;
  height: 400px;
  display: flex;
  align-items: flex-end; // 改为底部对齐
  overflow: hidden;
  
  .banner-content {
    position: relative;
    z-index: 2;
    width: 100%;
    max-width: 800px;
    margin: 0 auto;
    padding: 0 20px 100px;
    
    .solution-name {
      font-size: 48px;
      font-weight: 700;
      color: white;
      margin: 0;
      text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
      letter-spacing: 2px;
      line-height: 1.3;
      text-align: left; // 左对齐
    }
  }
}

.detail-content {
  flex: 1;
  padding: 20px 0;
  
  :deep(.container) {
    max-width: 800px;
    margin: 0 auto;
    padding: 0 20px;
  }
}

.content-wrapper {
  min-height: 400px;
}

.error-message {
  padding: 40px 0;
}

.detail-main {
  background: white;
  border-radius: 12px;
  padding: 60px 0;
  // box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.detail-body {
  margin-bottom: 32px;
}

.rich-content {
  font-size: 16px;
  line-height: 1.3;
  color: $text-color-primary;
  text-align: justify;
  
  :deep(img) {
    max-width: 100%;
    height: auto;
    margin: 12px 0;
    display: block;
  }
  
  :deep(p) {
    margin-bottom: 12px;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  :deep(h1), :deep(h2), :deep(h3), :deep(h4) {
    margin: 12px 0 8px;
    color: $text-color-primary;
    
    &:first-child {
      margin-top: 0;
    }
  }
}

@media (max-width: 768px) {
  .breadcrumb-section {
    :deep(.container) {
      padding-left: 20px;
      padding-right: 20px;
    }
  }
  
  .banner-section {
    height: 300px;
    
    .banner-content {
      padding: 0 20px 40px; // 移动端减小内边距
      max-width: 100%;
      
      .solution-name {
        font-size: 32px;
      }
    }
  }
  
  .detail-content {
    :deep(.container) {
      padding-left: 20px;
      padding-right: 20px;
    }
  }
  
  .detail-main {
    padding: 24px 16px;
  }
  
  .detail-title {
    font-size: 24px;
  }
  
  .detail-description {
    padding: 16px;
    
    p {
      font-size: 14px;
    }
  }
  
  .rich-content {
    font-size: 14px;
    
    :deep(p) {
      font-size: 14px;
    }
  }
}
</style>

