import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Products from '../views/Products.vue'
import Solutions from '../views/Solutions.vue'
import News from '../views/News.vue'
import About from '../views/About.vue'
import NewsDetail from '../views/NewsDetail.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/products',
    name: 'Products',
    component: Products
  },
  {
    path: '/solutions',
    name: 'Solutions',
    component: Solutions
  },
  {
    path: '/news',
    name: 'News',
    component: News
  },
  {
    path: '/news/:id',
    name: 'NewsDetail',
    component: NewsDetail
  },
  {
    path: '/about',
    name: 'About',
    component: About
  }
]

// 根据 publicPath 设置 base
// 如果部署在根目录，使用 '/'；如果部署在子目录，使用子目录路径（如 '/official/'）
// 注意：需要与 vue.config.js 中的 publicPath 保持一致
const base = process.env.BASE_URL === './' ? '/' : (process.env.BASE_URL || '/official/')

const router = createRouter({
  history: createWebHistory(base),
  routes
})

// 添加路由错误处理
router.onError((error) => {
  console.error('路由错误:', error)
})

export default router
