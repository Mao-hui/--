<template>
  <footer class="footer">
    <div class="container">
      <div class="footer-content">
        <div class="footer-section">
          <h3>联系方式</h3>
          <div class="contact-item">
            <el-icon><Phone /></el-icon>
            <span>18255246289</span>
          </div>
        </div>
        
        <div class="footer-section">
          <h3>关于我们</h3>
          <ul>
            <li><router-link to="/about">公司介绍</router-link></li>
            <li><router-link to="/about#jobs">在招职位</router-link></li>
          </ul>
        </div>
        
        <div class="footer-section">
          <h3>产品中心</h3>
          <ul>
            <li><router-link to="/solutions">解决方案</router-link></li>
            <li><router-link to="/products">产品</router-link></li>
          </ul>
        </div>
        
        <div class="footer-section">
          <h3>新闻中心</h3>
          <ul>
            <li><router-link to="/news">新闻</router-link></li>
            <li><router-link to="/about">合作伙伴</router-link></li>
          </ul>
        </div>
        
        <div class="footer-section">
          <h3>联系我们</h3>
          <div class="contact-info">
            <p>联系电话: 18255246289</p>
            <p>企业微信: wangsong8455</p>
            <p>公司地址: 蚌埠市蚌山区绿地珠峰B座1009室</p>
          </div>
          <div class="qr-code">
            <div class="qr-placeholder">
              <el-icon><QrCode /></el-icon>
            </div>
            <span>关注向量</span>
          </div>
        </div>
      </div>
      
      <div class="footer-bottom">
        <p>Copyright © 蚌埠向量科技有限公司版权所有 皖ICP备000000号</p>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'Footer'
}
</script>

<style lang="scss" scoped>
@import '../assets/styles/main.scss';
.footer {
  background: #2c3e50;
  color: white;
  padding: 50px 0 20px;
  
  .footer-content {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 30px;
    margin-bottom: 30px;
  }
  
  .footer-section {
    h3 {
      color: white;
      margin-bottom: 20px;
      font-size: 18px;
    }
    
    ul {
      list-style: none;
      
      li {
        margin-bottom: 10px;
        
        a {
          color: #bdc3c7;
          text-decoration: none;
          transition: color 0.3s ease;
          
          &:hover {
            color: $primary-color;
          }
        }
      }
    }
    
    .contact-item {
      @include flex-center;
      gap: 10px;
      margin-bottom: 15px;
      
      .el-icon {
        color: $primary-color;
      }
    }
    
    .contact-info {
      p {
        margin-bottom: 8px;
        color: #bdc3c7;
        font-size: 14px;
      }
    }
    
    .qr-code {
      @include flex-center;
      flex-direction: column;
      gap: 10px;
      margin-top: 20px;
      
      .qr-placeholder {
        width: 80px;
        height: 80px;
        background: white;
        border-radius: 8px;
        @include flex-center;
        
        .el-icon {
          font-size: 40px;
          color: #666;
        }
      }
      
      span {
        font-size: 14px;
        color: #bdc3c7;
      }
    }
  }
  
  .footer-bottom {
    border-top: 1px solid #34495e;
    padding-top: 20px;
    text-align: center;
    
    p {
      color: #bdc3c7;
      font-size: 14px;
      margin: 0;
    }
  }
}

@media (max-width: 768px) {
  .footer {
    .footer-content {
      grid-template-columns: 1fr;
      gap: 20px;
    }
  }
}
</style>
