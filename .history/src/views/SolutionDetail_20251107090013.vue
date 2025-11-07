<template>
  <div class="solution-detail-page">
    <Header />
    
    <!-- 面包屑导航 -->
    <div class="breadcrumb-section">
      <div class="container">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item :to="{ path: '/solutions' }">解决方案</el-breadcrumb-item>
          <el-breadcrumb-item>{{ solutionInfo.name || '方案详情' }}</el-breadcrumb-item>
        </el-breadcrumb>
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
            <!-- 方案标题 -->
            <div class="detail-header">
              <h1 class="detail-title">{{ solutionInfo.name }}</h1>
              <div class="detail-meta" v-if="solutionInfo.tags && solutionInfo.tags.length">
                <el-tag 
                  v-for="tag in solutionInfo.tags" 
                  :key="tag" 
                  size="large"
                  type="success"
                  effect="plain"
                >
                  {{ tag }}
                </el-tag>
              </div>
            </div>
            
            <!-- 方案简介 -->
            <div class="detail-description" v-if="solutionInfo.brief">
              <p>{{ solutionInfo.brief }}</p>
            </div>
            
            <!-- 方案详细内容 -->
            <div class="detail-body">
              <div class="rich-content" v-html="solutionInfo.content"></div>
            </div>
            
            <!-- 返回按钮 -->
            <div class="detail-actions">
              <el-button @click="$router.back()">返回上一页</el-button>
              <el-button type="primary" @click="$router.push('/solutions')">返回解决方案列表</el-button>
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
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import Header from '../components/Header.vue'
import Footer from '../components/Footer.vue'
import { apiGetSchemeDetail } from '@/api'

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
        const res = await apiGetSchemeDetail({ schemeId })
        if (res && res.code === 200 && res.data) {
          solutionInfo.value = {
            name: res.data.schemeName || '方案详情',
            brief: res.data.brief || '',
            content: res.data.description || res.data.content || '<p>暂无详细内容</p>',
            tags: res.data.tags || []
          }
          
          // 如果没有标签但有行业信息，添加标签
          if ((!solutionInfo.value.tags || solutionInfo.value.tags.length === 0) && res.data.bigIndustryName) {
            solutionInfo.value.tags = [res.data.bigIndustryName]
            if (res.data.smallIndustryName) {
              solutionInfo.value.tags.push(res.data.smallIndustryName)
            }
          }
        } else {
          error.value = res?.msg || res?.message || '加载方案详情失败'
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
      loadSolutionDetail()
    })
    
    return {
      loading,
      error,
      solutionInfo
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
  background: #f5f7fa;
}

.breadcrumb-section {
  background: white;
  padding: 20px 0;
  border-bottom: 1px solid #e4e7ed;
  margin-top: 70px; // header高度
}

.detail-content {
  flex: 1;
  padding: 40px 0;
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
  padding: 40px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.detail-header {
  border-bottom: 2px solid #e4e7ed;
  padding-bottom: 24px;
  margin-bottom: 32px;
}

.detail-title {
  font-size: 32px;
  font-weight: 700;
  color: $text-color-primary;
  margin: 0 0 16px 0;
  line-height: 1.4;
}

.detail-meta {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.detail-description {
  background: #f0f9ff;
  border-left: 4px solid #67c23a;
  padding: 20px 24px;
  margin-bottom: 32px;
  border-radius: 4px;
  
  p {
    font-size: 16px;
    line-height: 1.8;
    color: $text-color-regular;
    margin: 0;
  }
}

.detail-body {
  margin-bottom: 32px;
}

.rich-content {
  font-size: 15px;
  line-height: 1.8;
  color: $text-color-regular;
  
  :deep(img) {
    max-width: 100%;
    height: auto;
    display: block;
    margin: 20px 0;
    border-radius: 8px;
  }
  
  :deep(p) {
    margin: 16px 0;
  }
  
  :deep(h1), :deep(h2), :deep(h3), :deep(h4), :deep(h5), :deep(h6) {
    margin: 24px 0 16px;
    font-weight: 600;
    color: $text-color-primary;
  }
  
  :deep(ul), :deep(ol) {
    padding-left: 24px;
    margin: 16px 0;
  }
  
  :deep(li) {
    margin: 8px 0;
  }
  
  :deep(table) {
    width: 100%;
    border-collapse: collapse;
    margin: 20px 0;
    
    th, td {
      border: 1px solid #e4e7ed;
      padding: 12px;
      text-align: left;
    }
    
    th {
      background: #f5f7fa;
      font-weight: 600;
    }
  }
}

.detail-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  padding-top: 32px;
  border-top: 1px solid #e4e7ed;
}

@media (max-width: 768px) {
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
  }
}
</style>

