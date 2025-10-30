# 🦊 Campus Assistant - 使用指南

University of Rochester 校园生活助手应用

---

## 🚀 直接访问

**公网地址:** https://hegemonic-ontogenetically-forest.ngrok-free.dev

打开链接即可看到登录页面，点击任意演示账号即可登录

---

## 👥 演示账号

| 账号 | Net ID | 密码 | 头像 | 专业 | 特点 |
|------|--------|------|------|------|------|
| Fox | `fox123` | `rochester2025` | 🦊 | CS Junior | 6门课程,任务管理积极 |
| Bear | `bear456` | `yellowjacket` | 🐻 | Math Senior | 即将毕业,学位进度95% |
| Cat | `cat789` | `meowmeow123` | 🐱 | Biology Sophomore | 5门生物课程 |

**提示:** 在登录页面可以直接点击账号卡片自动填充

---

## ✨ 主要功能

### 1. 用户认证
- 🔐 安全登录验证
- 👤 多用户支持（3个演示账号）
- 💾 数据持久化 (localStorage)
- 🚪 登出功能

### 2. 任务管理 ⭐ 增强
- ➕ 添加新任务（支持日期选择，英文格式显示）
- ✅ 点击完成 → 自动移至 History
- ↩️ **新功能：点击 History 中的任务 → 恢复到 My Tasks**
- 📜 展开/折叠历史记录（"Select to Show More"）
- 💾 所有操作自动保存到 localStorage
- 🔄 双向任务流转

### 3. 个人资料与邮件列表
- 👤 个人信息展示（头像、邮箱、学号）
- 📧 Frequent Mailing List
- ➕ 添加联系人功能（"+" 按钮）
- 📱 6种分类：Professors / TA / Classmates / Friends / Club / Research
- 🔽 **所有分类可点击展开/折叠**（包括 Professors）
- 📧 点击邮箱直接打开邮件客户端

### 4. 课程管理
- 📅 每周课程日历
- 🕐 时间表视图
- 📍 教室位置
- 👨‍🏫 教授信息

### 5. 学位进度追踪 ⭐ 实时联动
- 📊 **实时进度更新：勾选课程 → 顶部进度立即变化**
- ✅ 5个类别自动计算：
  - Pre-major requirements
  - Core courses (如 5/6 → 6/6)
  - Math requirements
  - Advanced Requirements
  - Upper-level writing courses
- 🎯 自动标记完成（显示 ✓）
- 💾 进度持久化保存

### 6. 快速导航
- **左侧菜单链接（全部可跳转至 UR 官网）:**
  - 🗺️ Map & Locations（River Campus, Medical Center, Eastman, South Campus）
  - 🚌 Transportation（Shuttles, Electric Vehicle, Safe Ride）
  - 🍽️ Food & Dining（Dining Halls, Cafes, Meal Plans）
  - 📚 Study Spaces（Library, Room Reservations, Printing）
  - 🎓 Campus Life（Events, CCC, Health, Housing, Safety）
- **顶部链接:**
  - 📧 Gmail
  - 📊 Gradescope
  - 🏫 University of Rochester Logo

---

## 💻 本地部署

### 使用Python HTTP Server

```bash
# 1. 进入代码目录
cd "/Users/zzh/Pychram/CSC 212/Final Project/Prototype/Code"

# 2. 启动服务器
python3 -m http.server 8000

# 3. 浏览器访问
open http://localhost:8000
```

### 使用启动脚本

```bash
# 启动 (包含本地服务器 + ngrok)
./start.sh

# 停止
./stop.sh
```

### 本地访问地址

- **你自己:** `http://localhost:8000`
- **同一WiFi:** `http://你的IP:8000`

获取IP地址:
```bash
ipconfig getifaddr en0
```

---

## 🌐 远程访问

让不在同一WiFi的朋友也能访问你的应用。

### 方法1: 使用 ngrok (推荐)

#### 设置步骤:

1. **注册 ngrok**
   - 访问: https://dashboard.ngrok.com/signup
   - 用 Google 账号一键注册 (30秒)

2. **获取 authtoken**
   - 登录后复制你的 authtoken

