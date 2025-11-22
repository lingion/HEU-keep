/* css/styles.css */

/* =========================================
   1. 字体引入 (核心资产)
   ========================================= */
@font-face {
    font-family: 'keeprun';
    src: url(../DINCond-Bold.otf); /* 必须确保文件在上一级目录 */
}
@font-face {
    font-family: 'STKAITI';
    src: url(../STKAITI.TTF);
}

/* =========================================
   2. 全局变量与重置 (扁平化设计基础)
   ========================================= */
:root {
    --primary-color: #24c68a;      /* Keep 品牌绿 */
    --primary-hover: #1ea874;
    --accent-color: #5d52ff;       /* 辅助蓝紫色 */
    --bg-color: #f4f5f7;           /* 网页背景灰 */
    --card-bg: #ffffff;            /* 卡片背景白 */
    --text-main: #333333;          /* 主要文字 */
    --text-sub: #666666;           /* 次要文字 */
    --border-color: #e1e4e8;       /* 边框颜色 */
    --shadow: 0 4px 20px rgba(0, 0, 0, 0.05); /* 柔和阴影 */
    --radius: 12px;                /* 圆角大小 */
}

* {
    box-sizing: border-box;
    outline: none;
}

html, body {
    margin: 0;
    padding: 0;
    width: 100%;
    min-height: 100vh;
    background-color: var(--bg-color);
    /* 控制面板使用现代系统字体 */
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    color: var(--text-main);
    line-height: 1.6;
}

/* --- 主布局容器 --- */
#main-div {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 40px;
    padding: 40px 20px;
    max-width: 1200px;
    margin: 0 auto;
}


/* =========================================
   3. 截图预览区域 (核心高保真还原区)
   注意：这里的样式必须严格还原 Keep 原生效果
   ========================================= */

.new-img {
    position: relative;
    width: 360px;
    height: 719px;
    background: #fff;
    /* 给手机预览加个立体投影，区分于背景 */
    box-shadow: 0 20px 40px rgba(0,0,0,0.2);
    border-radius: 4px;
    overflow: hidden;
    flex-shrink: 0;
    /* 🔴 强制重置字体，防止继承外部的扁平化字体 */
    font-family: "Microsoft YaHei", "Segoe UI", Arial, sans-serif;
    font-weight: normal;
    -webkit-font-smoothing: antialiased;
}

/* --- 内部图片绝对定位 --- */
.new-img #gui-img, 
.new-img .bgimgwrap, 
.new-img .innerbgimg {
    position: absolute;
    top: 0;
    left: 0;
    width: 360px;
    height: 719px;
    vertical-align: top;
}
.new-img .bgimgwrap {
    display: flex;
    overflow: hidden;
    justify-content: center;
    align-items: center;
}

/* --- 头像区域 --- */
.new-img .portrait-wrap {
    width: 40px;
    height: 40px;
    position: absolute;
    display: flex;
    overflow: hidden;
    justify-content: center;
    align-items: center;
    top: 335px;
    left: 284px;
    border-radius: 50%; /* 圆形头像 */
}
.new-img .portrait {
    width: 40px;
    height: 40px;
    display: block;
    object-fit: cover;
}

/* --- 天气图标 --- */
.new-img .weather-imgwrap {
    height: 14px;
    width: 14px;
    top: 426.5px;
    left: 238px;
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
}
.new-img .weather {
    width: 14px;
    height: 14px;
    display: block;
}

/* --- 文字元素绝对定位与字体还原 --- */
.new-img span {
    position: absolute;
}

/* 用户名 */
.username {
    top: 385px;
    right: 34px;
    font-size: 13px;
    color: #333; 
    /* 确保中文显示正常 */
    font-family: "Microsoft YaHei", sans-serif; 
}

/* Keep 标题 */
.keep-title {
    top: 361px;
    left: 30px;
    line-height: 16px;
    color: #a2a2a2;
    font-size: 12px;
    font-family: "Segoe UI", Arial, Helvetica, sans-serif;
}

