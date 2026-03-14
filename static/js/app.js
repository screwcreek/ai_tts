// app.js - AI聊天语音助手前端逻辑

// 全局状态
const state = {
    currentModel: '',
    currentVoice: '理塘小子',
    ttsEnabled: true,
    isLoading: false,
    sessionId: generateSessionId(),
    audioContext: null,
    currentAudio: null
};

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// 生成会话ID
function generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// 初始化应用
async function initializeApp() {
    // 绑定事件监听器
    bindEvents();
    
    // 加载模型列表
    await loadModels();
    
    // 加载音色列表
    await loadVoices();
    
    // 初始化音频上下文（需要用户交互后才能使用）
    document.addEventListener('click', initAudioContext, { once: true });
}

// 绑定事件
function bindEvents() {
    // 发送按钮
    document.getElementById('send-btn').addEventListener('click', sendMessage);
    
    // 输入框回车发送
    document.getElementById('chat-input').addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // 自动调整输入框高度
    document.getElementById('chat-input').addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 120) + 'px';
    });
    
    // TTS开关
    document.getElementById('tts-toggle').addEventListener('click', function() {
        state.ttsEnabled = !state.ttsEnabled;
        this.classList.toggle('active');
    });
    
    // 模型选择变化
    document.getElementById('model-select').addEventListener('change', function() {
        state.currentModel = this.value;
        console.log('切换模型:', state.currentModel);
    });
    
    // 音色选择变化
    document.getElementById('voice-select').addEventListener('change', function() {
        state.currentVoice = this.value;
        console.log('切换音色:', state.currentVoice);
    });
}

// 初始化音频上下文
function initAudioContext() {
    if (!state.audioContext) {
        state.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
}

// 加载模型列表
async function loadModels() {
    try {
        const response = await fetch('/api/models');
        const data = await response.json();
        
        const select = document.getElementById('model-select');
        select.innerHTML = '';
        
        data.models.forEach(model => {
            const option = document.createElement('option');
            option.value = model.id;
            option.textContent = model.name;
            select.appendChild(option);
        });
        
        // 默认选择第一个模型
        if (data.models.length > 0) {
            state.currentModel = data.models[0].id;
            select.value = state.currentModel;
        }
    } catch (error) {
        console.error('加载模型失败:', error);
        showError('加载模型列表失败，请刷新页面重试');
    }
}

// 加载音色列表
// 加载音色列表（按分类分组）
async function loadVoices() {
    try {
        const response = await fetch('/api/voices');
        const data = await response.json();
        
        // 保存完整的音色数据供后续使用
        state.voicesData = data.voices;
        
        const select = document.getElementById('voice-select');
        select.innerHTML = '';
        
        // 按分类分组
        const categories = {};
        data.voices.forEach(voice => {
            if (!categories[voice.category]) {
                categories[voice.category] = [];
            }
            categories[voice.category].push(voice);
        });
        
        // 创建分组选项
        const categoryOrder = ['特色', '角色', '解说', '童声', '女声', '男声', '方言', '语言'];
        
        categoryOrder.forEach(category => {
            if (categories[category]) {
                const optgroup = document.createElement('optgroup');
                optgroup.label = `${category} (${categories[category].length})`;
                
                categories[category].forEach(voice => {
                    const option = document.createElement('option');
                    // ✅ 关键修改：使用 name 作为 value，而不是 id
                    option.value = voice.name;  // 如 "沙老板"、"曼波"
                    option.textContent = voice.name;
                    option.title = `${voice.name} - ${voice.desc}`;
                    // 保存 id 作为 data 属性，方便调试
                    option.dataset.id = voice.id;
                    optgroup.appendChild(option);
                });
                
                select.appendChild(optgroup);
            }
        });
        
        // 默认选择"理塘小子"
        const defaultVoice = data.voices.find(v => v.id === 'dingzhen');
        if (defaultVoice) {
            state.currentVoice = defaultVoice.name;  // 使用 name
            select.value = defaultVoice.name;
            updateVoicePreview(defaultVoice);
        } else if (data.voices.length > 0) {
            state.currentVoice = data.voices[0].name;  // 使用 name
            select.value = state.currentVoice;
            updateVoicePreview(data.voices[0]);
        }
        
        // 监听选择变化
        select.addEventListener('change', function() {
            state.currentVoice = this.value;  // 现在已经是 name 了
            // 根据 name 找到对应的 voice 对象
            const selected = data.voices.find(v => v.name === this.value);
            if (selected) {
                updateVoicePreview(selected);
                console.log('切换音色:', selected.name, '(ID:', selected.id + ')');
            }
        });
        
    } catch (error) {
        console.error('加载音色失败:', error);
        showError('加载音色列表失败');
    }
}

// 更新音色预览显示
function updateVoicePreview(voice) {
    const preview = document.getElementById('voice-preview');
    if (preview) {
        preview.textContent = `当前: ${voice.name} (${voice.desc}) - ID: ${voice.id}`;
        preview.style.color = '#667eea';
    }
}

// 发送消息
async function sendMessage() {
    if (state.isLoading) return;
    
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    
    if (!message) return;
    
    if (!state.currentModel) {
        showError('请先选择AI模型');
        return;
    }
    
    // 清空输入框
    input.value = '';
    input.style.height = 'auto';
    
    // 添加用户消息到界面
    addMessage('user', message);
    
    // 显示加载状态
    setLoading(true);

    console.log('发送消息，使用音色:', state.currentVoice);  // 添加调试日志
    
    const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: state.currentModel,
            message: message,
            session_id: state.sessionId,
            enable_tts: state.ttsEnabled,
            voice: state.currentVoice  // 现在这是音色名称，如"沙老板"
        })
    });
    
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: state.currentModel,
                message: message,
                session_id: state.sessionId,
                enable_tts: state.ttsEnabled,
                voice: state.currentVoice
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // 添加AI回复到界面（传入audio_url）
            addMessage('ai', data.text, data.audio_url);
        } else {
            showError(data.error || '请求失败');
        }
    } catch (error) {
        console.error('发送消息失败:', error);
        showError('网络错误，请检查连接');
    } finally {
        setLoading(false);
    }
}

