<template>
  <div class="about">
    <Header />
    
    <div class="page-header">
      <div class="container">
        <h1>关于我们</h1>
        <p>专业的软件开发服务商，助力企业数字化转型</p>
      </div>
    </div>
    
    <div class="about-content">
      <div class="container">
        <!-- 公司介绍横幅 -->
        <div class="company-banner">
          <img src="https://via.placeholder.com/1200x400/4A90E2/FFFFFF?text=关于我们" alt="关于我们" />
          <div class="banner-overlay">
            <h2>关于我们</h2>
          </div>
        </div>
        
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
              <el-icon><QrCode /></el-icon>
            </div>
            <span>关注向量</span>
          </div>
        </div>
        
        <!-- 在招职位 -->
        <div class="jobs-section section" id="jobs">
          <h2>在招职位</h2>
          <div class="jobs-table">
            <el-table :data="jobList" style="width: 100%">
              <el-table-column prop="position" label="职位名称" width="200" />
              <el-table-column prop="count" label="招聘人数" width="120" />
              <el-table-column prop="education" label="学历要求" width="120" />
              <el-table-column prop="location" label="工作地点" width="120" />
              <el-table-column prop="date" label="发布时间" width="150" />
              <el-table-column label="操作" width="100">
                <template #default="scope">
                  <el-button type="primary" size="small" @click="viewJobDetail(scope.row)">
                    查看详情
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </div>
    </div>
    
    <Footer />
  </div>
</template>

<script>
import { ref } from 'vue'
import Header from '../components/Header.vue'
import Footer from '../components/Footer.vue'

export default {
  name: 'About',
  components: {
    Header,
    Footer
  },
  setup() {
    const jobList = ref([
      {
        position: 'JAVA开发工程师',
        count: '5',
        education: '本科',
        location: '蚌埠',
        date: '2025-10-13'
      },
      {
        position: 'Python开发工程师',
        count: '2',
        education: '本科',
        location: '蚌埠',
        date: '2025-10-13'
      },
      {
        position: '系统运维工程师',
        count: '2',
        education: '本科',
        location: '蚌埠',
        date: '2025-10-13'
      },
      {
        position: '前端开发工程师',
        count: '3',
        education: '本科',
        location: '蚌埠',
        date: '2025-10-12'
      },
      {
        position: '产品经理',
        count: '1',
        education: '本科',
        location: '蚌埠',
        date: '2025-10-12'
      }
    ])
    
    const viewJobDetail = (job) => {
      // 这里可以添加查看职位详情的逻辑
      console.log('查看职位详情:', job)
    }
    
    return {
      jobList,
      viewJobDetail
    }
  }
}
</script>

<style lang="scss" scoped>
.about {
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

.about-content {
  padding: 60px 0;
  background: $background-color-light;
}

.company-banner {
  position: relative;
  margin-bottom: 60px;
  border-radius: 12px;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 400px;
    object-fit: cover;
  }
  
  .banner-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    @include flex-center;
    
    h2 {
      color: white;
      font-size: 48px;
      font-weight: bold;
    }
  }
}

.company-intro {
  background: white;
  border-radius: 12px;
  padding: 60px 40px;
  margin-bottom: 60px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  
  .intro-content {
    .intro-text {
      h2 {
        font-size: 32px;
        color: $text-color-primary;
        margin-bottom: 30px;
        text-align: center;
      }
      
      .intro-image {
        float: right;
        margin: 0 0 20px 30px;
        
        img {
          width: 300px;
          height: 200px;
          object-fit: cover;
          border-radius: 8px;
        }
      }
      
      .intro-description {
        p {
          font-size: 16px;
          line-height: 1.8;
          color: $text-color-primary;
          margin-bottom: 20px;
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
  border-radius: 12px;
  padding: 40px;
  margin-bottom: 60px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  
  h2 {
    font-size: 32px;
    color: $text-color-primary;
    margin-bottom: 30px;
    text-align: center;
  }
  
  .contact-info {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
    
    .contact-item {
      @include flex-center;
      gap: 10px;
      padding: 15px;
      background: $background-color-light;
      border-radius: 8px;
      
      .el-icon {
        color: $primary-color;
        font-size: 20px;
      }
      
      span {
        font-size: 16px;
        color: $text-color-primary;
      }
    }
  }
  
  .qr-code {
    @include flex-center;
    flex-direction: column;
    gap: 15px;
    
    .qr-placeholder {
      width: 120px;
      height: 120px;
      background: white;
      border: 2px solid $border-color-base;
      border-radius: 8px;
      @include flex-center;
      
      .el-icon {
        font-size: 60px;
        color: $text-color-secondary;
      }
    }
    
    span {
      font-size: 16px;
      color: $text-color-primary;
      font-weight: 500;
    }
  }
}

.jobs-section {
  background: white;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  
  h2 {
    font-size: 32px;
    color: $text-color-primary;
    margin-bottom: 30px;
    text-align: center;
  }
  
  .jobs-table {
    .el-table {
      border-radius: 8px;
      overflow: hidden;
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
  
  .company-banner .banner-overlay h2 {
    font-size: 32px;
  }
  
  .company-intro {
    padding: 30px 20px;
    
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
        font-size: 24px;
      }
      
      .intro-description p {
        font-size: 14px;
      }
    }
  }
  
  .contact-section,
  .jobs-section {
    padding: 30px 20px;
    
    h2 {
      font-size: 24px;
    }
    
    .contact-info {
      grid-template-columns: 1fr;
    }
  }
}
</style>
