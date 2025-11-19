/**
 * drawMine.js (最终融合版)
 * 功能：本地生成随机路径 + 高保真绘制 (保留背景、渐变色、图标)
 */

// ==========================================
// 1. 核心算法：本地生成随机轨迹数据
// ==========================================
function generateLocalTrackData() {
    // 基础参数 (基于 360x719 的基准画布计算，后续会自动缩放)
    const CX = 180 + (Math.random() * 50 - 25); // 圆心 X
    const CY = 280 + (Math.random() * 60 - 30); // 圆心 Y (稍微靠上一点，留出下方数据区)
    const R = 70 + (Math.random() * 15 - 5);    // 半径
    const LEN = 90 + (Math.random() * 30 - 15); // 直道长度
    const STEP = 6; // 步长
    
    let points = [];

    // 生成跑道形状
    // 上直道
    for (let x = CX - LEN / 2; x <= CX + LEN / 2; x += STEP) {
        points.push({ x: x, y: CY - R });
    }
    // 右半圆
    for (let angle = -Math.PI / 2; angle <= Math.PI / 2; angle += 0.15) {
        points.push({
            x: CX + LEN / 2 + R * Math.cos(angle),
            y: CY + R * Math.sin(angle)
        });
    }
    // 下直道
    for (let x = CX + LEN / 2; x >= CX - LEN / 2; x -= STEP) {
        points.push({ x: x, y: CY + R });
    }
    // 左半圆
    for (let angle = Math.PI / 2; angle <= 3 * Math.PI / 2; angle += 0.15) {
        points.push({
            x: CX - LEN / 2 + R * Math.cos(angle),
            y: CY + R * Math.sin(angle)
        });
    }
    points.push(points[0]); // 闭合

    // 旋转 + 噪点处理
    const rotationAngle = (Math.random() * 360) * (Math.PI / 180);
    const cos = Math.cos(rotationAngle);
    const sin = Math.sin(rotationAngle);

    // 模拟进出场多余线条
    const extraStart = [];
    const extraEnd = [];
    for(let i=0; i<4; i++) {
        extraStart.push({x: points[0].x - 8 + i*2, y: points[0].y - 8 + i*2});
        extraEnd.push({x: points[points.length-1].x + i*2, y: points[points.length-1].y + i*2});
    }
    
    let finalPoints = [...extraStart, ...points, ...extraEnd];

    const resultData = finalPoints.map((p, index) => {
        // 旋转
        let rx = (p.x - CX) * cos - (p.y - CY) * sin + CX;
        let ry = (p.x - CX) * sin + (p.y - CY) * cos + CY;
        
        // 噪点 (模拟GPS误差)
        const noise = Math.random() * 2 - 1; 
        rx += noise;
        ry += noise;

        return {
            action: index === 0 ? 'down' : 'move',
            x: rx,
            y: ry
        };
    });

    // 随机反转方向
    if(Math.random() > 0.5) {
        const reversed = resultData.map(p => ({x:p.x, y:p.y})).reverse();
        return reversed.map((p, index) => ({
            action: index === 0 ? 'down' : 'move',
            x: p.x,
            y: p.y
        }));
    }
    
    // 添加最后抬笔动作
    if(resultData.length > 0) {
        const last = resultData[resultData.length-1];
        resultData.push({ action: 'up', x: last.x, y: last.y });
    }

    return resultData;
}

