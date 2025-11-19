/**
 * 本地随机轨迹生成器
 * 替代原有的 Python 后端接口，解决服务器报错问题
 */

function generateLocalTrackData() {
    // 1. 基础参数配置 (基于 360px 宽度的画布调整)
    const CX = 180 + (Math.random() * 40 - 20); // 圆心 X (有轻微随机偏移)
    const CY = 220 + (Math.random() * 40 - 20); // 圆心 Y
    const R = 65 + (Math.random() * 10 - 5);    // 半径
    const LEN = 80 + (Math.random() * 20 - 10); // 直道长度
    const STEP = 5; // 步长，越小点越密
    
    let points = [];

    // 2. 生成标准的操场跑道形状 (两段直道 + 两段半圆)
    // 上直道 (从左到右)
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
    // 下直道 (从右到左)
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

    // 闭合路径
    points.push(points[0]);

    // 3. 处理轨迹：旋转 + 噪点 (模拟真实 GPS 漂移)
    const rotationAngle = (Math.random() * 360) * (Math.PI / 180); // 随机旋转角度
    const cos = Math.cos(rotationAngle);
    const sin = Math.sin(rotationAngle);

    // 模拟进场和出场的多余线条 (让轨迹更真实，不完全闭合)
    const extraStartPoints = [];
    const extraEndPoints = [];
    for(let i=0; i<5; i++) {
        extraStartPoints.push({x: points[0].x - 10 + i*2, y: points[0].y - 10 + i*2});
        extraEndPoints.push({x: points[points.length-1].x + i*2, y: points[points.length-1].y + i*2});
    }
    
    // 合并所有点
    let finalPoints = [...extraStartPoints, ...points, ...extraEndPoints];
    
    // 最终处理
    const resultData = finalPoints.map((p, index) => {
        // 3.1 旋转
        let rx = (p.x - CX) * cos - (p.y - CY) * sin + CX;
        let ry = (p.x - CX) * sin + (p.y - CY) * cos + CY;

        // 3.2 添加噪点 (GPS 误差)
        // 直道误差小一点，弯道误差大一点
        const noise = Math.random() * 2.5 - 1.25; 
        rx += noise;
        ry += noise;

        return {
            action: index === 0 ? 'down' : 'move', // 第一个点是落笔(down)，后面是移动(move)
            x: rx,
            y: ry
        };
    });
    
    // 偶尔反转轨迹方向 (模拟顺时针或逆时针跑)
    if(Math.random() > 0.5) {
        // 保持 action 逻辑: 第一个必须是 down
        const reversedCoords = resultData.map(p => ({x: p.x, y: p.y})).reverse();
        return reversedCoords.map((p, index) => ({
            action: index === 0 ? 'down' : 'move',
            x: p.x,
            y: p.y
        }));
    }

    return resultData;
}