// 添加消息到界面
// 添加消息到界面（修改版，支持音频URL）
function addMessage(role, content, audioUrl = null) {
    const container = document.getElementById('chat-messages');
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;
    
    const avatar = document.createElement('div');
    avatar.className = 'avatar';
    avatar.textContent = role === 'user' ? '我' : 'AI';
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    // 处理换行
    const textDiv = document.createElement('div');
    textDiv.innerHTML = escapeHtml(content).replace(/\n/g, '<br>');
    contentDiv.appendChild(textDiv);
    
    // 如果有音频URL，添加播放控制按钮
    if (audioUrl && role === 'ai') {
        const audioPlayer = document.createElement('div');
        audioPlayer.className = 'audio-player';
        
        // 播放/暂停按钮
        const playBtn = document.createElement('button');
        playBtn.className = 'play-btn';
        playBtn.innerHTML = '▶';
        playBtn.title = '播放/暂停';
        playBtn.onclick = () => toggleAudio(audioUrl, playBtn);
        
        // 重播按钮（从头播放）
        const replayBtn = document.createElement('button');
        replayBtn.className = 'play-btn';
        replayBtn.style.background = '#764ba2';  // 紫色区分
        replayBtn.innerHTML = '↻';
        replayBtn.title = '从头播放';
        replayBtn.onclick = () => replayAudio(audioUrl, playBtn);
        
        const waveDiv = document.createElement('div');
        waveDiv.className = 'audio-wave';
        waveDiv.innerHTML = `
            <div class="wave-bar"></div>
            <div class="wave-bar"></div>
            <div class="wave-bar"></div>
            <div class="wave-bar"></div>
            <div class="wave-bar"></div>
        `;
        
        audioPlayer.appendChild(playBtn);
        audioPlayer.appendChild(replayBtn);
        audioPlayer.appendChild(waveDiv);
        contentDiv.appendChild(audioPlayer);
        
        // 存储当前消息的音频信息
        audioPlayer.dataset.audioUrl = audioUrl;
        audioPlayer.dataset.isPlaying = 'false';
        
        // 自动播放（如果开启TTS）
        if (state.ttsEnabled) {
            setTimeout(() => {
                toggleAudio(audioUrl, playBtn, true);
            }, 500);
        }
    }
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(contentDiv);
    container.appendChild(messageDiv);
    
    scrollToBottom();
}


// 播放/暂停切换（支持继续播放）
function toggleAudio(originalUrl, button, autoPlay = false) {
    // 检查是否已经有这个音频的实例
    const audioKey = 'audio_' + originalUrl;
    
    // 如果当前有其他音频在播放，先暂停
    if (state.currentAudio && state.currentAudioKey !== audioKey) {
        state.currentAudio.pause();
        // 重置其他按钮状态
        document.querySelectorAll('.play-btn').forEach(btn => {
            if (btn.innerHTML === '⏸') btn.innerHTML = '▶';
        });
    }
    
    // 获取或创建音频实例
    let audio = state.audioCache ? state.audioCache[audioKey] : null;
    
    if (!audio) {
        // 首次加载音频
        if (!autoPlay) {
            button.innerHTML = '⏳';
            button.disabled = true;
        }
        
        fetch(`/api/audio_proxy?url=${encodeURIComponent(originalUrl)}`)
            .then(response => response.json())
            .then(data => {
                if (data.error) throw new Error(data.error);
                
                const audioData = `data:audio/${data.format};base64,${data.audio}`;
                audio = new Audio(audioData);
                
                // 缓存音频实例
                if (!state.audioCache) state.audioCache = {};
                state.audioCache[audioKey] = audio;
                
                state.currentAudio = audio;
                state.currentAudioKey = audioKey;
                
                // 设置按钮状态变化监听
                audio.onended = () => {
                    button.innerHTML = '▶';
                    audio.dataset.currentTime = 0;
                };
                audio.onpause = () => {
                    button.innerHTML = '▶';
                };
                audio.onplay = () => {
                    button.innerHTML = '⏸';
                };
                
                button.disabled = false;
                return audio.play();
            })
            .catch(err => {
                console.error('音频加载失败:', err);
                button.innerHTML = '▶';
                button.disabled = false;
                showError('音频加载失败: ' + err.message);
            });
            
    } else {
        // 音频已存在，控制播放/暂停
        state.currentAudio = audio;
        state.currentAudioKey = audioKey;
        
        if (audio.paused) {
            // 暂停中，继续播放
            audio.play().catch(err => {
                console.error('播放失败:', err);
                showError('播放失败');
            });
        } else {
            // 播放中，暂停
            audio.pause();
        }
    }
}


