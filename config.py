# config.py
import os

# API密钥配置 - 请在这里填入你的密钥
API_KEYS = {
    'qwen': os.getenv('QWEN_API_KEY', 'api_key_here'),
    'deepseek': os.getenv('DEEPSEEK_API_KEY', 'your-deepseek-api-key-here'),

}

# 模型配置
MODEL_CONFIG = {
    'qwen': {
        'name': 'Qwen-Max',
        'api_url': 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
        'model_id': 'qwen-max',
        'headers': lambda key: {
            'Authorization': f'Bearer {key}',
            'Content-Type': 'application/json'
        }
    },
    'deepseek': {
        'name': 'DeepSeek-V3',
        'api_url': 'https://api.deepseek.com/v1/chat/completions',
        'model_id': 'deepseek-chat',
        'headers': lambda key: {
            'Authorization': f'Bearer {key}',
            'Content-Type': 'application/json'
        }
    }
}

# 语音API配置
TTS_CONFIG = {
    'base_url': 'https://api-v2.cenguigui.cn/api/speech/AiChat/',
    # 从JSON中提取的所有音色，按类型分组
    'available_voices': [
        # 特色
        {'id': 'shigeju', 'name': '曼波', 'desc': '特色', 'category': '特色'},
        {'id': 'dianzijianchen', 'name': '电子奸臣', 'desc': '特色', 'category': '特色'},
        {'id': 'zhangfei-guichu', 'name': '激昂张飞', 'desc': '特色', 'category': '特色'},
        {'id': 'maikease', 'name': '麦克阿瑟', 'desc': '特色', 'category': '特色'},
        {'id': 'jixiedianjing', 'name': '电竞解说', 'desc': '特色', 'category': '特色'},
        {'id': 'shaweima', 'name': '沙老板', 'desc': '特色', 'category': '特色'},
        {'id': 'dingzhen', 'name': '理塘小子', 'desc': '特色', 'category': '特色'},
        {'id': 'fanzhiyi-guichu', 'name': '大将锐评', 'desc': '特色', 'category': '特色'},
        {'id': 'sunxiaochuan', 'name': '游戏解说', 'desc': '特色', 'category': '特色'},
        {'id': 'wangdachui', 'name': '锤大力', 'desc': '特色', 'category': '特色'},
        {'id': 'xianyumengxiangjia-guichu', 'name': '梦想家', 'desc': '特色', 'category': '特色'},
        {'id': 'jixiezhanjing', 'name': '机甲战警', 'desc': '特色', 'category': '特色'},
        {'id': 'tixunan', 'name': '体虚生', 'desc': '特色', 'category': '特色'},
        {'id': 'heyboy', 'name': '说唱小哥', 'desc': '特色', 'category': '特色'},
        
        # 角色
        {'id': 'xiaomeng', 'name': '萌奇', 'desc': '角色', 'category': '角色'},
        {'id': 'xionger', 'name': '熊熊', 'desc': '角色', 'category': '角色'},
        {'id': 'ziwei', 'name': '紫薇', 'desc': '角色', 'category': '角色'},
        {'id': 'houge', 'name': '猴哥', 'desc': '角色', 'category': '角色'},
        {'id': 'haixing', 'name': '海星', 'desc': '角色', 'category': '角色'},
        {'id': 'guanyu-guichu', 'name': '豪迈二爷', 'desc': '角色', 'category': '角色'},
        {'id': 'caocaogaifan-guichu', 'name': '愤怒阿瞒', 'desc': '角色', 'category': '角色'},
        {'id': 'zhugeliang-guichu', 'name': '智谋丞相', 'desc': '角色', 'category': '角色'},
        {'id': 'chunribu', 'name': '春日部', 'desc': '角色', 'category': '角色'},
        {'id': 'laodie', 'name': '魔法老爹', 'desc': '角色', 'category': '角色'},
        {'id': 'guangxige', 'name': '洗头男', 'desc': '角色', 'category': '角色'},
        {'id': 'haibao', 'name': '海宝', 'desc': '角色', 'category': '角色'},
        {'id': 'kenanvc', 'name': '名侦探', 'desc': '角色', 'category': '角色'},
        {'id': 'luxun', 'name': '树人', 'desc': '角色', 'category': '角色'},
        
        # 解说
        {'id': 'zhubo', 'name': '青年主播', 'desc': '解说', 'category': '解说'},
        {'id': 'diyinpao', 'name': '低音炮', 'desc': '解说', 'category': '解说'},
        {'id': 'jieshuonannew', 'name': '解说男声', 'desc': '解说', 'category': '解说'},
        {'id': 'jieshuonv', 'name': '解说女声', 'desc': '解说', 'category': '解说'},
        {'id': 'huayuanbaobao', 'name': '治愈男声', 'desc': '解说', 'category': '解说'},
        {'id': 'bage', 'name': '娱乐扒哥', 'desc': '解说', 'category': '解说'},
        {'id': 'bamei', 'name': '娱乐扒妹', 'desc': '解说', 'category': '解说'},
        {'id': 'meishi', 'name': '舌尖美食', 'desc': '解说', 'category': '解说'},
        {'id': 'yizhi', 'name': '译制腔', 'desc': '解说', 'category': '解说'},
        
        # 童声
        {'id': 'xiaoxin', 'name': '萌小孩', 'desc': '童声', 'category': '童声'},
        {'id': 'zhengtai', 'name': '元气正太', 'desc': '童声', 'category': '童声'},
        {'id': 'daimeng', 'name': '小鬼头', 'desc': '童声', 'category': '童声'},
        {'id': 'nvhai', 'name': '超萌奶娃', 'desc': '童声', 'category': '童声'},
        
        # 女声
        {'id': 'db6', 'name': '知性女生', 'desc': '女声', 'category': '女声'},
        {'id': 'wenrounvsheng', 'name': '温柔女孩', 'desc': '女声', 'category': '女声'},
        {'id': 'tvbfemale', 'name': 'TVB女声', 'desc': '女声', 'category': '女声'},
        {'id': 'xindong', 'name': '元气少女', 'desc': '女声', 'category': '女声'},
        {'id': 'liyuling', 'name': '玉玲', 'desc': '女声', 'category': '女声'},
        {'id': 'xiaoxiao', 'name': '清仓促销员', 'desc': '女声', 'category': '女声'},
        
        # 男声
        {'id': 'xiaoyao', 'name': '热血男孩', 'desc': '男声', 'category': '男声'},
        {'id': 'qingsong', 'name': '轻松少年', 'desc': '男声', 'category': '男声'},
        {'id': 'db8', 'name': '森系少年', 'desc': '男声', 'category': '男声'},
        {'id': 'jixueguanggao', 'name': '鸡血广告', 'desc': '男声', 'category': '男声'},
        
        # 语言/方言
        {'id': 'tianjinhua', 'name': '天津话', 'desc': '方言', 'category': '方言'},
        {'id': 'xiaopo', 'name': '说书先生', 'desc': '方言', 'category': '方言'},
        {'id': 'zh-CN-shaanxi-XiaoniNeural', 'name': '陕西话', 'desc': '方言', 'category': '方言'},
        {'id': 'zh-HK-WanLungNeural', 'name': '粤语男声', 'desc': '方言', 'category': '方言'},
        {'id': 'zh-CN-henan-YundengNeural', 'name': '河南话', 'desc': '方言', 'category': '方言'},
        {'id': 'v50', 'name': '英文男声', 'desc': '语言', 'category': '语言'},
        {'id': 'zh-CN-liaoning-XiaobeiNeural', 'name': '东北话', 'desc': '方言', 'category': '方言'},
        {'id': 'zh-TW-HsiaoChenNeural', 'name': '台湾话', 'desc': '方言', 'category': '方言'},
        {'id': 'zh-CN-shandong-YunxiangNeural', 'name': '山东话', 'desc': '方言', 'category': '方言'},
        {'id': 'zh-CN-sichuan-YunxiNeural', 'name': '四川话', 'desc': '方言', 'category': '方言'},
        {'id': 'zh-HK-HiuMaanNeural', 'name': '粤语女声', 'desc': '方言', 'category': '方言'},
        {'id': 'wuu-CN-XiaotongNeural', 'name': '上海话', 'desc': '方言', 'category': '方言'},
    ]
}