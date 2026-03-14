
### 1.功能介绍

```markdown
# 🤖 AI 聊天语音助手

一个基于 Flask 的 AI 聊天应用，支持 DeepSeek 和 Qwen 大模型，并集成了丰富的语音合成功能，让 AI 能够"开口说话"。

![Python](https://img.shields.io/badge/Python-3.13-blue)
![Flask](https://img.shields.io/badge/Flask-3.0-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

## ✨ 功能特性

### 💬 智能对话
- 支持 **DeepSeek-V3** 和 **Qwen-Max** 双模型切换
- 支持多轮对话上下文记忆
- 自动保存最近 20 条对话历史

### 🎙️ 语音合成
- **50+ 种特色音色**：曼波、沙老板、理塘小子、电子奸臣等
- **7 大分类**：特色、角色、解说、童声、女声、男声、方言
- 支持 **15 种方言**：粤语、四川话、东北话、上海话等
- 播放控制：播放/暂停/继续、从头播放

### 🎛️ 交互体验
- 实时语音开关控制
- 音频缓存机制，重复播放无需重新请求
- 响应式界面设计，支持多种屏幕尺寸

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone <your-repo-url>
cd ai-chat-voice-assistant
```

### 2. 安装依赖

**bash**复制

```bash
pip install -r requirements.txt
```

### 3. 配置 API 密钥

编辑 `config.py`，填入你的 API 密钥：

**Python**复制

```python
API_KEYS = {
    'deepseek': 'your-deepseek-api-key-here',  # DeepSeek API 密钥
    'qwen': 'your-qwen-api-key-here',          # 阿里云 DashScope API 密钥
}
```

> 💡 提示：你也可以通过环境变量配置密钥：
>
> * `DEEPSEEK_API_KEY`
> * `QWEN_API_KEY`

### 4. 启动服务

**bash**复制

```bash
python app.py
```

访问 [http://127.0.0.1:5000](http://127.0.0.1:5000/) 开始使用！

## 📁 项目结构

**plain**复制

```plain
├── app.py              # Flask 后端主程序
├── config.py           # 配置文件（API 密钥、模型配置、音色列表）
├── requirements.txt    # Python 依赖包
├── templates/
│   └── index.html      # 前端页面模板
└── static/
    ├── css/
    │   └── style.css   # 样式文件（当前为空，样式在 HTML 内联）
    └── js/
        └── app.js      # 前端逻辑处理
```

## 🔧 核心组件说明

### 后端 API 接口

**表格**

| 接口                   | 方法 | 说明                               |
| :--------------------- | :--- | :--------------------------------- |
| `/`                  | GET  | 渲染主页面                         |
| `/api/models`        | GET  | 获取可用模型列表                   |
| `/api/voices`        | GET  | 获取可用音色列表                   |
| `/api/chat`          | POST | 发送消息，返回 AI 回复和音频 URL   |
| `/api/audio_proxy`   | GET  | 代理音频请求，返回 base64 编码音频 |
| `/api/clear_history` | POST | 清空当前会话历史                   |

### 语音 API 配置

语音服务使用第三方 TTS API，支持 50+ 种音色：

**Python**复制

```python
TTS_CONFIG = {
    'base_url': 'https://api-v2.cenguigui.cn/api/speech/AiChat/',
    'available_voices': [
        # 特色音色
        {'name': '曼波', 'category': '特色'},
        {'name': '沙老板', 'category': '特色'},
        {'name': '理塘小子', 'category': '特色'},
        # ... 更多音色
    ]
}
```

## 🎯 使用指南

### 基本操作流程

1. **选择模型** ：在左侧边栏选择 DeepSeek 或 Qwen
2. **选择音色** ：从 7 大分类中选择喜欢的声音
3. **开启/关闭语音** ：点击"启用语音合成"开关
4. **发送消息** ：输入文字，按 Enter 发送
5. **播放控制** ：

* ▶️ 播放/暂停（支持继续播放）
* ↻ 从头播放

### 音色推荐

**表格**

| 场景     | 推荐音色                      |
| :------- | :---------------------------- |
| 娱乐搞笑 | 曼波、电子奸臣、激昂张飞      |
| 正式解说 | 青年主播、解说男声、译制腔    |
| 儿童内容 | 萌小孩、元气正太、超萌奶娃    |
| 地方特色 | 粤语男声/女声、四川话、东北话 |

## ⚙️ 技术细节

### 音频处理流程

**plain**复制

```plain
用户发送消息
    ↓
后端调用 LLM API 生成回复
    ↓
调用 TTS API 获取音频 URL
    ↓
前端请求 /api/audio_proxy
    ↓
后端下载音频 → base64 编码 → JSON 返回
    ↓
前端 base64 → Data URI → Audio 对象播放
```

### 音频存储机制

* **无本地文件存储** ：音频全程在内存中处理
* **页面级缓存** ：使用 `state.audioCache` 缓存 Audio 对象
* **刷新即清空** ：页面刷新后需重新请求音频

## 🔒 安全说明

* API 密钥存储在 `config.py` 或环境变量中，**不要提交到 Git**
* 对话历史存储在服务器内存中，重启后清空
* 建议在生产环境使用 HTTPS 和更安全的密钥管理方式

## 🐛 常见问题

### Q: 音频播放失败？

A: 检查浏览器控制台和网络请求，确认：

1. `audio_proxy` 接口返回 200
2. 返回的 JSON 包含有效的 base64 音频数据

### Q: 音色选择无效？

A: 确保 `config.py` 中的音色 `name` 与 API 要求的名称一致，当前代码已使用 `name` 作为参数值。

### Q: 如何添加新音色？

A: 在 `config.py` 的 `TTS_CONFIG['available_voices']` 列表中添加新条目即可。

## 📝 更新日志

### v1.0 (2026-03-15)

* ✅ 支持 DeepSeek 和 Qwen 双模型
* ✅ 集成 50+ 种特色音色 TTS
* ✅ 实现播放/暂停/重播控制
* ✅ 支持多轮对话上下文

## 🤝 贡献指南

欢迎提交 Issue 和 PR！

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目基于 [MIT](https://www.kimi.com/chat/LICENSE) 许可证开源。

---

**Made with ❤️ by [Your Name]**

**plain**复制

```plain

---

## 📋 使用说明

将以上内容保存为 `README.md` 文件，放在项目根目录：
```

ai-chat-voice-assistant/
├── README.md           ← 新建文件
├── app.py
├── config.py
├── requirements.txt
├── templates/
│   └── index.html
└── static/
├── css/
│   └── style.css
└── js/
└── app.js
