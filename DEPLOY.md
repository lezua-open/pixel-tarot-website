# Zeabur 部署指南

## 后端部署（Python API）

### 1. 准备工作

确保 `api/` 目录下有以下文件：
- `Dockerfile` ✅
- `.dockerignore` ✅
- `pyproject.toml` ✅

### 2. 在 Zeabur 部署

1. 登录 [Zeabur 控制台](https://zeabur.com)
2. 创建新项目（或使用已有项目）
3. 点击 "Add Service" → "Git"
4. 连接你的 GitHub 仓库
5. 选择 `api/` 目录作为根目录
6. Zeabur 会自动检测 Dockerfile 并部署

### 3. 配置环境变量

在 Zeabur 控制台 → 你的服务 → Variables，添加：

```
DATABASE_URL=mysql+pymysql://root:G4ju2Mbw7dRLBZ3mp659OgE8Ae10ksaS@43.156.128.15:31109/zeabur
MIMO_API_KEY=你的真实API密钥
MIMO_API_BASE=https://你的真实API地址
MIMO_MODEL_NAME=你的模型名称
CORS_ORIGINS=https://你的前端域名.vercel.app
```

### 4. 获取后端域名

部署成功后，Zeabur 会分配一个域名，类似：
```
https://your-service.zeabur.app
```

记下这个域名，前端需要用。

---

## 前端部署

### 1. 修改 API 地址

在 `src/app/api/client.ts` 中，将 API 地址改为环境变量：

```typescript
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";
```

### 2. 在 Vercel/Netlify 部署

1. 连接 GitHub 仓库
2. 设置环境变量：
   ```
   VITE_API_BASE=https://your-service.zeabur.app
   ```
3. 部署

---

## 验证部署

1. 访问 `https://your-service.zeabur.app/health` 应该返回：
   ```json
   {"status": "healthy"}
   ```

2. 访问 `https://your-service.zeabur.app/docs` 可以看到 API 文档

3. 前端应该能正常抽牌和获取解读

---

## 常见问题

### Q: CORS 错误
A: 确保后端 `CORS_ORIGINS` 包含前端域名

### Q: 数据库连接失败
A: 检查 `DATABASE_URL` 是否正确，确保 MySQL 服务在 Zeabur 上运行

### Q: LLM 调用失败
A: 检查 `MIMO_API_KEY` 和 `MIMO_API_BASE` 是否正确

### Q: 502 错误
A: 检查 Docker 日志，可能是启动失败
