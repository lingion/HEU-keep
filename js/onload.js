// js/onload.js

// --- 核心优化：配速随机生成器 (防止出现 4.99) ---
function getRandomPace(min, max) {
    // 1. 解析最小配速 (例如 4.3 -> 4分30秒 -> 270秒)
    let min_m = Math.floor(min);
    let min_s = Math.round((min - min_m) * 100); // 处理浮点精度
    let min_total_sec = min_m * 60 + min_s;

    // 2. 解析最大配速
    let max_m = Math.floor(max);
    let max_s = Math.round((max - max_m) * 100);
    let max_total_sec = max_m * 60 + max_s;

    // 3. 在总秒数范围内随机
    let rand_total_sec = Math.floor(min_total_sec + Math.random() * (max_total_sec - min_total_sec));

    // 4. 转回 分.秒 格式
    let res_m = Math.floor(rand_total_sec / 60);
    let res_s = rand_total_sec % 60;

    // 5. 格式化字符串 (保证是 4.05 而不是 4.5)
    let s_str = res_s < 10 ? "0" + res_s : String(res_s);
    return res_m + "." + s_str;
}

window.onload = async function () {
    // --- 1. 基础变量初始化 ---
    let datetime_now = new Date();
    date_year = datetime_now.getFullYear();
    date_month = datetime_now.getMonth() + 1;
    date_day = datetime_now.getDate();
    time_hour = datetime_now.getHours();
    time_min = datetime_now.getMinutes();
    
    // 默认值
    username = "用户名";
    keep_title = "哈尔滨工程大学南田径场";
    humidity = 45;
    temperature = 20;
    bs = true;
    bs_prob = 0.08;
    bs_range_min = 30;
    bs_range_max = 40;
    savePic_width = 1080;
    km_min = 2.2;
    km_max = 3.9;
    speed_min = 4.30; // 4分30秒
    speed_max = 5.20; // 5分20秒
    auto_change = true;

    // 填充范围输入框
    document.getElementById('min_miles').value = km_min;
    document.getElementById('max_miles').value = km_max;
    document.getElementById('min_speeds').value = speed_min;
    document.getElementById('max_speeds').value = speed_max;
    
    // 生成随机公里数 (保持不变)
    miles = Math.floor((parseFloat(km_min) + Math.random() * (parseFloat(km_max) - parseFloat(km_min))) * 100) / 100;
    
    // 🔴 优化：生成随机配速 (使用新算法)
    speeds = getRandomPace(parseFloat(speed_min), parseFloat(speed_max));

    document.getElementById("inpt_miles").value = miles;
    document.getElementById("inpt_speeds").value = speeds;
    document.getElementById("auto_draw_checkbox").checked = auto_change;

    // --- 2. 恢复 IndexedDB 数据 ---
    document.addEventListener('dbReady', async function () {
        retrieveData("user_info", function (err, data) {
            if (data) {
                username = data.username || username;
                keep_title = data.keep_title || keep_title;
                km_min = data.km_min || 2.2;
                km_max = data.km_max || 3.9;
                speed_min = data.speed_min || 4.3;
                speed_max = data.speed_max || 5.2;
                default_bgSRC = data.default_bgSRC || default_bgSRC;
                display_guijiSelect_id = data.display_guijiSelect_id || display_guijiSelect_id;
                bs = data.bs;
                bs_prob = data.bs_prob || bs_prob;
                bs_range_min = data.bs_range_min || bs_range_min;
                bs_range_max = data.bs_range_max || bs_range_max;
                savePic_width = data.savePic_width || savePic_width;
                auto_change = data.auto_change;

                document.getElementById("inpt_username").value = username;
                document.getElementById("inpt_keep_title").value = keep_title;
                document.getElementById('min_miles').value = km_min;
                document.getElementById('max_miles').value = km_max;
                document.getElementById('min_speeds').value = speed_min;
                document.getElementById('max_speeds').value = speed_max;

                // 重新计算随机值
                miles = Math.floor((parseFloat(km_min) + Math.random() * (parseFloat(km_max) - parseFloat(km_min))) * 100) / 100;
                
                // 🔴 优化：生成随机配速 (读取缓存后也应用新算法)
                speeds = getRandomPace(parseFloat(speed_min), parseFloat(speed_max));

                document.getElementById("inpt_miles").value = miles;
                document.getElementById("inpt_speeds").value = speeds;
                document.getElementById("default_bgImgSelect").value = display_guijiSelect_id;
                
                if(document.getElementById(display_guijiSelect_id)) {
                    document.getElementById(display_guijiSelect_id).style.display = "inline";
                    default_bgSRC = eval(document.getElementById(display_guijiSelect_id).value);
                    setbgImg(default_bgSRC[0]);
                }

                if (bs) {
                    document.getElementById("bs_prop_inpt_wrap").style.display = "list-item";
                    document.getElementById("inpt_bs_range_wrap").style.display = "list-item";
                } else {
                    document.getElementById("bs_prop_inpt_wrap").style.display = "none";
                    document.getElementById("inpt_bs_range_wrap").style.display = "none";
                }

                document.getElementById("inpt_colorchange_checkbox").checked = bs;
                document.getElementById("auto_draw_checkbox").checked = auto_change;
                document.getElementById("inpt_bs_prob").value = bs_prob;
                document.getElementById("inpt_bs_range_min").value = bs_range_min;
                document.getElementById("inpt_bs_range_max").value = bs_range_max;
                document.getElementById("inpt_savePic_width").value = savePic_width;

                render();
            }
        });

        retrieveData("user_portrait", function (err, data) {
            if (data && data.portrait_data) {
                let IMG = new Image();
                IMG.src = data.portrait_data;
                document.getElementById("portrait").src = IMG.src;
                IMG.onload = function () {
                    if (parseInt(IMG.width) / parseInt(IMG.height) > 1) {
                        document.getElementById("portrait").style.height = String(ptHeight) + "px";
                        document.getElementById("portrait").style.width = String(parseInt(IMG.width) * ptHeight / parseInt(IMG.height)) + "px";
                    } else {
                        document.getElementById("portrait").style.height = String(parseInt(IMG.height) * ptWidth / parseInt(IMG.width)) + "px";
                        document.getElementById("portrait").style.width = String(ptWidth) + "px";
                    }
                }
            }
        });

        retrieveData("user_bgimg", function (err, data) {
            if (data && data.bgimg_data) {
                setbgImg(data.bgimg_data);
            }
        });
    });

    // --- 3. 执行常规初始化 ---
    initInputData();
    init_portrait();
    default_bgImgSelect_onChange();
    inpt_colorchange_checkbox_onchange();
    dbReady();

    // --- 4. 天气获取模块 ---
    console.log("开始获取哈工程天气...");
    const lat = 45.773;
    const lon = 126.679;
    const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code&timezone=Asia%2FShanghai`;

    try {
        const response = await fetch(apiUrl);
        if (response.ok) {
            const data = await response.json();
            const current = data.current;
            
            // 温度
            const tempVal = Math.round(current.temperature_2m);
            document.getElementById("inpt_temperature").value = tempVal;
            temperature = tempVal;

            // 湿度
            const humVal = Math.round(current.relative_humidity_2m);
            document.getElementById("inpt_humidity").value = humVal + '%';
            humidity = humVal;

            // 天气图标 (使用索引法)
            const wCode = current.weather_code;
            let selectIndex = 0; 
            if (wCode > 1 && wCode <= 2) {
                selectIndex = 1; // 多云
            } else if (wCode > 2) {
                selectIndex = 2; // 阴/雨/雪
            }

            const weatherSelect = document.getElementById('weather_Select');
            if (weatherSelect) {
                weatherSelect.selectedIndex = selectIndex;
                weatherSelect.dispatchEvent(new Event('change'));
            }
            
            // 触发更新
            document.getElementById("inpt_temperature").dispatchEvent(new Event('change'));
            document.getElementById("inpt_humidity").dispatchEvent(new Event('change'));

            console.log(`天气更新成功: ${tempVal}°C`);
        }
    } catch (err) {
        console.error("天气获取失败，使用默认值", err);
    }

    // --- 5. 自动绘制轨迹 ---
    let url = 'https://tool.joytion.cn/generate-track';
    if (auto_change) {
        fetch(url)
            .then(response => {
                if (!response.ok) throw new Error('Cannot Fetch');
                return response.json();
            })
            .then(data => {
                drawMine(url);
            })
            .catch(error => console.log('Json_Get_Error:', error));
    }

    setTimeout(render, 500);
}