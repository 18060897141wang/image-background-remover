# MVP 需求文档：Image Background Remover

项目名称：`image-background-remover`

核心关键词：`image background remover`

## 1. 产品目标

开发一个简单、可上线的在线图片背景移除网站。

MVP 版本需要支持用户上传图片，通过 Remove.bg API 自动移除背景，预览处理结果，并下载透明 PNG 图片。

第一版应该满足：

- 可以部署到 Cloudflare
- 加载速度快
- 支持移动端
- 具备基础 SEO 能力
- 不依赖数据库
- 不存储用户图片
- 可以尽快上线验证需求

## 2. 产品定位

这是一个在线图片背景移除工具。

核心价值主张：

> 自动移除图片背景，并在几秒内下载透明 PNG。

首页应该直接展示可用工具，而不是只做营销介绍页。

## 3. 技术方案

前端：

- Vite
- React
- TypeScript

后端 API：

- Cloudflare Pages Functions 或 Cloudflare Worker

第三方图片处理服务：

- Remove.bg API

部署平台：

- Cloudflare Pages

密钥管理：

- `REMOVE_BG_API_KEY`

存储策略：

- 不使用数据库
- 不使用对象存储
- 不持久化保存用户图片
- 图片只在一次请求处理过程中经过内存

## 4. 核心用户流程

1. 用户打开网站。
2. 用户上传图片。
3. 前端校验文件类型和文件大小。
4. 前端展示原图预览。
5. 用户点击 `Remove Background`。
6. 前端将图片发送到 `/api/remove-background`。
7. Cloudflare API 将图片转发给 Remove.bg。
8. Remove.bg 返回处理后的透明 PNG。
9. 页面展示处理结果。
10. 用户下载透明 PNG。

## 5. MVP 功能范围

### 必须包含

- 图片上传
- 原图预览
- 通过 Remove.bg API 移除背景
- 结果图片预览
- 透明 PNG 下载
- 处理中 loading 状态
- 错误提示
- 文件类型校验
- 文件大小校验
- 桌面端和移动端适配
- 基础 SEO 信息
- 隐私说明：本网站不存储用户上传图片

### MVP 暂不包含

- 用户账号
- 登录系统
- 支付系统
- 积分或点数系统
- 批量处理
- 图片历史记录
- 数据库
- 云端图片存储
- 自研 AI 模型
- 高级图片编辑器
- 对外开放开发者 API
- 后台管理系统

## 6. 页面结构

首页建议包含：

- Header
- 主上传工具区
- 结果预览区
- How it works
- Use cases
- FAQ
- Footer

推荐 H1：

```text
Image Background Remover
```

推荐副标题：

```text
Remove image backgrounds automatically and download transparent PNGs in seconds.
```

主要按钮文案：

```text
Upload Image
Remove Background
Download PNG
```

## 7. API 设计

接口地址：

```text
POST /api/remove-background
```

请求格式：

```text
multipart/form-data
```

请求字段：

```text
image: File
```

服务端处理流程：

1. 从请求中读取上传图片。
2. 判断是否上传了文件。
3. 校验图片 MIME 类型。
4. 校验图片大小。
5. 将图片发送到 Remove.bg API。
6. 将处理后的 PNG 返回给前端。

成功响应：

```text
Content-Type: image/png
```

失败响应：

```json
{
  "error": "Failed to remove background"
}
```

## 8. Remove.bg API 集成

Remove.bg 接口地址：

```text
POST https://api.remove.bg/v1.0/removebg
```

必需请求头：

```text
X-Api-Key: REMOVE_BG_API_KEY
```

表单字段：

```text
image_file: 上传图片
size: auto
format: png
```

API key 只能在服务端使用，不能暴露在前端 JavaScript 代码中。

## 9. 文件校验

支持的图片格式：

- `image/jpeg`
- `image/png`
- `image/webp`

建议最大文件大小：

```text
10MB
```

前端和后端都需要做校验。

## 10. 错误处理

MVP 需要处理以下错误：

- 未上传图片
- 文件格式不支持
- 文件过大
- 缺少 Remove.bg API key
- Remove.bg API 额度不足
- Remove.bg API 请求失败
- 网络请求失败
- 用户在处理中重复点击按钮

示例错误提示：

```text
Please upload a JPG, PNG, or WebP image.
The image is too large. Please upload an image under 10MB.
Background removal failed. Please try again.
```

## 11. SEO 要求

推荐页面标题：

```text
Image Background Remover - Remove Background Online
```

推荐 meta description：

```text
Remove image backgrounds automatically and download transparent PNGs online. Fast, simple, and no signup required.
```

需要自然覆盖的关键词：

- image background remover
- remove background from image
- transparent PNG
- background remover online
- remove image background

推荐 FAQ 问题：

- Is this image background remover free?
- What image formats are supported?
- Do you store my uploaded images?
- Can I download a transparent PNG?
- Does this work on mobile?

## 12. 隐私要求

网站需要明确说明：

```text
Uploaded images are processed in memory and are not stored on our servers.
```

需要补充说明：

- 本网站自身不保存用户上传图片。
- 上传图片会发送到 Remove.bg 进行处理。
- MVP 不创建图片历史记录。
- 用户不需要注册账号。

## 13. 环境变量

Cloudflare 环境变量：

```text
REMOVE_BG_API_KEY=your_remove_bg_api_key
```

本地开发文件：

```text
.dev.vars
```

示例：

```text
REMOVE_BG_API_KEY=replace_with_real_key
```

`.dev.vars` 不能提交到 Git。

## 14. 验收标准

MVP 完成标准：

- 用户可以上传支持格式的图片。
- 用户可以预览原图。
- 用户可以成功移除图片背景。
- 用户可以预览处理后的结果。
- 用户可以下载透明 PNG。
- 不支持的文件格式会显示明确错误提示。
- 文件过大会显示明确错误提示。
- Remove.bg API 失败时会显示明确错误提示。
- API key 不会暴露在前端代码中。
- 图片不会保存到磁盘、数据库或对象存储。
- 网站在桌面端和移动端都能正常使用。
- 网站可以成功部署到 Cloudflare Pages。

## 15. 后续版本规划

### V1.1

- 拖拽上传
- Before / After 对比滑块
- 示例图片
- 更完整的 FAQ
- Cloudflare Web Analytics

### V1.2

- 批量处理
- 图片尺寸选项
- 使用次数限制
- 更好的结果分享能力

### V2

- 用户账号
- 订阅付费
- Credits 点数系统
- 自托管背景移除模型
- 面向开发者开放 API
