<template>
  <div class="about">
    <Header />
    
    <!-- Banner区域 -->
    <div class="banner-section" :style="bannerStyle">
      <div class="banner-content">
        <div class="banner-overlay">
          <h1 class="banner-title">企业介绍</h1>
        </div>
      </div>
    </div>
    
    <div class="about-content">
      <div class="container">
        
        <!-- 向量介绍 -->
        <div class="company-intro section">
          <div class="intro-content">
            <div class="intro-text">
              <h2>向量介绍</h2>
              <div class="intro-image">
                <img src="https://via.placeholder.com/400x300/7ED321/FFFFFF?text=公司团队" alt="公司团队" />
              </div>
              <div class="intro-description">
                <p>蚌埠向量科技有限公司创立于安徽蚌埠，我们不仅是一家软件公司，更是一位致力于用技术为客户精准定位价值方向、赋能业务增长的长期合作伙伴。公司研发人员占比80%，全部具有本科以上学历，公司常年服务ABB、奔驰、比亚迪等汽车制造相关企业，同时也为其他企业提供定制化软件服务。</p>
                
                <p>我们聚焦于企业的数字化建设，通过提供端到端的解决方案，为企业进行赋能，支撑企业进行数字化改革。</p>
                
                <p>我们提供的不仅是软件代码，更是深度的需求理解、严谨的项目实施和可靠的技术运维。就如我们的名字一样，"向量"，既有方向，又有力量，完美诠释了我们的使命：以明确的技术路径和强大的执行能力，助力企业在数字化转型的浪潮中找准方向，我们愿与每一位客户携手，将复杂的挑战转化为清晰的向量，共同驶向成功的未来，聚力前行。</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 联系我们 -->
        <div class="contact-section section">
          <h2>联系我们</h2>
          <div class="contact-wrapper">
            <div class="contact-info">
              <div class="contact-item">
                <el-icon><Phone /></el-icon>
                <span>联系电话: 18255246289</span>
              </div>
              <div class="contact-item">
                <el-icon><ChatDotRound /></el-icon>
                <span>企业微信: wangsong8455</span>
              </div>
              <div class="contact-item">
                <el-icon><Location /></el-icon>
                <span>公司地址: 蚌埠市蚌山区绿地珠峰B座1009室</span>
              </div>
            </div>
            <div class="qr-code">
              <div class="qr-placeholder">
                <img src="@/assets/image/qrcode.png" alt="关注向量二维码" />
              </div>
              <span>关注向量</span>
            </div>
          </div>
        </div>
        
        <!-- 在招职位 -->
        <div class="jobs-section section" id="jobs">
          <h2>在招职位</h2>
          <div class="jobs-table">
            <el-table :data="jobList" style="width: 100%" v-loading="loading" :fit="true">
              <el-table-column prop="position" label="职位名称" min-width="250" show-overflow-tooltip />
              <el-table-column prop="count" label="招聘人数" width="110" align="center" />
              <el-table-column prop="education" label="学历要求" width="130" align="center" />
              <el-table-column prop="location" label="工作地点" width="130" align="center" />
              <el-table-column prop="date" label="发布时间" width="150" align="center" />
              <el-table-column label="操作" width="130" align="center" fixed="right">
                <template #default="scope">
                  <el-button type="primary" size="small" @click="viewJobDetail(scope.row)">
                    查看详情
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
            <el-empty v-if="!loading && !jobList.length && !error" description="暂无招聘信息" />
            <div v-if="error" class="error">{{ error }}</div>
          </div>
        </div>
      </div>
    </div>
    
    <el-dialog v-model="dialogVisible" :title="currentJob && currentJob.position" width="800px">
      <div class="job-detail" v-loading="detailLoading">
        <div class="job-meta">
          <span>人数：{{ currentJob && currentJob.count }}</span>
          <span>学历：{{ currentJob && currentJob.education }}</span>
          <span>地点：{{ currentJob && currentJob.location }}</span>
          <span>发布时间：{{ currentJob && currentJob.date }}</span>
        </div>
        <div class="rich-content" v-html="currentJob && currentJob.content"></div>
      </div>
    </el-dialog>

    <Footer />
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import Header from '../components/Header.vue'
import Footer from '../components/Footer.vue'
import { apiGetHire, apiGetHireDetail } from '@/api'
import aboutImage from '@/assets/image/about.png'

