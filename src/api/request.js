import axios from 'axios'
import { ElMessage } from 'element-plus'

// 兼容本地开发未能使用代理的情况：在 localhost 环境下直接指向后端域名
const isLocalhost = typeof window !== 'undefined' && /localhost|127\.0\.0\.1/.test(window.location.host)
const fallbackBase = isLocalhost ? 'http://119.45.45.25' : ''

// 基础 axios 实例
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API || fallbackBase || '',
  timeout: 15000,
  withCredentials: false
})

// 统一设置为 JSON 请求体
service.defaults.headers.post['Content-Type'] = 'application/json'
service.defaults.headers.put['Content-Type'] = 'application/json'

// 请求拦截器：可在此注入 token、公共参数等
service.interceptors.request.use(
  (config) => {
    // 例如：从本地存储获取 token
    const token = localStorage.getItem('TOKEN')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    if (config.method && ['post', 'put', 'patch'].includes(config.method)) {
      config.headers['Content-Type'] = config.headers['Content-Type'] || 'application/json'
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器：统一处理返回与错误
service.interceptors.response.use(
  (response) => {
    // 默认直接返回后端 data；
    // 如果你的后端有统一 code 规范，可在此判断 code 再决定是否抛错
    return response.data
  },
  (error) => {
    // 对于 404 错误，不显示错误提示（通常是可选的 API，如 banner）
    // 让调用方自己决定是否需要显示错误
    if (error.response && error.response.status === 404) {
      return Promise.reject(error)
    }

    let message = '网络异常，请稍后重试'

    if (error.response) {
      const { status, data } = error.response
      // 简单的状态码到消息的映射
      const statusMap = {
        400: '请求参数错误',
        401: '未授权或登录过期',
        403: '无权限访问',
        500: '服务器错误'
      }
      message = (data && (data.message || data.msg)) || statusMap[status] || message
    } else if (error.message && error.message.includes('timeout')) {
      message = '请求超时，请检查网络'
    }

    // 对于非 404 错误才显示提示
    ElMessage.error(message)
    return Promise.reject(error)
  }
)

export default service


