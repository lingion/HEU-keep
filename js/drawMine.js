/**
 * drawMine.js (修复横穿线BUG + 右上角自然进场 + 剧烈抖动)
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
    const STEP = 15; // 大步长，保留真实感      

    // 1. 先生成一个标准的“底板”圈 (不带噪点)
    // 这里的目的是确定形状和起点位置
    const baseLap = generateBaseEllipse(BASE_CX, BASE_CY, LENGTH, BASE_R, STEP);

    // 2. 找到“右上角”的索引，重新排列底板
    // 上直道结束的位置大约就是右上角
    const pointsPerStraight = Math.floor(LENGTH / STEP);
    const shiftIndex = pointsPerStraight + 2; // 稍微往弯道进一点点

    // 重新排序：将起点强制变更为右上角
    // 这样我们后续复制圈数时，每一圈的起点就天然在右上角了
    const part1 = baseLap.slice(0, shiftIndex);
    const part2 = baseLap.slice(shiftIndex);
    const rotatedBaseLap = part2.concat(part1);

    let allPoints = [];
    
    // 3. 基于旋转后的底板，生成 5 到 8 圈
    const laps = Math.floor(Math.random() * 4) + 5; 

    for (let i = 0; i < laps; i++) {
        // 每一圈的随机参数 (道次漂移)
        const r_noise = (Math.random() * 6 - 3); 
        const cy_noise = (Math.random() * 4 - 2);
        const cx_noise = (Math.random() * 2 - 1);
        
        // 基于底板生成带有噪点的这一圈
        const currentLapPoints = rotatedBaseLap.map(p => ({
            x: p.x + cx_noise + (p.isVertical ? r_noise : 0), // 简化的变形逻辑
            y: p.y + cy_noise + (p.isVertical ? 0 : r_noise)
        }));

        // 为了增加真实感，我们不能直接用currentLapPoints，因为那样太圆滑
        // 我们需要重新通过算法生成点，但要确保起点对齐
        // 最简单的方法：直接调用 generateEllipse 但使用修正后的起始角度？
        // 不，为了保证连续性，我们采用“基于点偏移”的方法更稳妥。
        
        // 重新生成一圈数据，这次我们直接生成一长串连续的数据
        // 但为了避免横穿线，我们采用更简单的策略：
        // 直接按顺序生成多圈，每一圈都在上一圈的末尾继续
        
        // 修正策略：我们放弃上面的 map，直接用循环生成连续点
    }

    // --- 修正后的生成逻辑 (解决横穿线) ---
    allPoints = [];
    
    // 进场线的目标点 (右上角估算坐标)
    const startTargetX = BASE_CX + LENGTH/2 - 5; 
    const startTargetY = BASE_CY - BASE_R + 5;
    
    // 生成进场线
    const entryPoints = generateNaturalEntry({x: startTargetX, y: startTargetY});
    allPoints = [...entryPoints];

    // 开始跑圈
    for (let i = 0; i < laps; i++) {
        const r_drift = (Math.random() * 6 - 3); // 半径漂移
        const cx_drift = (Math.random() * 2 - 1);
        const cy_drift = (Math.random() * 4 - 2);

        // 关键：generateRotatedLap 生成的是从右上角开始的一整圈
        const lapPoints = generateRotatedLap(
            BASE_CX + cx_drift, 
            BASE_CY + cy_drift, 
            LENGTH, 
            BASE_R + r_drift, 
            STEP
        );
        allPoints = allPoints.concat(lapPoints);
    }

    // 结束缓冲 (跑 20% - 50% 圈后停下)
    const endLapPoints = generateRotatedLap(BASE_CX, BASE_CY, LENGTH, BASE_R, STEP);
    const cutIndex = Math.floor(endLapPoints.length * 0.2 + Math.random() * (endLapPoints.length * 0.3));
    allPoints = allPoints.concat(endLapPoints.slice(0, cutIndex));

    // --- 坐标变换 (整体旋转) ---
    const rad = ROTATE * Math.PI / 180; 
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    const resultData = allPoints.map((p, index) => {
        let dx = p.x - BASE_CX;
        let dy = p.y - BASE_CY;
        let rx = dx * cos - dy * sin;
        let ry = dx * sin + dy * cos;
        let finalX = rx + BASE_CX;
        let finalY = ry + BASE_CY;
        
        // GPS 噪点 (剧烈抖动)
        const noiseX = Math.random() * 2.5 - 1.25;
        const noiseY = Math.random() * 2.5 - 1.25;

        return {
            action: index === 0 ? 'down' : 'move',
            x: finalX + noiseX,
            y: finalY + noiseY
        };
    });

    // 50% 概率反向跑
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

// 生成一圈数据，但是起点强制设定在“右上角”
// 顺序：右半圆(部分) -> 下直道 -> 左半圆 -> 上直道 -> 右半圆(剩余)
// 为了代码简单，我们还是生成标准圈，然后数组轮转
function generateRotatedLap(cx, cy, length, r, step) {
    let points = [];
    // 1. 上直道 (左->右)
    for (let x = cx - length/2; x <= cx + length/2; x += step) {
        points.push({x: x, y: cy - r + (Math.random()*2 - 1)});
    }
    // 2. 右半圆
    for (let angle = -Math.PI/2; angle <= Math.PI/2; angle += step/r) {
        points.push({
            x: cx + length/2 + r * Math.cos(angle),
            y: cy + r * Math.sin(angle)
        });
    }
    // 3. 下直道 (右->左)
    for (let x = cx + length/2; x >= cx - length/2; x -= step) {
        points.push({x: x, y: cy + r + (Math.random()*2 - 1)});
    }
    // 4. 左半圆
    for (let angle = Math.PI/2; angle <= 1.5*Math.PI; angle += step/r) {
        points.push({
            x: cx - length/2 + r * Math.cos(angle),
            y: cy + r * Math.sin(angle)
        });
    }
    
    // 轮转数组，把起点移到右上角 (上直道结束处)
    const pointsPerStraight = Math.floor(length / step);
    const shiftIndex = pointsPerStraight + 2; 

    if (points.length > shiftIndex) {
        const part1 = points.slice(0, shiftIndex);
        const part2 = points.slice(shiftIndex);
        return part2.concat(part1);
    }
    return points;
}

// 仅用于辅助计算轮转索引的底板生成器 (无噪点)
function generateBaseEllipse(cx, cy, length, r, step) {
    let points = [];
    for (let x = cx - length/2; x <= cx + length/2; x += step) points.push({x:x, y:cy-r});
    for (let angle = -Math.PI/2; angle <= Math.PI/2; angle += step/r) points.push({x:cx+length/2+r*Math.cos(angle), y:cy+r*Math.sin(angle)});
    for (let x = cx + length/2; x >= cx - length/2; x -= step) points.push({x:x, y:cy+r});
    for (let angle = Math.PI/2; angle <= 1.5*Math.PI; angle += step/r) points.push({x:cx-length/2+r*Math.cos(angle), y:cy+r*Math.sin(angle)});
    return points;
}


// 自然的进场“小尾巴”生成器 (指向右上角)
function generateNaturalEntry(target) {
    let points = [];
    const numPoints = 8; 
    
    // 场外起点：目标点偏右 20-40px，偏上 20-50px
    const offsetX = 20 + Math.random() * 20; 
    const offsetY = -30 - Math.random() * 20;
    
    const startOrigin = {
        x: target.x + offsetX,
        y: target.y + offsetY
    };

    for(let i = 0; i < numPoints; i++) {
        const t = i / numPoints;
        // 简单的曲线插值
        let currentX = startOrigin.x + (target.x - startOrigin.x) * t;
        let currentY = startOrigin.y + (target.y - startOrigin.y) * t;
        
        // 弧度修正
        const arcCurve = Math.sin(t * Math.PI / 2) * 8;
        
        points.push({
            x: currentX - arcCurve, 
            y: currentY + (Math.random()*2 - 1)
        });
    }
    return points;
}


// ==========================================
// 2. 核心绘制逻辑 (线宽8px)
// ==========================================
function drawDataHighFidelity(ctx, canvasWidth, canvasHeight, data) {
    return new Promise((resolve) => {
        const scale = canvasWidth / 360;
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
                    if (!is_bs && Math.random() < bs_prob && index < data.length - 5) { 
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
    console.log("本地生成：修复横穿线版...");
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