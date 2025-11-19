// js/onload.js
// 整合了初始化和天气获取功能的完整代码

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
    speed_min = 4.3;
    speed_max = 5.2;
    auto_change = true;

    // 填充随机的公里和配速
    document.getElementById('min_miles').value = km_min;
    document.getElementById('max_miles').value = km_max;
    document.getElementById('min_speeds').value = speed_min;
    document.getElementById('max_speeds').value = speed_max;
    
    miles = Math.floor((parseFloat(km_min) + Math.random() * (parseFloat(km_max) - parseFloat(km_min))) * 100) / 100;
    speeds = Math.floor((parseFloat(speed_min) + Math.random() * (parseFloat(speed_max) - parseFloat(speed_min))) * 100) / 100;

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

                miles = Math.floor((parseFloat(km_min) + Math.random() * (parseFloat(km_max) - parseFloat(km_min))) * 100) / 100;
                speeds = Math.floor((parseFloat(speed_min) + Math.random() * (parseFloat(speed_max) - parseFloat(speed_min))) * 100) / 100;

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
                    // 头像适配逻辑
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
    // 先不调 weather_Select_onChange，等下面 API 获取到了再调
    inpt_colorchange_checkbox_onchange();
    dbReady();

    // --- 4. 核心优化：获取哈尔滨工程大学天气 ---
    // 放在最后执行，确保覆盖前面的初始化
    console.log("开始获取哈工程天气...");
    const lat = 45.773;
    const lon = 126.679;
    const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code&timezone=Asia%2FShanghai`;

    try {
        const response = await fetch(apiUrl);
        if (response.ok) {
            const data = await response.json();
            const current = data.current;
            
            // 更新温度
            const tempVal = Math.round(current.temperature_2m);
            document.getElementById("inpt_temperature").value = tempVal;
            temperature = tempVal; // 更新全局变量

            // 更新湿度
            const humVal = Math.round(current.relative_humidity_2m);
            document.getElementById("inpt_humidity").value = humVal + '%';
            humidity = humVal; // 更新全局变量

            // 更新天气图标（使用索引法，更稳妥）
            // 0-1:晴(Index 0), 2:多云(Index 1), 3+:阴/雨/雪(Index 2)
            const wCode = current.weather_code;
            let selectIndex = 0; // 默认晴天

            if (wCode > 1 && wCode <= 2) {
                selectIndex = 1; // 多云
            } else if (wCode > 2) {
                selectIndex = 2; // 阴天/雨/雪
            }

            const weatherSelect = document.getElementById('weather_Select');
            if (weatherSelect) {
                weatherSelect.selectedIndex = selectIndex; // 强制选中第N项
                // 必须触发 change 事件，否则预览图不会变
                weatherSelect.dispatchEvent(new Event('change'));
            }
            
            // 必须手动触发一次 input 事件来更新预览上的文字
            document.getElementById("inpt_temperature").dispatchEvent(new Event('change'));
            document.getElementById("inpt_humidity").dispatchEvent(new Event('change'));

            console.log(`天气更新成功: ${tempVal}°C, Code:${wCode}, SelectIndex:${selectIndex}`);
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

    // 强制刷新一次渲染
    setTimeout(render, 500);
}