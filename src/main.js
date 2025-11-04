import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import './assets/styles/main.scss'
import { setupGlobalErrorHandling, suppressResizeObserverError, fixResizeObserverError } from './utils/resizeObserver'

// 设置全局错误处理
setupGlobalErrorHandling()
suppressResizeObserverError()
fixResizeObserverError()

const app = createApp(App)

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(router)
app.use(ElementPlus)

// 添加应用挂载错误处理
try {
  app.mount('#app')
  console.log('应用已成功挂载')
} catch (error) {
  console.error('应用挂载失败:', error)
  // 显示错误信息给用户
  document.body.innerHTML = `
    <div style="padding: 20px; text-align: center; font-family: Arial, sans-serif;">
      <h2>页面加载失败</h2>
      <p>请检查浏览器控制台获取详细信息</p>
      <p style="color: #999; font-size: 12px;">错误: ${error.message}</p>
    </div>
  `
}