// 从头播放音频
function replayAudio(originalUrl, button) {
    const audioKey = 'audio_' + originalUrl;
    let audio = state.audioCache ? state.audioCache[audioKey] : null;
    
    if (audio) {
        // 重置播放位置
        audio.currentTime = 0;
        audio.play().catch(err => {
            console.error('重播失败:', err);
            showError('重播失败');
        });
        
        // 更新按钮状态
        document.querySelectorAll('.play-btn').forEach(btn => {
            if (btn !== button && btn.innerHTML === '⏸') btn.innerHTML = '▶';
        });
        // 找到对应的播放按钮并更新为暂停图标
        const playBtn = button.parentElement.querySelector('.play-btn');
        if (playBtn) playBtn.innerHTML = '⏸';
        
    } else {
        // 音频未缓存，先加载再播放
        toggleAudio(originalUrl, button, true);
    }
}



// 修改 playAudioFromUrl 函数 - 修复音频播放问题
function playAudioFromUrl(originalUrl, button = null) {
    try {
        if (state.currentAudio) {
            state.currentAudio.pause();
            state.currentAudio = null;
        }
        
        // 显示加载状态
        if (button) {
            button.innerHTML = '⏳';
            button.disabled = true;
        }
        
        // 请求代理接口获取 base64 音频数据
        const proxyUrl = `/api/audio_proxy?url=${encodeURIComponent(originalUrl)}`;
        
        fetch(proxyUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (data.error) {
                    throw new Error(data.error);
                }
                
                // 将 base64 转换为音频播放
                const audioData = `data:audio/${data.format};base64,${data.audio}`;
                const audio = new Audio(audioData);
                state.currentAudio = audio;
                
                if (button) {
                    button.innerHTML = '⏸';
                    button.disabled = false;
                    audio.onended = () => { button.innerHTML = '▶'; };
                    audio.onpause = () => { button.innerHTML = '▶'; };
                }
                
                audio.onerror = (e) => {
                    console.error('音频错误:', e);
                    if (button) button.innerHTML = '▶';
                    showError('音频播放失败');
                };
                
                return audio.play();
            })
            .then(() => {
                console.log('音频播放成功');
            })
            .catch(err => {
                console.error('音频处理失败:', err);
                if (button) {
                    button.innerHTML = '▶';
                    button.disabled = false;
                }
                showError('音频播放失败: ' + err.message);
            });
            
    } catch (error) {
        console.error('音频处理失败:', error);
        if (button) {
            button.innerHTML = '▶';
            button.disabled = false;
        }
        showError('音频处理失败');
    }
}

// 设置加载状态
function setLoading(loading) {
    state.isLoading = loading;
    const btn = document.getElementById('send-btn');
    const statusText = document.getElementById('status-text');
    
    if (loading) {
        btn.disabled = true;
        btn.innerHTML = `
            <div class="loading-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
        `;
        statusText.textContent = '思考中...';
    } else {
        btn.disabled = false;
        btn.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
        `;
        statusText.textContent = '就绪';
    }
}

// 清空对话
async function clearChat() {
    if (!confirm('确定要清空所有对话吗？')) return;
    
    try {
        await fetch('/api/clear_history', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                session_id: state.sessionId
            })
        });
        
        // 清空界面，只保留欢迎消息
        const container = document.getElementById('chat-messages');
        container.innerHTML = `
            <div class="message ai">
                <div class="avatar">AI</div>
                <div class="message-content">
                    对话已清空。我是你的AI助手，有什么可以帮助你的吗？
                </div>
            </div>
        `;
        
        // 生成新会话ID
        state.sessionId = generateSessionId();
        
    } catch (error) {
        console.error('清空对话失败:', error);
    }
}

// 显示错误信息
function showError(message) {
    const container = document.getElementById('chat-messages');
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `
        <span>⚠️</span>
        <span>${escapeHtml(message)}</span>
    `;
    
    container.appendChild(errorDiv);
    scrollToBottom();
    
    // 3秒后自动移除
    setTimeout(() => {
        errorDiv.remove();
    }, 3000);
}

// 滚动到底部
function scrollToBottom() {
    const container = document.getElementById('chat-messages');
    container.scrollTop = container.scrollHeight;
}

// HTML转义，防止XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 页面关闭时清理
window.addEventListener('beforeunload', () => {
    if (state.currentAudio) {
        state.currentAudio.pause();
    }
});