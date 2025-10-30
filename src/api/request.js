import axios from 'axios'
import { ElMessage } from 'element-plus'

// 基础 axios 实例
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API || '', // 可通过 .env 配置 VUE_APP_BASE_API
  timeout: 15000,
  withCredentials: false
})

// 请求拦截器：可在此注入 token、公共参数等
service.interceptors.request.use(
  (config) => {
    // 例如：从本地存储获取 token
    const token = localStorage.getItem('TOKEN')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
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
    let message = '网络异常，请稍后重试'

    if (error.response) {
      const { status, data } = error.response
      // 简单的状态码到消息的映射
      const statusMap = {
        400: '请求参数错误',
        401: '未授权或登录过期',
        403: '无权限访问',
        404: '资源不存在',
        500: '服务器错误'
      }
      message = (data && (data.message || data.msg)) || statusMap[status] || message
    } else if (error.message && error.message.includes('timeout')) {
      message = '请求超时，请检查网络'
    }

    ElMessage.error(message)
    return Promise.reject(error)
  }
)

export default service


