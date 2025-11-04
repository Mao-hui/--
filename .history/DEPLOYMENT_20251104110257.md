# 部署说明

## 路由模式说明

本项目使用 **Vue Router Hash 模式**，URL 格式为：`http://域名/#/路由路径`

例如：
- 首页：`http://119.45.45.25/official/#/`
- 产品页：`http://119.45.45.25/official/#/products`
- 新闻页：`http://119.45.45.25/official/#/news`

## Hash 模式的优点

✅ **无需服务器配置** - 不需要配置 Nginx 的 `try_files` 或 Apache 的 `.htaccess`  
✅ **刷新不404** - 在任何页面刷新都不会出现 404 错误  
✅ **部署简单** - 直接将构建后的文件上传到服务器即可  

## Hash 模式的缺点

⚠️ **URL 中有 # 符号** - 不够美观  
⚠️ **SEO 不友好** - 搜索引擎对 hash 路由的支持不如 history 模式（但对于企业官网影响较小）  

## 部署步骤

### 1. 构建项目
```bash
npm run build
```

### 2. 上传文件
将 `dist` 目录中的所有文件上传到服务器的 `/official/` 目录（或您的部署目录）

### 3. 配置服务器（可选，仅用于静态文件服务）

如果使用 Nginx/OpenResty，只需要基本的静态文件配置：

```nginx
server {
    listen 80;
    server_name 119.45.45.25;
    
    root /var/www/html;
    
    # 静态文件服务（无需特殊路由配置）
    location /official/ {
        alias /var/www/html/official/;
        index index.html;
    }
}
```

**注意**：使用 hash 模式时，不需要 `try_files` 配置！服务器只需要提供静态文件服务即可。

## 验证部署

配置完成后，测试以下场景：

1. ✅ 访问首页：`http://119.45.45.25/official/#/` - 应该正常
2. ✅ 点击导航到产品页：`http://119.45.45.25/official/#/products` - 应该正常
3. ✅ **刷新产品页**：在 `/official/#/products` 页面按 F5 刷新 - **不会404**
4. ✅ 直接访问：直接在浏览器输入 `http://119.45.45.25/official/#/products` - 应该正常

## 常见问题

### Q: URL 中的 # 符号可以去掉吗？
A: 可以，但需要改用 history 模式并配置服务器路由重定向。如果无法修改服务器配置，建议继续使用 hash 模式。

### Q: 刷新后仍然404？
A: 检查以下几点：
- 确认使用的是 hash 模式（URL 中应该有 `#` 符号）
- 确认文件已正确上传到服务器
- 检查浏览器控制台是否有错误信息

### Q: 如何切换到 history 模式？
A: 修改 `src/router/index.js`，将 `createWebHashHistory()` 改为 `createWebHistory(base)`，并按照之前的文档配置服务器路由重定向。

