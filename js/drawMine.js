/**
 * drawMine.js (哈工程南体育场-像素级对齐版)
 * 修复：根据截图反馈，修正了圆心偏移和尺寸过小的问题
 */

// ==========================================
// 1. 核心算法：本地生成多圈随机轨迹
// ==========================================
function generateLocalTrackData() {
    // --- 📍 核心参数修正 (基于截图测算) ---
    // 之前的参数: CX=153, CY=160 (偏左上)
    // 修正后:
    const BASE_CX = 178;  // 向右平移，居中对齐
    const BASE_CY = 208;  // 向下平移，对准绿地中心
    const LENGTH = 106;   // 直道加长 (原95 -> 106)
    const ROTATE = -4;    // 保持 -4 度倾斜
    const BASE_R = 56;    // 半径加大 (原47 -> 56)，适应操场宽度
    const STEP = 6;       

    let allPoints = [];
    
    // 🏃 模拟跑 3 到 5 圈
    const laps = Math.floor(Math.random() * 3) + 3; 

    for (let i = 0; i < laps; i++) {
        // 每一圈的随机扰动 (模拟道次变化)
        // 半径扰动范围 -1.5 到 +1.5
        const r_noise = (Math.random() * 3 - 1.5); 
        const cy_noise = (Math.random() * 2 - 1);
        
        const currentR = BASE_R + r_noise;
        const currentCY = BASE_CY + cy_noise;
        
        let lapPoints = generateEllipse(BASE_CX, currentCY, LENGTH, currentR, STEP);
        allPoints = allPoints.concat(lapPoints);
    }

    // 🏃 增加半圈作为结束缓冲
    const endLapPoints = generateEllipse(BASE_CX, BASE_CY, LENGTH, BASE_R, STEP);
    const cutIndex = Math.floor(endLapPoints.length * 0.4 + Math.random() * (endLapPoints.length * 0.3));
    allPoints = allPoints.concat(endLapPoints.slice(0, cutIndex));

    // --- 🌀 进出场线条优化 ---
    const extraStart = generateLineData(BASE_CX, BASE_CY, BASE_R, true);
    
    let finalPoints = [...extraStart, ...allPoints];

    // --- 📐 坐标变换 ---
    const rad = ROTATE * Math.PI / 180; 
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    const resultData = finalPoints.map((p, index) => {
        // 1. 归零
        let dx = p.x - BASE_CX;
        let dy = p.y - BASE_CY;
        
        // 2. 旋转
        let rx = dx * cos - dy * sin;
        let ry = dx * sin + dy * cos;
        
        // 3. 复位
        let finalX = rx + BASE_CX;
        let finalY = ry + BASE_CY;
        
        // 4. 噪点 (GPS误差)
        // 直道误差小，弯道误差略大
        const noise = Math.random() * 1.6 - 0.8;

        return {
            action: index === 0 ? 'down' : 'move',
            x: finalX + noise,
            y: finalY + noise
        };
    });

    // 50% 概率反向跑
    if (Math.random() < 0.5) {
        // 中心对称翻转
        resultData.forEach(p => {
            p.x = BASE_CX - (p.x - BASE_CX);
            p.y = BASE_CY - (p.y - BASE_CY);
        });
    }

    // 抬笔
    if(resultData.length > 0) {
        const last = resultData[resultData.length-1];
        resultData.push({ action: 'up', x: last.x, y: last.y });
    }

    return resultData;
}

// 辅助：生成单圈椭圆
function generateEllipse(cx, cy, length, r, step) {
    let points = [];
    // 上直道
    for (let x = cx - length/2; x <= cx + length/2; x += step) {
        points.push({x: x, y: cy - r + (Math.random()*1.5-0.75)});
    }
    // 右半圆
    for (let angle = -Math.PI/2; angle <= Math.PI/2; angle += step/r) {
        points.push({
            x: cx + length/2 + r * Math.cos(angle),
            y: cy + r * Math.sin(angle)
        });
    }
    // 下直道
    for (let x = cx + length/2; x >= cx - length/2; x -= step) {
        points.push({x: x, y: cy + r + (Math.random()*1.5-0.75)});
    }
    // 左半圆
    for (let angle = Math.PI/2; angle <= 1.5*Math.PI; angle += step/r) {
        points.push({
            x: cx - length/2 + r * Math.cos(angle),
            y: cy + r * Math.sin(angle)
        });
    }
    return points;
}