/* 🔴 核心数字：公里数 (DIN 字体 + 压缩变形) */
.mile {
    color: #57525d;
    /* 强制使用专用字体 */
    font-family: 'keeprun', sans-serif !important; 
    top: 387px;
    left: 32px;
}
.mile .mile-data {
    font-size: 50px;
    /* 还原 Keep 的数字压缩感 */
    transform: scale(1, 0.85); 
    transform-origin: 0 0;
    margin: 0 auto;
    letter-spacing: -1px;
    display: inline-block;
    position: relative;
}
.mile .gongli {
    color: #57525d;
    font-size: 10.67px;
    font-family: 'keeprun', sans-serif !important;
    margin-left: 5px;
    bottom: 8px;
    position: relative;
    display: inline-block;
}

/* 日期时间 */
.datetime {
    color: #a2a2a2;
    font-size: 13px;
    font-family: "Segoe UI", Arial, Helvetica, sans-serif;
}
.date { top: 407px; left: 222px; }
.time { top: 407px; left: 296px; }

/* 温湿度 */
.env {
    color: #a2a2a2;
    font-size: 13px;
    font-family: "Segoe UI", Arial, Helvetica, sans-serif;
    letter-spacing: -0.5px;
}
.temperature { top: 424px; left: 252px; }
.humidity { top: 424px; left: 303px; }

/* 🔴 底部数据栏：配速、热量 (DIN 字体 + 压缩) */
.speed-time {
    color: #58505b;
    font-size: 28px;
    font-family: 'keeprun', sans-serif !important;
    transform: scale(1, 0.85);
    transform-origin: top left;
}
.speed { top: 480px; left: 32px; letter-spacing: -0.5px; }
.cost-time { top: 480px; left: 140px; letter-spacing: -0.5px; }
.calorie { top: 480px; right: 32px; }


/* =========================================
   4. 控制面板区域 (美观扁平化设计)
   ========================================= */
.set-data {
    flex: 1;
    min-width: 150px;
    max-width: 350px;
}

/* 头部按钮组卡片 */
.header-container {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 20px;
    padding: 20px;
    background: var(--card-bg);
    border-radius: var(--radius);
    box-shadow: var(--shadow);
    align-items: center;
}

/* 列表重置 */
.setDataList {
    list-style: none;
    padding: 0;
    margin: 0;
}
.setDataList li {
    margin-bottom: 15px;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
}

/* --- 卡片样式 --- */
.background-green, 
.background-blue, 
.background-color-block2 {
    display: block;
    background: var(--card-bg);
    border-radius: var(--radius);
    padding: 25px;
    margin-bottom: 20px;
    box-shadow: var(--shadow);
    position: relative;
    border-left: 4px solid transparent;
    transition: transform 0.2s;
}

.background-green:hover, 
.background-blue:hover, 
.background-color-block2:hover {
    transform: translateY(-2px);
}

