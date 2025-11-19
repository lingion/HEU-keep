/**
 * drawMine.js - 修复版 (无需服务器)
 */

// 1. 主界面"随机路径"按钮
function drawMine(ignoredUrl) {
    // 检查依赖文件是否加载
    if (typeof generateLocalTrackData !== 'function') {
        alert("错误：未找到 localTrackGen.js，请检查 HTML 文件中是否正确引入了该脚本！");
        return;
    }

    console.log("开始生成随机路径...");
    const data = generateLocalTrackData();
    
    // 获取画布
    const canvas = document.getElementById("drawpic_canvas");
    if (!canvas) {
        alert("错误：找不到 ID 为 drawpic_canvas 的画布元素。");
        return;
    }

    // 【关键修复】强制设置画布分辨率为 Keep 截图的标准宽度
    // 如果不设置，默认可能是 1x1 或 300x150，导致画不上去或模糊
    canvas.width = 360;
    canvas.height = 719;

    // 获取绘图上下文
    const ctx = canvas.getContext("2d");
    // 清空旧内容
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 绘制路径
    drawDataToCanvas(ctx, data);

    // 【关键修复】直接更新预览图，不依赖 drawpic_yesbtn_onClick
    // 尝试找到原本用来显示手绘轨迹的图层
    // 根据项目结构，通常 UI 遮罩是 gui-img，或者有一个背景图层
    // 我们尝试复用 draw_personalization.js 里的逻辑，如果不行就手动更新
    
    if (typeof drawpic_yesbtn_onClick === 'function') {
        // 如果原作者的"确认"函数存在，直接调用它，这最保险
        try {
            drawpic_yesbtn_onClick();
            console.log("调用原有确认逻辑成功");
        } catch (e) {
            console.error("原有确认逻辑报错，尝试手动应用", e);
            manualApply(canvas);
        }
    } else {
        // 如果找不到确认函数，手动把 Canvas 转成图片贴上去
        manualApply(canvas);
    }
}

// 2. 弹窗中"随机生成"按钮
function Json2Draw(ignoredUrl) {
    if (typeof generateLocalTrackData !== 'function') {
        alert("错误：未找到 localTrackGen.js");
        return;
    }
    
    const data = generateLocalTrackData();
    const canvas = document.getElementById("drawpic_canvas");
    
    if (canvas) {
        // 弹窗模式下也重置一下大小，保证清晰度
        canvas.width = 360;
        canvas.height = 719;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawDataToCanvas(ctx, data);
    }
}

// --- 辅助函数 ---

// 手动应用图片到预览区
function manualApply(canvas) {
    const dataURL = canvas.toDataURL("image/png");
    
    // 尝试查找各种可能的图片容器
    // 1. 尝试找 gui-img (通常是前景图)
    const guiImg = document.getElementById("gui-img");
    // 2. 尝试找 bg-img (通常是地图背景)
    const bgImg = document.getElementById("bg-img");
    
    // 这是一个妥协方案：直接把轨迹覆盖在 GUI 层上
    // 如果这导致 UI 消失，请尝试换成 bgImg.src = dataURL (但这会覆盖地图)
    if (guiImg) {
        guiImg.src = dataURL;
        // 某些 CSS 可能会隐藏 gui-img，强制显示
        guiImg.style.display = 'block';
    } else if (bgImg) {
        // 如果没有 gui-img，只能覆盖背景了（不太推荐，但能看到效果）
        bgImg.src = dataURL;
    }
}

// 核心绘制逻辑
function drawDataToCanvas(ctx, data) {
    // 模拟 Keep 的轨迹风格 (橙红色渐变)
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 6; 
    
    // 创建渐变色
    const gradient = ctx.createLinearGradient(0, 0, 360, 719);
    gradient.addColorStop(0, "#ff512f"); // 红色
    gradient.addColorStop(1, "#dd2476"); // 紫红
    ctx.strokeStyle = gradient;
    
    // 添加发光效果
    ctx.shadowBlur = 5;
    ctx.shadowColor = "rgba(255, 50, 50, 0.6)";

    ctx.beginPath();
    let isFirst = true;
    
    data.forEach(point => {
        // 坐标偏移修正：如果算法生成的坐标不在中心，这里可以手动微调
        // 这里的 x,y 直接使用
        if (point.action === 'down' || isFirst) {
            ctx.moveTo(point.x, point.y);
            isFirst = false;
        } else if (point.action === 'move') {
            ctx.lineTo(point.x, point.y);
        }
    });
    
    ctx.stroke();
}