// 辅助：生成进出场线条 (优化版：从左上角郑和路方向进入)
function generateLineData(cx, cy, r, isStart) {
    let points = [];
    // 起点在左直道上方附近
    const startX = cx - 60; 
    const startY = cy - r - 20; 
    
    for(let i=0; i<10; i++) {
        points.push({
            x: startX + i*4 + Math.random(),
            y: startY + i*2 + Math.random()
        });
    }
    return points;
}


// ==========================================
// 2. 核心绘制逻辑 (不变)
// ==========================================
function drawDataHighFidelity(ctx, canvasWidth, canvasHeight, data) {
    return new Promise((resolve) => {
        const scale = canvasWidth / 360;

        let is_bs = false;
        let bs_prob = 0.15; 
        let bs_pres_color = [38, 201, 154]; 
        let bs_pres_x = 0, bs_pres_y = 0;
        let bs_now = 0, bs_range = 0;
        let bs_max = [];
        const bs_range_min = 10, bs_range_max = 30;

        let processedCoords = []; 
        let draw_start_x = 0, draw_start_y = 0;

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
                    draw_start_x = x; draw_start_y = y;
                    bs_pres_x = x; bs_pres_y = y;
                    bs_pres_color = [38, 201, 154];
                    is_bs = false;
                    break;

                case 'move':
                    if (is_bs && bs_now >= bs_range) {
                        is_bs = false;
                        ctx.beginPath(); ctx.lineJoin = "round"; ctx.lineCap = "round";
                        ctx.lineWidth = (5 * scale).toString();
                        ctx.moveTo(bs_pres_x, bs_pres_y);
                        ctx.lineTo(x, y);
                        let gradient = ctx.createLinearGradient(bs_pres_x, bs_pres_y, x, y);
                        gradient.addColorStop(0, `rgb(${bs_pres_color[0]},${bs_pres_color[1]},${bs_pres_color[2]})`);
                        gradient.addColorStop(1, "rgb(38, 201, 154)");
                        ctx.strokeStyle = gradient; ctx.stroke();
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
                        ctx.beginPath(); ctx.lineJoin = "round"; ctx.lineCap = "round";
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
                        ctx.strokeStyle = gradient; ctx.lineTo(x, y); ctx.stroke();
                        bs_pres_color = bs_now_color; bs_now += 1;
                    } else {
                        ctx.lineTo(x, y); ctx.strokeStyle = "rgb(38, 201, 154)"; ctx.stroke();
                    }
                    bs_pres_x = x; bs_pres_y = y;
                    break;
            }
            processedCoords.push({ x, y });
        });

        // 绘制起点终点
        const endCoord = processedCoords[processedCoords.length - 1] || {x:0, y:0};
        drawMarker(ctx, draw_start_x, draw_start_y, '#26c99a', scale);
        drawMarker(ctx, endCoord.x, endCoord.y, '#ff5e5e', scale);
        resolve();
    });
}

function drawMarker(ctx, x, y, color, scale) {
    ctx.save();
    ctx.shadowBlur = 4; ctx.shadowColor = "rgba(0,0,0,0.3)";
    ctx.beginPath(); ctx.arc(x, y, 7 * scale, 0, 2 * Math.PI); ctx.fillStyle = "#ffffff"; ctx.fill();
    ctx.beginPath(); ctx.arc(x, y, 5 * scale, 0, 2 * Math.PI); ctx.fillStyle = color; ctx.fill();
    ctx.restore();
}

// ==========================================
// 3. 主界面入口
// ==========================================
async function drawMine(ignoredUrl) {
    console.log("本地生成：绘制修正版...");
    let bgSrc = "";
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
        canvas.width = bgImg.naturalWidth || 360;
        canvas.height = bgImg.naturalHeight || 719;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
        const data = generateLocalTrackData();
        await drawDataHighFidelity(ctx, canvas.width, canvas.height, data);
        const resultImg = document.getElementById('bg-img');
        if(resultImg) resultImg.src = canvas.toDataURL();
    };
    bgImg.onerror = function() { alert("背景图加载失败。"); }
}

// ==========================================
// 4. 弹窗入口
// ==========================================
async function Json2Draw(ignoredUrl) {
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
             canvas.width = current_img_width; canvas.height = current_img_height;
        } else {
             canvas.width = bgImg.naturalWidth; canvas.height = bgImg.naturalHeight;
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
        const data = generateLocalTrackData();
        await drawDataHighFidelity(ctx, canvas.width, canvas.height, data);
    };
}