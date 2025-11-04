# 向量科技官网

基于Vue3 + Element Plus构建的现代化企业官网，展示向量科技的专业服务和技术能力。

## 项目特色

- 🚀 基于Vue3 Composition API开发
- 🎨 使用Element Plus UI组件库
- 📱 响应式设计，支持多端适配
- 🎯 现代化UI设计，用户体验优秀
- ⚡ 性能优化，加载速度快

## 技术栈

- **前端框架**: Vue 3.3.4
- **UI组件库**: Element Plus 2.3.8
- **路由管理**: Vue Router 4.2.4
- **构建工具**: Vue CLI 5.0.8
- **样式预处理**: Sass
- **图标库**: Element Plus Icons

## 项目结构

```
src/
├── components/          # 通用组件
│   ├── Header.vue      # 导航栏组件
│   └── Footer.vue      # 页脚组件
├── views/              # 页面组件
│   ├── Home.vue        # 首页
│   ├── Products.vue    # 产品中心
│   ├── Solutions.vue   # 解决方案
│   ├── News.vue        # 新闻中心
│   ├── NewsDetail.vue  # 新闻详情
│   └── About.vue       # 关于我们
├── router/             # 路由配置
│   └── index.js
├── assets/             # 静态资源
│   └── styles/
│       └── main.scss   # 全局样式
├── App.vue             # 根组件
└── main.js             # 入口文件
```

## 功能模块

### 1. 首页
- 英雄区域展示公司核心业务
- 企业开发能力介绍
- 解决方案概览
- 为什么选择我们的优势展示

### 2. 产品中心
- 服务快消行业产品
- 工厂制造行业产品
- 产品分类导航
- 产品详情展示

### 3. 解决方案
- 电商平台解决方案
- 工业制造解决方案
- 详细功能模块介绍
- 技术架构说明

### 4. 新闻中心
- 新闻列表展示
- 新闻详情页面
- 分页功能
- 相关文章推荐

### 5. 关于我们
- 公司介绍
- 联系方式
- 招聘信息
- 二维码关注

## ⚠️ 重要提示

本项目使用 **Hash 路由模式**，无需配置服务器路由重定向即可正常部署。详情请查看 `DEPLOYMENT.md` 文件。

## 安装和运行

### 环境要求
- Node.js >= 14.0.0
- npm >= 6.0.0

### 安装依赖
```bash
npm install
```

### 开发环境运行
```bash
npm run serve
```

### 生产环境构建
```bash
npm run build
```

### 代码检查
```bash
npm run lint
```

## 开发说明

### 样式规范
- 使用SCSS预处理器
- 采用BEM命名规范
- 响应式设计，支持移动端
- 统一的颜色和字体规范

### 组件开发
- 使用Vue3 Composition API
- 组件化开发，提高复用性
- 统一的组件命名规范
- 完善的组件文档

### 路由配置
- 使用Vue Router 4
- 支持动态路由
- 路由懒加载
- 路由守卫

## 部署说明

### 构建优化
- 代码分割和懒加载
- 静态资源压缩
- 图片优化
- CDN加速

### 部署配置

本项目使用 **Hash 路由模式**，部署非常简单，无需配置服务器路由重定向。

1. **构建项目**：
```bash
npm run build
```

2. **部署到服务器**：
   - 将 `dist` 目录中的所有文件上传到服务器
   - 上传到子目录（如 `/official/`）或根目录都可以
   - **无需任何服务器路由配置**，直接提供静态文件服务即可

3. **服务器配置（可选，仅用于静态文件服务）**：

   使用 Hash 模式时，服务器只需要提供基本的静态文件服务，**不需要路由重定向配置**。

   **Nginx/OpenResty 配置示例（子目录部署）**：
   ```nginx
   server {
       listen 80;
       server_name 119.45.45.25;
       root /var/www/html;
       
       # 静态文件服务（无需 try_files 配置）
       location /official/ {
           alias /var/www/html/official/;
           index index.html;
       }
       
       # API 代理（如果需要）
       location /api/ {
           proxy_pass http://119.45.45.25;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       }
   }
   ```

4. **访问地址格式**：
   - 首页：`http://域名/official/#/`
   - 产品页：`http://域名/official/#/products`
   - 新闻页：`http://域名/official/#/news`

   **注意**：URL 中会有 `#` 符号，这是 Hash 模式的特点。

5. **详细部署说明**：
   更多部署详情和常见问题，请查看 `DEPLOYMENT.md` 文件。

   **Apache 配置示例（子目录部署）**：
   ```apache
   # 使用 hash 模式时，Apache 也只需要基本的目录配置
   # 无需 RewriteRule 路由重定向
   <Directory "/var/www/html/official">
       Options Indexes FollowSymLinks
       AllowOverride None
       Require all granted
   </Directory>
   ```

6. **故障排查**：
   - **页面空白**：
     * 打开浏览器开发者工具（F12），查看 Console 和 Network 标签
     * 检查是否有 JavaScript 错误
     * 检查静态资源（CSS、JS）是否加载成功
     * 确认 URL 中包含 `#` 符号（hash 模式的特征）
   - **刷新404**：
     * 使用 hash 模式时不应该出现刷新404问题
     * 如果仍然出现，请检查是否误用了 history 模式
   
   - **资源加载失败**：
     * 检查 `publicPath` 配置是否正确
     * 确认所有静态文件都已上传到服务器
     * 检查服务器是否允许访问 `.js`、`.css` 等文件类型
   
   - **⚠️ 刷新后404错误（重要）**：
     * **这是服务器配置问题，必须配置才能解决！**
     * **OpenResty/Nginx 服务器**：
       - 必须在 Nginx 配置文件中添加：`location /official/ { try_files $uri $uri/ /official/index.html; }`
       - 配置文件位置：`/etc/nginx/conf.d/default.conf` 或 `/etc/nginx/nginx.conf`
       - 配置后执行：`nginx -t` 测试，然后 `nginx -s reload` 重载
       - 详细配置请参考 `nginx.conf.example` 文件
     * **Apache 服务器**：
       - 确认 `/official/` 目录下有 `.htaccess` 文件
       - 文件内容参考上面的 Apache 配置示例
     * **关键点**：`try_files $uri $uri/ /official/index.html;` 这行配置是必需的
     * 如果无法修改服务器配置，请联系服务器管理员
     * 详细说明请查看 `DEPLOYMENT.md` 文件

6. **注意事项**：
   - 不要直接打开 `dist/index.html` 文件（file://协议），history 模式需要服务器支持
   - 必须通过 HTTP 服务器访问打包后的文件
   - 如果需要在本地测试，可以使用 `npx serve dist` 或 `python -m http.server` 启动本地服务器

## 浏览器支持

- Chrome >= 60
- Firefox >= 60
- Safari >= 12
- Edge >= 79

## 联系方式

- 公司名称：蚌埠向量科技有限公司
- 联系电话：18255246289
- 企业微信：wangsong8455
- 公司地址：蚌埠市蚌山区绿地珠峰B座1009室

## 许可证

Copyright © 蚌埠向量科技有限公司版权所有
