const { defineConfig } = require('@vue/cli-service')

// 根据环境变量设置 publicPath
// 如果部署在根目录，使用 '/'；如果部署在子目录，使用子目录路径（如 '/official/'）
// 注意：子目录路径必须以 / 开头，并以 / 结尾
const publicPath = process.env.NODE_ENV === 'production' ? '/official/' : '/'

module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: publicPath,
  outputDir: 'dist',
  assetsDir: 'static',
  lintOnSave: false,
  // 生产环境关闭 source map 以减小文件大小
  productionSourceMap: false,
  devServer: {
    port: 8080,
    open: true,
    historyApiFallback: true,
    proxy: {
      '/api': {
        target: 'http://119.45.45.25',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
