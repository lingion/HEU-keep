/**
 * drawMine.js (修复版 - 解决地图背景消失问题)
 * 核心逻辑：先绘制底层地图图片，再在上面叠加随机路径
 */

// 辅助函数：加载图片
function loadImg(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous"; // 防止跨域问题
        img.onload = () => resolve(img);
        img.onerror = (e) => reject(e);
        img.src = src;
    });
}

// 获取当前应该使用的背景图来源
function getCurrentBgSrc() {
    // 1. 优先尝试获取全局变量中的原始背景 (上传或选择的)
    if (typeof tmp_bgimg_osrc !== 'undefined' && tmp_bgimg_osrc) {
        return tmp_bgimg_osrc;
    }
    // 2. 如果没有，尝试获取当前 img 标签的 src
    const bgImgEl = document.getElementById('bg-img');
    if (bgImgEl && bgImgEl.src) {
        return bgImgEl.src;
    }
    // 3. 实在没有，返回空（防止报错）
    return "";
}

// 1. 主界面"随机路径"按钮调用的函数
async function drawMine(ignoredUrl) {
    console.log("正在本地生成随机轨迹(带地图)...");
    const data = generateLocalTrackData();

    // 创建临时画布
    const canvas = document.createElement('canvas');
    canvas.width = 360;  // 保持与 CSS 预览区一致
    canvas.height = 719;
    const ctx = canvas.getContext('2d');

    // --- 第一步：绘制底图 (修复核心) ---
    const bgSrc = getCurrentBgSrc();
    if (bgSrc) {
        try {
            const bgImage = await loadImg(bgSrc);
            // 铺满画布
            ctx.drawImage(bgImage, 0, 0, 360, 719);
        } catch (error) {
            console.error("背景图加载失败:", error);
        }
    } else {
        // 如果没图，填充一个白色背景防止透明
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, 360, 719);
    }

    // --- 第二步：绘制轨迹 ---
    // 设置发光效果，模拟 Keep
    ctx.shadowBlur = 8;
    ctx.shadowColor = "#fc5353";
    
    // 绘制渐变色轨迹
    const gradient = ctx.createLinearGradient(0, 0, 360, 719);
    gradient.addColorStop(0, "#ff9a9e");
    gradient.addColorStop(1, "#fecfef");
    ctx.strokeStyle = gradient;
    
    drawDataToCanvas(ctx, data);

    // --- 第三步：应用到页面 ---
    // 将合成好的图片（地图+轨迹）设置给背景图标签
    const resultDataURL = canvas.toDataURL('image/png');
    const bgImgEl = document.getElementById('bg-img');
    if (bgImgEl) {
        bgImgEl.src = resultDataURL;
    }
}

// 2. 弹窗中"随机生成"按钮调用的函数
async function Json2Draw(ignoredUrl) {
    console.log("弹窗模式：正在本地生成...");
    const data = generateLocalTrackData();
    
    const canvas = document.getElementById("drawpic_canvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // --- 第一步：绘制底图 (修复核心) ---
    // 弹窗里的 Canvas 大小可能不是 360x719，需要自适应
    const bgSrc = getCurrentBgSrc();
    if (bgSrc) {
        try {
            const bgImage = await loadImg(bgSrc);
            // 在弹窗 Canvas 上绘制背景图
            ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
        } catch (error) {
            console.error("弹窗背景加载失败", error);
        }
    }

    // --- 第二步：绘制轨迹 ---
    // 弹窗里用纯红色，对比度高一点，方便看
    ctx.shadowBlur = 0; // 弹窗里去掉发光，提升性能
    ctx.strokeStyle = "rgba(250, 60, 60, 0.9)";
    
    drawDataToCanvas(ctx, data);
}

// --- 通用绘制线条函数 ---
function drawDataToCanvas(ctx, data) {
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 6; // 线条粗细

    ctx.beginPath();
    // 记录是否正在画线
    let isDrawing = false;

    data.forEach(point => {
        if (point.action === 'down') {
            ctx.moveTo(point.x, point.y);
            isDrawing = true;
        } else if (point.action === 'move' && isDrawing) {
            ctx.lineTo(point.x, point.y);
        } else if (point.action === 'up') {
            isDrawing = false;
        }
    });
    ctx.stroke();
}