export default {
  name: 'About',
  components: {
    Header,
    Footer
  },
  setup() {
    const jobList = ref([])
    const loading = ref(false)
    const error = ref('')
    const dialogVisible = ref(false)
    const currentJob = ref(null)
    const detailLoading = ref(false)
    
    const bannerStyle = computed(() => {
      // 使用本地图片
      return {
        backgroundImage: `url('${aboutImage}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }
    })
    
    const loadHires = async () => {
      loading.value = true
      error.value = ''
      try {
        const res = await apiGetHire()
        if (res && res.code === 200 && Array.isArray(res.data)) {
          jobList.value = res.data.map((it, idx) => ({
            id: it.hireId || idx,
            position: it.name,
            count: it.count,
            education: it.educational,
            location: it.workPlace,
            date: (it.releaseTime || it.updateTime || '').slice(0, 10),
            content: it.content || ''
          }))
        } else {
          error.value = (res && (res.msg || res.message)) || '加载失败'
        }
      } catch (e) {
        error.value = '加载失败，请稍后重试'
      } finally {
        loading.value = false
      }
    }
    
    const viewJobDetail = async (job) => {
      if (!job || !job.id) {
        ElMessage.error('招聘信息不完整')
        return
      }
      
      dialogVisible.value = true
      detailLoading.value = true
      currentJob.value = null
      
      try {
        const res = await apiGetHireDetail({ hireId: job.id })
        if (res && res.code === 200 && res.data) {
          const data = res.data
          currentJob.value = {
            id: data.hireId || job.id,
            position: data.name || job.position || '职位',
            count: data.count || job.count || '',
            education: data.educational || job.education || '',
            location: data.workPlace || job.location || '',
            date: (data.releaseTime || data.updateTime || job.date || '').slice(0, 10),
            content: data.content || job.content || '暂无描述'
          }
        } else {
          // 如果接口失败，使用列表中的已有数据
          currentJob.value = job
          ElMessage.warning((res && (res.msg || res.message)) || '获取详情失败，显示基本信息')
        }
      } catch (e) {
        // 出错时使用列表中的已有数据
        currentJob.value = job
        ElMessage.warning('加载详情失败，显示基本信息')
      } finally {
        detailLoading.value = false
      }
    }
    
    onMounted(() => {
      loadHires()
    })
    
    return {
      jobList,
      loading,
      error,
      dialogVisible,
      currentJob,
      detailLoading,
      viewJobDetail,
      bannerStyle
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../assets/styles/main.scss';
.about {
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
    margin: 0;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
    line-height: 1.2;
  }
}

.about-content {
  padding: 60px 0;
  background: $background-color-light;
}

.company-intro {
  background: white;
  border-radius: 16px;
  padding: 60px 40px;
  margin-bottom: 60px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
  transition: box-shadow 0.3s ease;
  
  &:hover {
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
  }
  
  .intro-content {
    .intro-text {
      h2 {
        font-size: 36px;
        color: $text-color-primary;
        margin-bottom: 40px;
        text-align: center;
        position: relative;
        padding-bottom: 20px;
        
        &::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 60px;
          height: 3px;
          background: linear-gradient(90deg, $primary-color, lighten($primary-color, 20%));
          border-radius: 2px;
        }
      }
      
      .intro-image {
        float: right;
        margin: 0 0 20px 30px;
        
        img {
          width: 300px;
          height: 200px;
          object-fit: cover;
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s ease;
        }
        
        &:hover img {
          transform: scale(1.05);
        }
      }
      
      .intro-description {
        p {
          font-size: 16px;
          line-height: 2;
          color: $text-color-primary;
          margin-bottom: 24px;
          text-align: justify;
          
          &:last-child {
            margin-bottom: 0;
          }
        }
      }
    }
  }
}

.contact-section {
  background: white;
  border-radius: 16px;
  padding: 50px 40px;
  margin-bottom: 60px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
  transition: box-shadow 0.3s ease;
  
  &:hover {
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
  }
  
  h2 {
    font-size: 36px;
    color: $text-color-primary;
    margin-bottom: 40px;
    text-align: center;
    position: relative;
    padding-bottom: 20px;
    
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 60px;
      height: 3px;
      background: linear-gradient(90deg, $primary-color, lighten($primary-color, 20%));
      border-radius: 2px;
    }
  }
  
  .contact-wrapper {
    display: flex;
    align-items: flex-start;
    gap: 50px;
    justify-content: space-between;
  }
  
  .contact-info {
    display: flex;
    flex-direction: column;
    gap: 16px;
    flex: 1;
    
    .contact-item {
      @include flex-center;
      gap: 12px;
      padding: 18px 20px;
      background: linear-gradient(135deg, rgba($primary-color, 0.05) 0%, rgba($primary-color, 0.02) 100%);
      border-radius: 12px;
      border: 1px solid rgba($primary-color, 0.1);
      transition: all 0.3s ease;
      cursor: pointer;
      
      &:hover {
        background: linear-gradient(135deg, rgba($primary-color, 0.1) 0%, rgba($primary-color, 0.05) 100%);
        transform: translateX(4px);
        box-shadow: 0 4px 12px rgba($primary-color, 0.15);
      }
      
      .el-icon {
        color: $primary-color;
        font-size: 22px;
        flex-shrink: 0;
      }
      
      span {
        font-size: 16px;
        color: $text-color-primary;
        font-weight: 500;
      }
    }
  }
  
  .qr-code {
    @include flex-center;
    flex-direction: column;
    gap: 15px;
    flex-shrink: 0;
    
    .qr-placeholder {
      width: 140px;
      height: 140px;
      background: white;
      border: 2px solid rgba($primary-color, 0.2);
      border-radius: 12px;
      @include flex-center;
      overflow: hidden;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
      transition: all 0.3s ease;
      
      &:hover {
        transform: scale(1.05);
        box-shadow: 0 8px 24px rgba($primary-color, 0.2);
        border-color: $primary-color;
      }
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
    
    span {
      font-size: 16px;
      color: $text-color-primary;
      font-weight: 600;
      letter-spacing: 1px;
    }
  }
}

.jobs-section {
  background: white;
  border-radius: 16px;
  padding: 50px 40px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
  transition: box-shadow 0.3s ease;
  
  &:hover {
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
  }
  
  h2 {
    font-size: 36px;
    color: $text-color-primary;
    margin-bottom: 40px;
    text-align: center;
    position: relative;
    padding-bottom: 20px;
    
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 60px;
      height: 3px;
      background: linear-gradient(90deg, $primary-color, lighten($primary-color, 20%));
      border-radius: 2px;
    }
  }
  
  .jobs-table {
    width: 100%;
    overflow-x: auto;
    
    .el-table {
      width: 100%;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
      
      ::v-deep(.el-table__body-wrapper),
      ::v-deep(.el-table__header-wrapper) {
        width: 100% !important;
      }
      
      ::v-deep(table) {
        width: 100% !important;
      }
      
      ::v-deep(.el-table__header) {
        background: linear-gradient(135deg, rgba($primary-color, 0.08) 0%, rgba($primary-color, 0.03) 100%);
        
        th {
          background: transparent;
          color: $text-color-primary;
          font-weight: 600;
          padding: 16px 0;
          white-space: nowrap;
        }
      }
      
      ::v-deep(.el-table__body) {
        td {
          padding: 16px 0;
        }
      }
      
      ::v-deep(.el-table__row) {
        transition: all 0.2s ease;
        
        &:hover {
          background: rgba($primary-color, 0.03);
          transform: scale(1.01);
        }
        
        td {
          vertical-align: middle;
        }
      }
    }
  }
}

.error { color: $text-color-regular; padding: 12px 0; }

/* 职位详情弹窗 */
::v-deep(.el-dialog__body) {
  .job-detail { 
    max-height: 65vh; 
    overflow: auto;
    padding: 10px 0;
    
    &::-webkit-scrollbar {
      width: 6px;
    }
    
    &::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 3px;
    }
    
    &::-webkit-scrollbar-thumb {
      background: $primary-color;
      border-radius: 3px;
      
      &:hover {
        background: darken($primary-color, 10%);
      }
    }
  }
  
  .job-meta { 
    display: flex; 
    flex-wrap: wrap; 
    gap: 16px; 
    padding: 16px;
    background: linear-gradient(135deg, rgba($primary-color, 0.05) 0%, rgba($primary-color, 0.02) 100%);
    border-radius: 8px;
    margin-bottom: 20px;
    
    span {
      color: $text-color-regular; 
      font-size: 14px;
      padding: 6px 12px;
      background: white;
      border-radius: 6px;
      border: 1px solid rgba($primary-color, 0.1);
    }
  }
  
  .rich-content { 
    line-height: 1.8;
    
    img { 
      max-width: 100%; 
      display: block; 
      margin: 16px 0; 
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    p {
      margin-bottom: 12px;
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
    }
  }
  
  .company-intro {
    padding: 30px 20px;
    border-radius: 12px;
    
    .intro-content .intro-text {
      .intro-image {
        float: none;
        margin: 0 0 20px 0;
        text-align: center;
        
        img {
          width: 100%;
          max-width: 300px;
        }
      }
      
      h2 {
        font-size: 26px;
        margin-bottom: 30px;
        padding-bottom: 15px;
        
        &::after {
          width: 40px;
        }
      }
      
      .intro-description p {
        font-size: 14px;
        line-height: 1.8;
      }
    }
  }
  
  .contact-section,
  .jobs-section {
    padding: 30px 20px;
    border-radius: 12px;
    
    h2 {
      font-size: 26px;
      margin-bottom: 30px;
      padding-bottom: 15px;
      
      &::after {
        width: 40px;
      }
    }
    
    .contact-wrapper {
      flex-direction: column;
      gap: 30px;
    }
    
    .contact-info {
      width: 100%;
    }
    
    .qr-code .qr-placeholder {
      width: 120px;
      height: 120px;
    }
  }
}
</style>