// ==========================================
// 2. 核心绘制逻辑 (融合了你的 draw.js 高级效果)
// ==========================================
function drawDataHighFidelity(ctx, canvasWidth, canvasHeight, data) {
    return new Promise((resolve, reject) => {
        // 计算缩放比例：基准是 360px 宽，如果当前画布更大，则按比例放大轨迹
        const scale = canvasWidth / 360;

        // --- 变量初始化 (来自你的 draw.js) ---
        let is_bs = false; // 是否处于变色状态
        let bs_prob = 0.1; // 变色概率 (可调)
        let bs_pres_color = [38, 201, 154]; // 初始绿色
        let bs_pres_x = 0, bs_pres_y = 0;
        let bs_now = 0, bs_range = 0;
        let bs_max = [];
        const bs_range_min = 10, bs_range_max = 30;

        let processedCoords = []; // 存储处理过的坐标用于画图标
        let draw_start_x = 0, draw_start_y = 0;

        // 遍历数据进行绘制
        data.forEach((item, index) => {
            // 坐标变换：缩放
            let x = item.x * scale;
            let y = item.y * scale;

            switch (item.action) {
                case 'down':
                    ctx.beginPath();
                    ctx.lineJoin = "round";
                    ctx.lineCap = "round";
                    ctx.lineWidth = 5 * scale; // 线宽随比例缩放
                    ctx.strokeStyle = "rgb(38, 201, 154)";
                    
                    ctx.moveTo(x, y);
                    
                    // 记录起点
                    draw_start_x = x;
                    draw_start_y = y;
                    
                    // 重置变色状态
                    bs_pres_x = x;
                    bs_pres_y = y;
                    bs_pres_color = [38, 201, 154];
                    is_bs = false;
                    break;

                case 'move':
                    // -----------------------
                    // 复杂的渐变色逻辑 (完全保留你的代码逻辑)
                    // -----------------------
                    if (is_bs && bs_now >= bs_range) {
                        is_bs = false;
                        ctx.beginPath();
                        ctx.lineJoin = "round"; ctx.lineCap = "round";
                        ctx.lineWidth = (5 * scale).toString();
                        ctx.moveTo(bs_pres_x, bs_pres_y);
                        ctx.lineTo(x, y);
                        let gradient = ctx.createLinearGradient(bs_pres_x, bs_pres_y, x, y);
                        gradient.addColorStop(0, `rgb(${bs_pres_color[0]},${bs_pres_color[1]},${bs_pres_color[2]})`);
                        gradient.addColorStop(1, "rgb(38, 201, 154)");
                        ctx.strokeStyle = gradient;
                        ctx.stroke();
                        bs_pres_color = [38, 201, 154];
                    }

                    // 触发变色
                    if (!is_bs && Math.random() < bs_prob && index < data.length - 15) {
                        is_bs = true;
                        let rg = 2 * Math.random() - 1;
                        if (rg > 0) {
                            bs_max = [Math.floor(193 * Math.pow(Math.abs(rg), 0.5)), Math.floor(-110 * Math.pow(Math.abs(rg), 0.5)), Math.floor(-66 * Math.pow(Math.abs(rg), 0.5))];
                        } else {
                            bs_max = [Math.floor(27 * Math.pow(Math.abs(rg), 0.5)), Math.floor(16 * Math.pow(Math.abs(rg), 0.5)), Math.floor(94 * Math.pow(Math.abs(rg), 0.5))];
                        }
                        bs_range = bs_range_min + Math.floor((bs_range_max - bs_range_min) * Math.random());
                        bs_now = 0;
                    }

                    if (is_bs) {
                        ctx.beginPath();
                        ctx.lineJoin = "round"; ctx.lineCap = "round";
                        ctx.lineWidth = (5 * scale).toString();
                        ctx.moveTo(bs_pres_x, bs_pres_y);
                        
                        // 计算当前颜色
                        let bs_now_color = [
                            Math.floor(38 + (4 * bs_max[0] * bs_now / bs_range) * (1 - bs_now / bs_range)),
                            Math.floor(201 + (4 * bs_max[1] * bs_now / bs_range) * (1 - bs_now / bs_range)),
                            Math.floor(154 + (4 * bs_max[2] * bs_now / bs_range) * (1 - bs_now / bs_range))
                        ];
                        
                        let gradient = ctx.createLinearGradient(bs_pres_x, bs_pres_y, x, y);
                        gradient.addColorStop(0, `rgb(${bs_pres_color[0]},${bs_pres_color[1]},${bs_pres_color[2]})`);
                        gradient.addColorStop(1, `rgb(${bs_now_color[0]},${bs_now_color[1]},${bs_now_color[2]})`);
                        ctx.strokeStyle = gradient;
                        ctx.lineTo(x, y);
                        ctx.stroke();
                        
                        bs_pres_color = bs_now_color;
                        bs_now += 1;
                    } else {
                        // 普通绘制
                        ctx.lineTo(x, y);
                        ctx.strokeStyle = "rgb(38, 201, 154)";
                        ctx.stroke();
                    }
                    
                    bs_pres_x = x;
                    bs_pres_y = y;
                    break;
            }
            processedCoords.push({ x, y });
        });

        // -----------------------
        // 绘制起点和终点图标
        // -----------------------
        if (typeof start_sign_src === 'undefined') {
            // 防止报错的默认值，虽然通常 init.js 里定义了
            var start_sign_src = 'images/start_point.png';
            var end_sign_src = 'images/end_point.png';
        }

        const startIMG = new Image();
        const endIMG = new Image();
        startIMG.crossOrigin = "Anonymous";
        endIMG.crossOrigin = "Anonymous";
        startIMG.src = start_sign_src;
        endIMG.src = end_sign_src;

        let loadedCount = 0;
        const checkResolve = () => {
            loadedCount++;
            if (loadedCount === 2) resolve();
        };

        startIMG.onload = function () {
            ctx.drawImage(startIMG, 
                Math.round(draw_start_x - 15 * scale), 
                Math.round(draw_start_y - 22 * scale), 
                Math.round(30 * scale), Math.round(30 * scale)
            );
            checkResolve();
        };
        startIMG.onerror = checkResolve; // 即使失败也继续

        endIMG.onload = function () {
            // 终点取最后一个坐标
            let finalCoord = processedCoords[processedCoords.length - 1];
            if(finalCoord) {
                ctx.drawImage(endIMG, 
                    Math.round(finalCoord.x - 15 * scale), 
                    Math.round(finalCoord.y - 22 * scale), 
                    Math.round(30 * scale), Math.round(30 * scale)
                );
            }
            checkResolve();
        };
        endIMG.onerror = checkResolve;
    });
}

