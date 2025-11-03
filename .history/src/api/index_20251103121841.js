import request from './request'

// 说明：根据后端返回 "Request method 'GET' not supported"，统一使用 POST 调用以下接口

// 获取产品中心
export function apiGetProduct(data = {}) {
  return request({
    url: '/api/homePage/getProduct',
    method: 'post',
    data
  })
}

// 获取解决方案
export function apiGetScheme(data = {}) {
  return request({
    url: '/api/homePage/getScheme',
    method: 'post',
    data
  })
}

// 获取招聘信息
export function apiGetHire(data = {}) {
  return request({
    url: '/api/homePage/getHire',
    method: 'post',
    data
  })
}

// 获取新闻咨询(分页) body: { pageSize: '10', pageNum: '1' }
export function apiGetNewsList(body) {
  return request({
    url: '/api/homePage/getSysTweetPageList',
    method: 'post',
    data: body
  })
}

// 获取官网首页 banner
export function apiGetBanner(data = {}) {
  return request({
    url: '/api/homePage/offical/getBanner',
    method: 'post',
    data
  })
}

// 获取官网首页方案
export function apiGetBannerScheme(data = {}) {
  return request({
    url: '/api/homePage/offical/getBannerScheme',
    method: 'post',
    data
  })
}

// 获取官网首页开发能力
export function apiGetDevelopment(data = {}) {
  return request({
    url: '/api/homePage/offical/getDevelopment',
    method: 'post',
    data
  })
}

// 获取官网首页独特优势
export function apiGetBannerUa(data = {}) {
  return request({
    url: '/api/homePage/offical/getBannerUa',
    method: 'post',
    data
  })
}

// 获取新闻咨询详情
export function apiGetNewsDetail(data = {}) {
  return request({
    url: '/api/homePage/getSysTweetDetail',
    method: 'post',
    data
  })
}

// 获取解决方案详情
export function apiGetSchemeDetail(data = {}) {
  return request({
    url: '/api/homePage/getSchemeDetail',
    method: 'post',
    data
  })
}

// 获取招聘信息详情
export function apiGetHireDetail(data = {}) {
  return request({
    url: '/api/homePage/getHireDetail',
    method: 'post',
    data
  })
}

