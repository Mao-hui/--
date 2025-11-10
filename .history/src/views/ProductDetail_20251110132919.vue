<template>
  <div class="product-detail-page">
    <Header />
    
    <!-- 面包屑导航 -->
    <div class="breadcrumb-section">
      <div class="container">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item :to="{ path: '/products' }">产品中心</el-breadcrumb-item>
          <el-breadcrumb-item>{{ productInfo.name || '产品详情' }}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
    </div>
    
    <!-- Banner区域 - 产品名称嵌入静态图片 -->
    <div class="banner-section" :style="bannerStyle" v-if="!loading && !error && productInfo.name">
      <div class="banner-content">
        <h1 class="product-name">{{ productInfo.name }}</h1>
      </div>
    </div>
    
    <!-- 详情内容 -->
    <div class="detail-content">
      <div class="container">
        <div v-loading="loading" class="content-wrapper">
          <div v-if="error" class="error-message">
            <el-result icon="error" :title="error">
              <template #extra>
                <el-button type="primary" @click="$router.push('/products')">返回产品列表</el-button>
              </template>
            </el-result>
          </div>
          
          <div v-else-if="productInfo" class="detail-main">
            <!-- 产品详细内容 - 富文本 -->
            <div class="detail-body">
              <div class="rich-content" v-html="productInfo.content"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <Footer />
  </div>
</template>

<script>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import Header from '../components/Header.vue'
import Footer from '../components/Footer.vue'
import { apiGetProductDetail } from '@/api'
import prod1Image from '@/assets/image/prod1.png'

export default {
  name: 'ProductDetail',
  components: {
    Header,
    Footer
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const loading = ref(false)
    const error = ref('')
    const productInfo = ref({})
    
    // Banner背景图样式
    const bannerStyle = computed(() => {
      return {
        backgroundImage: `url('${prod1Image}')`,
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
    
    const loadProductDetail = async () => {
      const productId = route.query.productId
      
      if (!productId) {
        error.value = '缺少产品ID参数'
        ElMessage.error('缺少产品ID参数')
        return
      }
      
      loading.value = true
      error.value = ''
      
      try {
        const res = await apiGetProductDetail({ productId })
        if (res && res.code === 200 && res.data) {
          // description字段作为富文本内容，可能包含HTML
          const rawContent = res.data.description || res.data.content || '<p>暂无详细内容</p>'
          
          productInfo.value = {
            name: res.data.productName || '产品详情',
            description: stripHtml(rawContent), // 纯文本描述（去除HTML标签）
            content: decodeHtml(rawContent), // 富文本内容（解码HTML实体）
            tags: res.data.tags || []
          }
          
          // 如果没有标签但有行业信息，添加标签
          if ((!productInfo.value.tags || productInfo.value.tags.length === 0) && res.data.bigIndustryName) {
            productInfo.value.tags = [res.data.bigIndustryName]
            if (res.data.smallIndustryName) {
              productInfo.value.tags.push(res.data.smallIndustryName)
            }
          }
        } else {
          error.value = res?.msg || res?.message || '加载产品详情失败'
          ElMessage.error(error.value)
        }
      } catch (e) {
        console.error('加载产品详情失败:', e)
        error.value = '加载产品详情失败，请稍后重试'
        ElMessage.error(error.value)
      } finally {
        loading.value = false
      }
    }
    
    onMounted(() => {
      // 页面加载时滚动到顶部
      window.scrollTo(0, 0)
      loadProductDetail()
    })
    
    // 监听路由参数变化，当切换产品时重新加载数据
    watch(() => route.query.productId, (newId, oldId) => {
      if (newId && newId !== oldId) {
        // 切换产品时，先滚动到顶部
        window.scrollTo({ top: 0, behavior: 'smooth' })
        loadProductDetail()
      }
    })
    
    return {
      loading,
      error,
      productInfo,
      bannerStyle
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../assets/styles/main.scss';

.product-detail-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  // background: #f5f7fa;
}

// 面包屑导航
.breadcrumb-section {
  background: white;
  padding: 20px 0;
  border-bottom: 1px solid #e4e7ed;
  margin-top: 70px; // header高度
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
    max-width: 1600px;
    margin: 0 auto;
    padding: 0 60px 80px; // 左右内边距60px，底部80px
    
    .product-name {
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
  // box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.detail-body {
  margin-bottom: 32px;
}

.rich-content {
  font-size: 16px;
  line-height: 1.8;
  color: $text-color-primary;
  text-align: justify;
  
  :deep(img) {
    max-width: 100%;
    height: auto;
    margin: 20px 0;
    display: block;
  }
  
  :deep(p) {
    margin-bottom: 20px;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  :deep(h1), :deep(h2), :deep(h3), :deep(h4) {
    margin: 20px 0 15px;
    color: $text-color-primary;
  }
}

@media (max-width: 768px) {
  .banner-section {
    height: 300px;
    
    .banner-content {
      padding: 0 20px 40px; // 移动端减小内边距
      
      .product-name {
        font-size: 32px;
      }
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