// ==========================================
// 3. 主界面调用入口：drawMine
// ==========================================
async function drawMine(ignoredUrl) {
    console.log("本地生成：绘制主界面...");
    
    // 1. 获取当前背景图
    let bgSrc = "";
    if (typeof tmp_bgimg_osrc !== 'undefined' && tmp_bgimg_osrc) {
        bgSrc = tmp_bgimg_osrc;
    } else if (typeof use_default_bg !== 'undefined' && use_default_bg && typeof default_bgSRC !== 'undefined') {
        bgSrc = default_bgSRC[1]; // 默认地图
    } else {
        const bgEl = document.getElementById('bg-img');
        if(bgEl) bgSrc = bgEl.src;
    }

    // 2. 加载背景图以获取尺寸
    const bgImg = new Image();
    bgImg.crossOrigin = "Anonymous";
    bgImg.src = bgSrc;

    bgImg.onload = async function() {
        // 3. 创建 Canvas
        const canvas = document.createElement('canvas');
        canvas.width = bgImg.naturalWidth || 360;
        canvas.height = bgImg.naturalHeight || 719;
        const ctx = canvas.getContext('2d');

        // 4. 绘制背景 (这是防止背景消失的关键！)
        ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

        // 5. 生成并绘制轨迹
        const data = generateLocalTrackData();
        await drawDataHighFidelity(ctx, canvas.width, canvas.height, data);

        // 6. 应用回页面
        const resultImg = document.getElementById('bg-img');
        if(resultImg) resultImg.src = canvas.toDataURL();
    };
    
    bgImg.onerror = function() {
        alert("背景图加载失败，无法生成轨迹。");
    };
}

// ==========================================
// 4. 弹窗调用入口：Json2Draw
// ==========================================
async function Json2Draw(ignoredUrl) {
    console.log("本地生成：绘制弹窗...");
    
    const canvas = document.getElementById('drawpic_canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // 1. 确定背景
    let bgSrc = "";
    // 优先使用全局变量里的背景设置
    if (typeof use_default_bg !== 'undefined' && use_default_bg) {
        bgSrc = default_bgSRC[1];
    } else if (typeof bgSRC !== 'undefined') {
        bgSrc = bgSRC;
    } else {
        // fallback
        bgSrc = document.getElementById('bg-img').src;
    }

    const bgImg = new Image();
    bgImg.crossOrigin = "Anonymous";
    bgImg.src = bgSrc;

    bgImg.onload = async function() {
        // 2. 重置画布大小
        // 这里使用你在 draw.js 里用到的 current_img_width 逻辑，或者直接用图片尺寸
        if(typeof current_img_width !== 'undefined') {
             canvas.width = current_img_width;
             canvas.height = current_img_height;
        } else {
             canvas.width = bgImg.naturalWidth;
             canvas.height = bgImg.naturalHeight;
        }

        // 3. 绘制背景
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

        // 4. 生成并绘制轨迹
        const data = generateLocalTrackData();
        await drawDataHighFidelity(ctx, canvas.width, canvas.height, data);
        
        // 准备好数据，以便点击确认时使用 (如果有相关逻辑的话)
    };
}