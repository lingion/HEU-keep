/**
 * drawMine.js (哈工程南体育场-精准校准版)
 * 移植自原版 Python 算法，参数 1:1 还原
 */

// ==========================================
// 1. 核心算法：本地生成多圈随机轨迹
// ==========================================
function generateLocalTrackData() {
    // --- 📍 核心参数 (移植自 Json2Png.py) ---
    // 原作者测量的南体育场精确参数
    const BASE_CX = 153;  // 圆心 X
    const BASE_CY = 160;  // 圆心 Y
    const LENGTH = 95;    // 直道长度
    const ROTATE = -4;    // 整体旋转角度 (逆时针4度，平行于郑和路)
    const BASE_R = 95 / Math.PI + 17; // 约等于 47.2，操场半径
    const STEP = 6;       // 步长 (点之间的密度)

    let allPoints = [];
    
    // 🏃 模拟跑 3 到 4 圈 (原版逻辑)
    const laps = 3; 

    for (let i = 0; i < laps; i++) {
        // 每一圈的随机扰动
        const r_noise = (i - 1) * -1.5 * (2 * Math.random() - 1);
        const cy_noise = (i - 1) * 1.5 * (2 * Math.random() - 1);
        
        const currentR = BASE_R + r_noise;
        const currentCY = BASE_CY + cy_noise;
        
        let lapPoints = generateEllipse(BASE_CX, currentCY, LENGTH, currentR, STEP);
        allPoints = allPoints.concat(lapPoints);
    }

    // 🏃 增加结束段 (模拟最后多跑半圈)
    const endLapR = BASE_R + (-1.5 * (2 * Math.random() - 1));
    const endLapPoints = generateEllipse(BASE_CX, BASE_CY, LENGTH, endLapR, STEP);
    
    // 随机截取结束段的一半
    const cutIndex = Math.floor(endLapPoints.length / 2 + Math.random() * (endLapPoints.length / 2));
    allPoints = allPoints.concat(endLapPoints.slice(0, cutIndex));

    // --- 🌀 进出场“多余线条” (模拟真实开始和结束) ---
    // 进场线 (从场外连到起点)
    const extraStart = generateLineData(BASE_CX, BASE_CY, BASE_R, true);
    // 拼接
    let finalPoints = [...extraStart, ...allPoints];

    // --- 📐 整体坐标变换 (旋转 + 噪点) ---
    const rad = ROTATE * Math.PI / 180; // 转为弧度
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    const resultData = finalPoints.map((p, index) => {
        // 1. 相对圆心归零
        let dx = p.x - BASE_CX;
        let dy = p.y - BASE_CY;
        
        // 2. 旋转公式
        let rx = dx * cos - dy * sin;
        let ry = dx * sin + dy * cos;
        
        // 3. 移回圆心
        let finalX = rx + BASE_CX;
        let finalY = ry + BASE_CY;

        return {
            action: index === 0 ? 'down' : 'move',
            x: finalX,
            y: finalY
        };
    });

    // 50% 概率中心对称反转 (模拟反向跑)
    if (Math.random() < 0.5) {
        resultData.forEach(p => {
            p.x = BASE_CX - (p.x - BASE_CX);
            p.y = BASE_CY - (p.y - BASE_CY);
        });
    }

    // 添加抬笔
    if(resultData.length > 0) {
        const last = resultData[resultData.length-1];
        resultData.push({ action: 'up', x: last.x, y: last.y });
    }

    return resultData;
}

// 辅助：生成单圈椭圆跑道数据 (不做旋转)
function generateEllipse(cx, cy, length, r, step) {
    let points = [];
    // 1. 上直道 (左 -> 右)
    for (let x = cx - length/2; x <= cx + length/2; x += step) {
        points.push({x: x, y: cy - r + (Math.random()*2-1)}); // 微小抖动
    }
    // 2. 右半圆
    for (let angle = -Math.PI/2; angle <= Math.PI/2; angle += step/r) {
        points.push({
            x: cx + length/2 + r * Math.cos(angle),
            y: cy + r * Math.sin(angle)
        });
    }
    // 3. 下直道 (右 -> 左)
    for (let x = cx + length/2; x >= cx - length/2; x -= step) {
        points.push({x: x, y: cy + r + (Math.random()*2-1)});
    }
    // 4. 左半圆
    for (let angle = Math.PI/2; angle <= 1.5*Math.PI; angle += step/r) {
        points.push({
            x: cx - length/2 + r * Math.cos(angle),
            y: cy + r * Math.sin(angle)
        });
    }
    return points;
}

// 辅助：生成进出场线条
function generateLineData(cx, cy, r, isStart) {
    let points = [];
    const startX = cx - 40; 
    const startY = cy - r - 10; // 起点在左上角外侧
    
    for(let i=0; i<8; i++) {
        points.push({
            x: startX + i*5 + Math.random()*2,
            y: startY + i*2 + Math.random()*2
        });
    }
    return points;
}


