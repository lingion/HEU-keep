/**
 * drawMine.js (步长15 + 右上角起点 + 随机进场)
 */

// ==========================================
// 1. 核心算法：本地生成多圈随机轨迹
// ==========================================
function generateLocalTrackData() {
    // --- 📍 核心参数 ---
    const BASE_CX = 178;  
    const BASE_CY = 208;  
    const LENGTH = 115;   
    const ROTATE = -4;    
    const BASE_R = 61;    
    
    // ✅ 修改点1：步长改为 15 (折线感更强，更像真实GPS)
    const STEP = 15;       

    let allPoints = [];
    
    // 模拟跑 5 到 8 圈
    const laps = Math.floor(Math.random() * 4) + 5; 

    for (let i = 0; i < laps; i++) {
        // 每一圈的随机扰动
        const r_noise = (Math.random() * 6 - 3); 
        const cy_noise = (Math.random() * 4 - 2);
        const cx_noise = (Math.random() * 2 - 1);
        
        const currentR = BASE_R + r_noise;
        const currentCY = BASE_CY + cy_noise;
        const currentCX = BASE_CX + cx_noise;
        
        let lapPoints = generateEllipse(currentCX, currentCY, LENGTH, currentR, STEP);
        allPoints = allPoints.concat(lapPoints);
    }

    // 结束缓冲段
    const endLapPoints = generateEllipse(BASE_CX, BASE_CY, LENGTH, BASE_R, STEP);
    const cutIndex = Math.floor(endLapPoints.length * 0.3 + Math.random() * (endLapPoints.length * 0.3));
    allPoints = allPoints.concat(endLapPoints.slice(0, cutIndex));

    // ✅ 修改点2：强制将起点移至“右上角”
    // 原理：生成的点默认从左上角开始，我们计算出第一条直道(Top Straight)的点数，将数组向前滚动
    const pointsPerStraight = Math.floor(LENGTH / STEP);
    // 移动索引，使其刚好落在直道结束、弯道开始的地方 (右上)
    const shiftIndex = pointsPerStraight + 1; 
    
    // 数组轮转：把前面的点移到最后面，实现起点的改变但保持轨迹连续
    if (allPoints.length > shiftIndex) {
        const part1 = allPoints.slice(0, shiftIndex);
        const part2 = allPoints.slice(shiftIndex);
        allPoints = part2.concat(part1);
    }

    // ✅ 修改点3：随机进场路线 (目标是新的起点 allPoints[0])
    // 生成一条从场外连到当前起点的线
    const startTarget = allPoints[0];
    const extraStart = generateEntryLine(startTarget);
    
    let finalPoints = [...extraStart, ...allPoints];

    // --- 坐标变换 ---
    const rad = ROTATE * Math.PI / 180; 
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    const resultData = finalPoints.map((p, index) => {
        let dx = p.x - BASE_CX;
        let dy = p.y - BASE_CY;
        let rx = dx * cos - dy * sin;
        let ry = dx * sin + dy * cos;
        let finalX = rx + BASE_CX;
        let finalY = ry + BASE_CY;
        
        // GPS 噪点 (步长大了，噪点稍微收一点点，不然太乱)
        const noiseX = Math.random() * 2.0 - 1.0;
        const noiseY = Math.random() * 2.0 - 1.0;

        return {
            action: index === 0 ? 'down' : 'move',
            x: finalX + noiseX,
            y: finalY + noiseY
        };
    });

    // 50% 概率反向跑 (中心对称)
    if (Math.random() < 0.5) {
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
        points.push({x: x, y: cy - r + (Math.random()*2 - 1)});
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
        points.push({x: x, y: cy + r + (Math.random()*2 - 1)});
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

// ✅ 修改点4：随机进场线条生成器
function generateEntryLine(targetPoint) {
    let points = [];
    const numPoints = 5; // 进场点数不用太多
    
    // 随机决定进场方向：大部分情况从上方或右方进入
    // offsetX/Y 决定了"场外点"相对于"起点"的位置
    let offsetX = (Math.random() * 60) + 20; // 偏右 20~80px
    let offsetY = (Math.random() * 60) - 30; // 上下随机浮动
    
    // 如果随机到负数，就是从上方进来
    if(Math.random() > 0.6) {
        offsetX = (Math.random() * 40) - 20;
        offsetY = -(Math.random() * 50 + 30); // 偏上
    }

    const startX = targetPoint.x + offsetX;
    const startY = targetPoint.y + offsetY;

    for(let i=0; i<numPoints; i++) {
        // 线性插值，从场外慢慢连到起点
        const t = i / numPoints; 
        points.push({
            x: startX + (targetPoint.x - startX) * t + (Math.random()*4-2),
            y: startY + (targetPoint.y - startY) * t + (Math.random()*4-2)
        });
    }
    return points;
}


// ==========================================
// 2. 核心绘制逻辑 (保留之前的加粗)
// ==========================================
function drawDataHighFidelity(ctx, canvasWidth, canvasHeight, data) {
    return new Promise((resolve) => {
        const scale = canvasWidth / 360;

        // 步长变大了，线条要足够粗才好看，保持 8px
        const LINE_WIDTH = 8 * scale; 

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
                    ctx.lineWidth = LINE_WIDTH; 
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
                        ctx.lineWidth = LINE_WIDTH.toString(); 
                        ctx.moveTo(bs_pres_x, bs_pres_y);
                        ctx.lineTo(x, y);
                        let gradient = ctx.createLinearGradient(bs_pres_x, bs_pres_y, x, y);
                        gradient.addColorStop(0, `rgb(${bs_pres_color[0]},${bs_pres_color[1]},${bs_pres_color[2]})`);
                        gradient.addColorStop(1, "rgb(38, 201, 154)");
                        ctx.strokeStyle = gradient; ctx.stroke();
                        bs_pres_color = [38, 201, 154];
                    }
                    if (!is_bs && Math.random() < bs_prob && index < data.length - 5) { // 索引稍微放宽，因为点少了
                        is_bs = true;
                        let rg = 2 * Math.random() - 1;
                        if (rg > 0) bs_max = [Math.floor(193 * Math.pow(Math.abs(rg), 0.5)), Math.floor(-110 * Math.pow(Math.abs(rg), 0.5)), Math.floor(-66 * Math.pow(Math.abs(rg), 0.5))];
                        else bs_max = [Math.floor(27 * Math.pow(Math.abs(rg), 0.5)), Math.floor(16 * Math.pow(Math.abs(rg), 0.5)), Math.floor(94 * Math.pow(Math.abs(rg), 0.5))];
                        bs_range = bs_range_min + Math.floor((bs_range_max - bs_range_min) * Math.random());
                        bs_now = 0;
                    }
                    if (is_bs) {
                        ctx.beginPath(); ctx.lineJoin = "round"; ctx.lineCap = "round";
                        ctx.lineWidth = LINE_WIDTH.toString(); 
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

        const endCoord = processedCoords[processedCoords.length - 1] || {x:0, y:0};
        drawMarker(ctx, draw_start_x, draw_start_y, '#26c99a', scale);
        drawMarker(ctx, endCoord.x, endCoord.y, '#ff5e5e', scale);
        resolve();
    });
}

function drawMarker(ctx, x, y, color, scale) {
    ctx.save();
    ctx.shadowBlur = 4; ctx.shadowColor = "rgba(0,0,0,0.3)";
    ctx.beginPath(); ctx.arc(x, y, 8 * scale, 0, 2 * Math.PI); ctx.fillStyle = "#ffffff"; ctx.fill();
    ctx.beginPath(); ctx.arc(x, y, 6 * scale, 0, 2 * Math.PI); ctx.fillStyle = color; ctx.fill();
    ctx.restore();
}

// ==========================================
// 3. 主界面入口
// ==========================================
async function drawMine(ignoredUrl) {
    console.log("本地生成：绘制步长15版...");
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