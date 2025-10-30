const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: './',
  outputDir: 'dist',
  assetsDir: 'static',
  lintOnSave: false,
  devServer: {
    port: 8080,
    open: true,
    proxy: {
      '/api': {
        target: 'http://119.45.45.25',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