3. **配置 ngrok**
   ```bash
   ngrok config add-authtoken 你的token
   ```

4. **启动隧道**
   ```bash
   # 先启动本地服务器
   cd Code
   python3 -m http.server 8000 &

   # 启动 ngrok
   ngrok http 8000
   ```

5. **获取公网地址**
   - 会显示类似: `https://xxxx.ngrok-free.dev`
   - 分享给朋友即可

#### 优点:
- ✅ 无需任何确认,直接访问
- ✅ 非常稳定
- ✅ 支持 HTTPS
- ✅ 有Web管理界面 (http://localhost:4040)

---

### 方法2: 使用 localtunnel

```bash
# 安装 (只需一次)
npm install -g localtunnel

# 启动
lt --port 8000
```

**优点:** 无需注册
**缺点:** 第一次访问需要点击确认按钮

---

### 方法3: 使用 Cloudflare Tunnel

```bash
# 安装
brew install cloudflare/cloudflare/cloudflared

# 启动
cloudflared tunnel --url http://localhost:8000
```

**优点:** Cloudflare 提供,稳定快速
**缺点:** URL 会变化

---

## 📖 使用说明

### 登录

1. 打开登录页面
2. 点击演示账号卡片(自动填充) 或手动输入
3. 点击 "Sign In"

### 任务管理 ⭐ 双向流转

**添加任务:**
1. 点击右下角蓝色 "+" 按钮
2. 选择日期 (可选，显示为英文格式如 "Oct 30")
3. 输入任务名称
4. 点击 "Add"

**完成任务（Task → History）:**
- 点击 My Tasks 中任务前的 checkbox
- 任务立即移到 History 区域
- 数据自动保存

**恢复任务（History → Task）:** ⭐ 新功能
- 点击 "Select to Show More" 展开历史记录
- 点击 History 中任务前的 checkbox
- 任务恢复到 My Tasks 列表
- 数据自动保存

**展开/折叠历史:**
- 点击 "Select to Show More" → 展开 History
- 点击 "Select to Hide" → 折叠 History

### 个人资料

**查看资料:**
1. 点击左上角头像
2. 选择 "Manage My Profile"

**添加联系人:**
1. 进入个人资料页面
2. 找到 "Frequent Mailing List"
3. 点击右上角 "+" 按钮
4. 填写信息并保存

**查看分类:**
- 点击 TA / Classmates / Friends / Club / Research
- 可展开查看联系人
- 空分类也可以展开

### 学位追踪 ⭐ 实时联动

**更新进度:**
1. 进入 "Degree Progress Tracker" 页面
2. 勾选/取消勾选已完成的课程
3. **顶部进度摘要立即实时更新** ⭐
   - Pre-major requirements (4/4 → ✓)
   - Core courses (5/6 → 6/6)
   - Math requirements (2/2 → ✓)
   - Advanced Requirements (2/4 → 3/4)
   - Upper-level writing courses (1/2 → 2/2 → ✓)
4. 所有进度自动保存到 localStorage

**查看进度:**
- 顶部显示总体完成情况
- ✓ 表示该类别已完成
- x/y 表示完成数/总数（实时计算）
- 每个 checkbox 的状态都会持久化保存

**工作原理:**
```
勾选课程 → 计算该类别完成数 → 更新顶部摘要 → 保存到 localStorage
```

### 登出

1. 点击头像
2. 选择 "Sign Out"
3. 自动返回登录页面

---

## 🛠️ 故障排除

### Q: 登录后页面空白?
**A:**
1. 检查浏览器控制台是否有错误
2. 确保 `users-database.js` 在同一目录
3. 清除浏览器缓存重试
4. 确保启用了 JavaScript 和 localStorage

### Q: 任务没有保存?
**A:**
1. 检查浏览器是否启用 localStorage
2. 不要使用无痕模式
3. 检查浏览器存储空间

### Q: 日期格式是中文?
**A:** 日期选择器的语言由浏览器决定,但显示会转为英文格式(如 Oct 30)

### Q: ngrok 链接打不开?
**A:**
1. 检查本地服务器: `lsof -ti:8000`
2. 检查 ngrok: `ps aux | grep ngrok`
3. 查看 ngrok 日志: `cat /tmp/ngrok.log`
4. 重启服务: `./stop.sh && ./start.sh`

### Q: 朋友访问时要求密码?
**A:**
- localtunnel 会有确认页面,点击 "Continue" 即可
- ngrok 免费版会有 "Visit Site" 页面,点击继续
- 这是正常的安全机制

### Q: 数据丢失了?
**A:**
- 检查是否清除了浏览器数据
- 使用相同浏览器和设备
- 不要使用无痕模式

### Q: 无法添加联系人?
**A:**
1. 确保在个人资料页面
2. 点击 Mailing List 右上角的 "+" 按钮
3. 填写完整信息
4. 检查是否有JavaScript错误

---

## 📁 项目结构

```
Final Project/
├── Code/                          # 代码文件夹
│   ├── index.html                 # 登录页面（简洁版，无 prototype 内容）
│   ├── campus-assistant.html     # 主应用（49KB，完整功能）
│   ├── users-database.js         # 用户数据库（3个演示账号）
│   ├── app.js                     # 应用逻辑（15KB，模块化）
│   ├── start.sh                  # 启动脚本（一键启动）
│   └── stop.sh                   # 停止脚本（一键关闭）
│
└── USER_GUIDE.md                 # 📖 本文档（完整使用指南）

功能模块:
- 用户认证与会话管理
- 任务管理（双向流转）
- 邮件列表（可展开分类）
- 学位进度追踪（实时联动）
- 数据持久化（localStorage）
```

---

## 🔧 技术栈

- **前端框架:** 原生 HTML5, CSS3, JavaScript (ES6+)
- **架构模式:** 单页应用 (SPA)
- **数据存储:**
  - LocalStorage（持久化数据：任务、联系人、学位进度）
  - SessionStorage（会话管理：当前登录用户）
- **服务器:** Python HTTP Server (http.server)
- **远程部署:** ngrok (主要) / localtunnel / Cloudflare Tunnel
- **代码组织:** 模块化 JavaScript (app.js 独立)
- **CSS 动画:** CSS3 Transitions（展开/折叠效果）

---

## ⚠️ 注意事项

1. **数据存储**
   - 使用 localStorage 实现数据持久化
   - 数据存储在浏览器本地
   - 清除浏览器数据会丢失信息

2. **浏览器兼容**
   - 推荐: Chrome, Safari, Firefox
   - 需要启用 JavaScript
   - 需要启用 localStorage

3. **安全性**
   - 演示版本,密码明文存储
   - 仅供学习和展示使用
   - 生产环境需要后端加密

4. **网络要求**
   - 本地访问: 无需网络
   - 同WiFi: 需连接同一网络
   - 远程访问: 需要互联网连接

---

## 🚀 未来改进

- [ ] 后端API + 真实数据库
- [ ] 用户注册功能
- [ ] 密码加密
- [ ] 头像上传
- [ ] 邮件通知
- [ ] 移动应用
- [ ] 数据导出
- [ ] 多语言支持

---

## 📞 获取帮助

遇到问题?
1. 查看 [故障排除](#故障排除) 部分
2. 检查浏览器控制台错误信息
3. 重启服务: `./stop.sh && ./start.sh`

---

---

## 📝 版本历史

### Version 4.0 (Current) - October 30, 2025
- ✅ 双向任务流转（Task ↔ History）
- ✅ 所有邮件分类可展开（包括 Professors）
- ✅ 学位进度实时联动更新
- ✅ 左侧菜单链接全部可跳转至 UR 官网
- ✅ 数据持久化完整实现
- ✅ 模块化代码结构（app.js 独立）
- ✅ 调试日志完善

### Version 3.0 - October 30, 2025
- 左侧菜单链接格式修复
- Professors 分类可展开

### Version 2.0 - October 30, 2025
- 任务完成移动到 History
- 添加联系人功能
- 学位进度追踪

### Version 1.0 - October 30, 2025
- 初始版本
- 基础功能实现

---

**Made with ❤️ for University of Rochester**

*Version 4.0 | Last Updated: October 30, 2025*
