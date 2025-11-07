import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Products from '../views/Products.vue'
import ProductDetail from '../views/ProductDetail.vue'
import Solutions from '../views/Solutions.vue'
import SolutionDetail from '../views/SolutionDetail.vue'
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
    path: '/product-detail',
    name: 'ProductDetail',
    component: ProductDetail
  },
  {
    path: '/solutions',
    name: 'Solutions',
    component: Solutions
  },
  {
    path: '/solution-detail',
    name: 'SolutionDetail',
    component: SolutionDetail
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

// 使用 hash 模式，无需配置 base
// hash 模式的优点：不需要服务器配置，刷新页面不会出现 404
// 缺点：URL 中会有 # 符号，对 SEO 不友好（但对于单页应用影响较小）
const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// 添加路由错误处理
router.onError((error) => {
  console.error('路由错误:', error)
})

export default router
