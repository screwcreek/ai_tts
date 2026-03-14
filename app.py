# app.py
from flask import Flask, render_template, request, jsonify, send_file,Response
from flask_cors import CORS
import requests
import json
import io
import base64
from config import API_KEYS, MODEL_CONFIG, TTS_CONFIG

app = Flask(__name__)
CORS(app)  # 允许跨域请求

# 存储对话历史（简单版本，存储在内存中，重启后清空）
conversation_history = {}

@app.route('/')
def index():
    """渲染主页面"""
    return render_template('index.html')

@app.route('/api/models', methods=['GET'])
def get_models():
    """获取可用的模型列表"""
    models = []
    for key, config in MODEL_CONFIG.items():
        models.append({
            'id': key,
            'name': config['name'],
            'model_id': config['model_id']
        })
    return jsonify({'models': models})

@app.route('/api/voices', methods=['GET'])
def get_voices():
    """获取可用的音色列表"""
    return jsonify({'voices': TTS_CONFIG['available_voices']})

@app.route('/api/chat', methods=['POST'])
def chat():
    """处理聊天请求"""
    data = request.json
    model_id = data.get('model', 'deepseek')
    message = data.get('message', '')
    session_id = data.get('session_id', 'default')
    enable_tts = data.get('enable_tts', True)
    voice_id = data.get('voice', 'dingzhen')
    
    if not message:
        return jsonify({'error': '消息不能为空'}), 400
    
    if model_id not in MODEL_CONFIG:
        return jsonify({'error': '不支持的模型'}), 400
    
    model_config = MODEL_CONFIG[model_id]
    api_key = API_KEYS.get(model_id)
    
    if not api_key or api_key == f'your-{model_id}-api-key-here':
        return jsonify({'error': f'请配置{model_config["name"]}的API密钥'}), 400
    
    if session_id not in conversation_history:
        conversation_history[session_id] = []
    
    conversation_history[session_id].append({
        'role': 'user',
        'content': message
    })
    
    try:
        # 调用大模型API
        ai_response = call_llm_api(model_id, model_config, api_key, conversation_history[session_id])
        
        conversation_history[session_id].append({
            'role': 'assistant',
            'content': ai_response
        })
        
        if len(conversation_history[session_id]) > 20:
            conversation_history[session_id] = conversation_history[session_id][-20:]
        
        result = {
            'text': ai_response,
            'model': model_id,
            'session_id': session_id
        }
        
        # 如果启用语音，获取音频URL
        if enable_tts:
            try:
                audio_url = call_tts_api(ai_response, voice_id)
                result['audio_url'] = audio_url  # 返回URL
                result['audio_format'] = 'wav'
            except Exception as e:
                result['tts_error'] = str(e)
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'error': f'模型调用失败: {str(e)}'}), 500

def call_llm_api(model_id, config, api_key, messages):
    """调用大模型API"""
    headers = config['headers'](api_key)
    
    if model_id == 'deepseek':
        # DeepSeek API格式
        payload = {
            'model': config['model_id'],
            'messages': messages,
            'temperature': 0.7,
            'max_tokens': 2000
        }
        
        response = requests.post(config['api_url'], headers=headers, json=payload, timeout=30)
        response.raise_for_status()
        data = response.json()
        return data['choices'][0]['message']['content']
        
    elif model_id == 'qwen':
        # Qwen API格式 (DashScope)
        # 转换消息格式
        prompt = ""
        for msg in messages:
            if msg['role'] == 'user':
                prompt += f"User: {msg['content']}\n"
            else:
                prompt += f"Assistant: {msg['content']}\n"
        prompt += "Assistant: "
        
        payload = {
            'model': config['model_id'],
            'input': {
                'prompt': prompt
            },
            'parameters': {
                'temperature': 0.7,
                'max_tokens': 2000
            }
        }
        
        response = requests.post(config['api_url'], headers=headers, json=payload, timeout=30)
        response.raise_for_status()
        data = response.json()
        return data['output']['text']

def call_tts_api(text, voice):
    """调用语音合成API，返回音频URL"""
    params = {
        'module': 'audio',
        'text': text,
        'voice': voice  # 直接传递前端传来的音色名称，如"沙老板"
    }
    
    print(f"TTS请求: text={text[:20]}..., voice={voice}")  # 添加调试日志
    
    response = requests.get(TTS_CONFIG['base_url'], params=params, timeout=30)
    response.raise_for_status()
    
    data = response.json()
    print(f"TTS响应: {data}")  # 添加调试日志
    
    if data.get('code') != 200:
        raise Exception(f"语音API错误: {data.get('message', '未知错误')}")
    
    audio_url = data['data']['audio_url']
    return audio_url

@app.route('/api/tts', methods=['POST'])
def text_to_speech():
    """单独的语音合成接口"""
    data = request.json
    text = data.get('text', '')
    voice = data.get('voice', 'dingzhen')
    
    if not text:
        return jsonify({'error': '文本不能为空'}), 400
    
    try:
        audio_data = call_tts_api(text, voice)
        audio_base64 = base64.b64encode(audio_data).decode('utf-8')
        return jsonify({
            'audio': audio_base64,
            'format': 'mp3'
        })
    except Exception as e:
        return jsonify({'error': f'语音合成失败: {str(e)}'}), 500

@app.route('/api/clear_history', methods=['POST'])
def clear_history():
    """清空对话历史"""
    session_id = request.json.get('session_id', 'default')
    if session_id in conversation_history:
        conversation_history[session_id] = []
    return jsonify({'status': 'success'})


@app.route('/api/audio_proxy', methods=['GET'])
def audio_proxy():
    """代理音频请求"""
    audio_url = request.args.get('url', '')
    
    if not audio_url:
        return jsonify({'error': '缺少URL'}), 400
    
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        response = requests.get(audio_url, headers=headers, timeout=30)
        response.raise_for_status()
        
        # 返回base64编码的音频
        import base64
        audio_base64 = base64.b64encode(response.content).decode('utf-8')
        
        return jsonify({
            'audio': audio_base64,
            'format': 'wav'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
if __name__ == '__main__':
    print("正在启动服务器...")
    print("请访问: http://127.0.0.1:5000")
    app.run(debug=True, host='0.0.0.0', port=5000)