/* 颜色区分 */
.background-green { border-left-color: var(--primary-color); }
.background-blue { border-left-color: var(--accent-color); }
.background-color-block2 { border-left-color: #ff9f43; }

/* 内部块样式 */
.background-color-block1 {
    background: #f8f9fa;
    padding: 10px;
    border-radius: 8px;
    margin-top: 10px;
    display: block;
    width: 100%;
}

/* --- 输入框与标签 --- */
label {
    font-weight: 600;
    color: var(--text-main);
    margin-right: 10px;
    font-size: 14px;
    min-width: 80px;
}
/* 去掉标签中的 data-text 默认显示，改用更干净的方式 */
label[data-text]::before {
    content: '';
}

input[type="text"], select {
    border: 1px solid var(--border-color);
    background: #fff;
    border-radius: 6px;
    padding: 6px 10px;
    font-size: 14px;
    color: var(--text-main);
    transition: all 0.3s;
    height: 34px;
    text-align: left;
}

input[type="text"]:focus, select:focus {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(36, 198, 138, 0.1);
}

/* 特殊输入框宽度 */
.mile2-inp { width: 80px; text-align: center; }
.username-inp { width: 140px; }
.keep-title-inp { width: 200px; }
.time-inp { width: 45px; text-align: center; }
.year-inp { width: 60px; }

/* --- 按钮样式 --- */
button {
    cursor: pointer;
    border: none;
    border-radius: 6px;
    padding: 8px 16px;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.3s ease;
    background-color: #eef0f2;
    color: var(--text-main);
    height: 36px;
    line-height: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

button:hover {
    background-color: #dce0e5;
    transform: translateY(-1px);
}

button:active {
    transform: translateY(0);
}

/* 主要按钮 */
.large-btn, .flush-btn, .storeToIndexedDB-btn {
    background-color: var(--primary-color);
    color: #fff;
    box-shadow: 0 4px 10px rgba(36, 198, 138, 0.3);
}
.large-btn:hover, .flush-btn:hover, .storeToIndexedDB-btn:hover {
    background-color: var(--primary-hover);
}

/* 次要操作 */
.one_click {
    background-color: var(--accent-color);
    color: #fff;
    width: auto;
    height: 40px;
}
.one_click:hover { background-color: #4b42cc; }

/* 危险操作 */
.clear-btn {
    background-color: #ff6b6b;
    color: #fff;
}
.clear-btn:hover { background-color: #fa5252; }

/* 小按钮 */
.init-btn {
    font-size: 12px;
    padding: 4px 10px;
    height: 28px;
    margin-left: 5px;
    background: transparent;
    color: #999;
    border: 1px solid #ddd;
}
.init-btn:hover {
    background: #fff;
    color: var(--primary-color);
    border-color: var(--primary-color);
}

/* 文件选择模拟按钮 */
.inpt-btn {
    background-color: #fff;
    border: 1px dashed var(--primary-color);
    color: var(--primary-color);
}

/* --- 复选框 --- */
input[type="checkbox"] {
    width: 18px;
    height: 18px;
    accent-color: var(--primary-color);
    vertical-align: middle;
    margin-right: 5px;
    cursor: pointer;
}

/* --- 底部说明 --- */
.warning-wrap {
    margin-top: 30px;
    padding: 20px;
    background: #fff9db;
    border-radius: var(--radius);
    border-left: 4px solid #ffcc00;
    color: #666;
    font-size: 14px;
}
.warning b {
    color: #e67700;
    display: block;
    margin-bottom: 10px;
}
.update {
    margin-top: 15px;
    background: rgba(255, 255, 255, 0.5);
    padding: 10px;
    border-radius: 6px;
}
.explanation a {
    color: var(--primary-color);
    text-decoration: none;
}

/* --- 弹窗样式 --- */
#drawpic_overlay {
    position: fixed; left: 0; top: 0; width: 100%; height: 100%;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(5px);
    z-index: 1000;
    display: none;
    justify-content: center;
    align-items: center;
}
.drawpic_popup {
    background: #fff;
    padding: 20px;
    border-radius: var(--radius);
    box-shadow: 0 20px 50px rgba(0,0,0,0.2);
    text-align: center;
}
#drawpic_canvas_wrap2 {
    background-color: #fff;
    position: relative;
    border: 1px solid #eee;
    border-radius: 8px;
    height: 400px;
    width: 300px;
    display: flex;
    overflow: hidden;
    justify-content: center;
    margin: 10px auto;
}

/* 其他辅助 */
hr {
    border: 0;
    height: 1px;
    background: #eee;
    margin: 20px 0;
}
.ApiExplanation {
    font-size: 12px;
    color: #999;
    display: block;
    margin-top: 5px;
    padding-left: 5px;
}

/* --- 移动端适配 --- */
@media (max-width: 350px) {
    #main-div {
        flex-direction: column;
        align-items: center;
        padding: 10px;
    }
    
    .new-img {
        /* 手机预览在移动端稍微缩小以适应 */
        transform: scale(0.9);
        transform-origin: top center;
        margin-bottom: -60px; /* 抵消 scale 带来的空白 */
    }

    .set-data {
        width: 100%;
        max-width: 100%;
    }
    
    .header-container {
        justify-content: space-between;
    }
    
    button {
        flex-grow: 1;
        margin-bottom: 5px;
    }
}