// ==========================================
// 2. 核心绘制逻辑
// ==========================================
function drawDataHighFidelity(ctx, canvasWidth, canvasHeight, data) {
    return new Promise((resolve) => {
        // ⚠️ 重要：原参数是基于 360px 设计的，这里必须锁定缩放比例
        // 否则在高清 Canvas 上轨迹会变小
        const scale = canvasWidth / 360;

        // --- 渐变色变量 ---
        let is_bs = false;
        let bs_prob = 0.15; 
        let bs_pres_color = [38, 201, 154]; 
        let bs_pres_x = 0, bs_pres_y = 0;
        let bs_now = 0, bs_range = 0;
        let bs_max = [];
        const bs_range_min = 10, bs_range_max = 30;

        let processedCoords = []; 
        let draw_start_x = 0, draw_start_y = 0;

        // --- 开始绘制轨迹 ---
        data.forEach((item, index) => {
            let x = item.x * scale;
            let y = item.y * scale;

            switch (item.action) {
                case 'down':
                    ctx.beginPath();
                    ctx.lineJoin = "round"; ctx.lineCap = "round";
                    ctx.lineWidth = 5 * scale;
                    ctx.strokeStyle = "rgb(38, 201, 154)";
                    ctx.moveTo(x, y);
                    
                    draw_start_x = x;
                    draw_start_y = y;
                    bs_pres_x = x;
                    bs_pres_y = y;
                    bs_pres_color = [38, 201, 154];
                    is_bs = false;
                    break;

                case 'move':
                    // 渐变色逻辑
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

                    if (!is_bs && Math.random() < bs_prob && index < data.length - 15) {
                        is_bs = true;
                        let rg = 2 * Math.random() - 1;
                        if (rg > 0) bs_max = [Math.floor(193 * Math.pow(Math.abs(rg), 0.5)), Math.floor(-110 * Math.pow(Math.abs(rg), 0.5)), Math.floor(-66 * Math.pow(Math.abs(rg), 0.5))];
                        else bs_max = [Math.floor(27 * Math.pow(Math.abs(rg), 0.5)), Math.floor(16 * Math.pow(Math.abs(rg), 0.5)), Math.floor(94 * Math.pow(Math.abs(rg), 0.5))];
                        bs_range = bs_range_min + Math.floor((bs_range_max - bs_range_min) * Math.random());
                        bs_now = 0;
                    }

                    if (is_bs) {
                        ctx.beginPath();
                        ctx.lineJoin = "round"; ctx.lineCap = "round";
                        ctx.lineWidth = (5 * scale).toString();
                        ctx.moveTo(bs_pres_x, bs_pres_y);
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

        // --- 3. 绘制起点和终点 (纯代码绘制) ---
        const endCoord = processedCoords[processedCoords.length - 1] || {x:0, y:0};

        // 画起点 (Keep绿)
        drawMarker(ctx, draw_start_x, draw_start_y, '#26c99a', scale);
        // 画终点 (Keep红)
        drawMarker(ctx, endCoord.x, endCoord.y, '#ff5e5e', scale);

        resolve();
    });
}

// 辅助函数：绘制纯代码图标 (圆点)
function drawMarker(ctx, x, y, color, scale) {
    ctx.save();
    // 阴影
    ctx.shadowBlur = 4;
    ctx.shadowColor = "rgba(0,0,0,0.3)";
    // 外白圈
    ctx.beginPath();
    ctx.arc(x, y, 7 * scale, 0, 2 * Math.PI);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    // 内色圈
    ctx.beginPath();
    ctx.arc(x, y, 5 * scale, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
}

// ==========================================
// 3. 主界面入口
// ==========================================
async function drawMine(ignoredUrl) {
    console.log("本地生成：绘制精准校准版...");
    
    let bgSrc = "";
    // 严格按照优先级：保存的设置 > 默认图 > 当前图
    if (typeof tmp_bgimg_osrc !== 'undefined' && tmp_bgimg_osrc) bgSrc = tmp_bgimg_osrc;
    else if (typeof use_default_bg !== 'undefined' && use_default_bg) bgSrc = default_bgSRC[1];
    else {
        const bgEl = document.getElementById('bg-img');
        if(bgEl) bgSrc = bgEl.src;
    }

    const bgImg = new Image();
    bgImg.crossOrigin = "Anonymous";
    bgImg.src = bgSrc;

    bgImg.onload = async function() {
        const canvas = document.createElement('canvas');
        // 锁定画布逻辑宽度为 360，确保坐标对齐
        // 如果图片很大，我们会保持宽高比缩放
        canvas.width = bgImg.naturalWidth || 360;
        canvas.height = bgImg.naturalHeight || 719;
        const ctx = canvas.getContext('2d');

        // 画背景
        ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

        // 画精准轨迹
        const data = generateLocalTrackData();
        await drawDataHighFidelity(ctx, canvas.width, canvas.height, data);

        const resultImg = document.getElementById('bg-img');
        if(resultImg) resultImg.src = canvas.toDataURL();
    };
    
    bgImg.onerror = function() {
        alert("背景图加载失败。");
    }
}

// ==========================================
// 4. 弹窗入口
// ==========================================
async function Json2Draw(ignoredUrl) {
    console.log("本地生成：绘制弹窗...");
    
    const canvas = document.getElementById('drawpic_canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let bgSrc = "";
    if (typeof use_default_bg !== 'undefined' && use_default_bg) bgSrc = default_bgSRC[1];
    else if (typeof bgSRC !== 'undefined') bgSrc = bgSRC;
    else bgSrc = document.getElementById('bg-img').src;

    const bgImg = new Image();
    bgImg.crossOrigin = "Anonymous";
    bgImg.src = bgSrc;

    bgImg.onload = async function() {
        if(typeof current_img_width !== 'undefined') {
             canvas.width = current_img_width;
             canvas.height = current_img_height;
        } else {
             canvas.width = bgImg.naturalWidth;
             canvas.height = bgImg.naturalHeight;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

        const data = generateLocalTrackData();
        await drawDataHighFidelity(ctx, canvas.width, canvas.height, data);
    };
}