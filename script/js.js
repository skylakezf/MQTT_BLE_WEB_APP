
//天气APIkey
const weatherAPIKey = '33bbda4cc4c04a7383fd9bbc31f3e40d';
//const defaultLocation = "101280101"; // 广州市的默认位置


console.log("                         _oo0oo_");
console.log("                        o8888888o");
console.log("                        88\". \"88");
console.log("                        (| -_- |)");
console.log("                        0\\  =  /0");
console.log("                      ___/`---'\\___");
console.log("                   .' \\\\|     |// '.");
console.log("                   / \\\\|||  :  |||// \\");
console.log("                  / _||||| -:- |||||- \\");
console.log("                 |   | \\\\  - /// |   |");
console.log("                 | \\_|  ''\\---/''  |_/ |");
console.log("                 \\\\. -\\__  '-'  ___/-. /");
console.log("               ___'..'  /--.--\\  `..'___");
console.log("           .\"\" '<  `.___\\_<|>_/___.' >' \"\".");
console.log("           | | :  `- \\`.;`\\ _ /`;.`/ - ` : | |");
console.log("           \\  \\\\ `_.   \\_ __\\ /__ _/  .-` /  /");
console.log("       =====`-.____`.___ \\_____/___.-`___.-'=====");
console.log("                         `=---='");
console.log("  ");
console.log("       ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
console.log("  ");
console.log("             佛祖保佑       永不宕机     永无BUG");
console.log(" /");



function fetchWeatherData(longitude = '', latitude = '') {
    if (!longitude || !latitude) {
        longitude = '113.2644';
        latitude = '23.1291';
    }

    fetch(`https://devapi.qweather.com/v7/air/now?location=${longitude},${latitude}&key=${weatherAPIKey}`)
    .then(response => response.json())
    .then(data => {
        console.log('Air quality data:', data);
        if (data && data.now) {
            let airCategory = data.now.category || '未知';
            let airAqi = data.now.aqi || '未知';
            updateElement('airText', "空气质量： "+airCategory);
            updateElement('airValue',"AQI : "+airAqi);

            // 设置背景颜色
            let bgColor;
            if (airAqi <= 50) {
                bgColor = 'green';
            } else if (airAqi <= 100) {
                bgColor = '	#BDB76B';
                
            } else if (airAqi <= 150) {
                bgColor = 'orange';
            } else if (airAqi <= 200) {
                bgColor = 'red';
            } else if (airAqi <= 300) {
                bgColor = 'purple';
            } else {
                bgColor = 'maroon';
            }

            document.getElementById('weather_show_area').style.backgroundColor = bgColor;

        } else {
            console.error('Air quality data is missing');
        }
    })
    .catch(error => {
        console.error('Error fetching air quality data:', error);
    });

    fetch(`https://devapi.qweather.com/v7/weather/now?location=${longitude},${latitude}&key=${weatherAPIKey}`)
    .then(response => response.json())
    .then(data => {
        console.log('City temperature data:', data);
        if (data && data.now) {
            let cityTemp = data.now.temp || '未知';
            let windDir = data.now.windDir || '未知';
            let weather_update_time = data.now.obsTime || '未知';
            updateElement('weather', "气温： "+cityTemp+"°C");
            updateElement('city', windDir);
            updateElement('weather_update_time',"天气最后更新时间： "+weather_update_time);
        } else {
            console.error('City temperature data is missing');
        }
    })
    .catch(error => {
        console.error('Error fetching city temperature data:', error);
    });

    fetch(`https://devapi.qweather.com/v7/indices/1d?type=1&location=${longitude},${latitude}&key=${weatherAPIKey}`)
    .then(response => response.json())
    .then(data => {
        console.log('Weather advice data:', data);
        if (data && data.daily && data.daily.length > 0) {
            let weatherAdvice = data.daily[0].text || '未知';
            updateElement('weatheradvice', weatherAdvice);
        } else {
            console.error('Weather advice data is missing');
        }
    })
    .catch(error => {
        console.error('Error fetching weather advice data:', error);
    });
}


document.addEventListener('DOMContentLoaded', () => {
    fetchWeatherData();

    // 绑定开关的事件处理函数
    const alarmSwitch = document.getElementById('alarmSwitch');
    const irruptSwitch = document.getElementById('irruptSwitch');
    const fanSwitch = document.getElementById('fanSwitch');
    const pumpSwitch = document.getElementById('pumpSwitch');
    const windowSwitch = document.getElementById('windowSwitch');

    if (alarmSwitch) {
        alarmSwitch.addEventListener('change', onAlarm);
    }
    if (irruptSwitch) {
        irruptSwitch.addEventListener('change', onIrrupt);
    }
    if (fanSwitch) {
        fanSwitch.addEventListener('change', onFanChange);
    }
    if (pumpSwitch) {
        pumpSwitch.addEventListener('change', onPumpChange);
    }
    if (windowSwitch) {
        windowSwitch.addEventListener('change', onWindowChange);
    }
});




document.getElementById('connectBtn').addEventListener('click', async () => {
    try {
        const SERVICE_UUID = '4fafc201-1fb5-459e-8fcc-c5c9c331914b';
        const CHARACTERISTIC_UUID = 'beb5483e-36e1-4688-b7f5-ea07361b26a8'; // 替换为你的特征 UUID

        // 用于累积数据的缓冲区
        let buffer = '';

        // 弹出选择设备的对话框
        const device = await navigator.bluetooth.requestDevice({
            acceptAllDevices: true,
            optionalServices: [SERVICE_UUID]
        });

        // 连接设备
        const server = await device.gatt.connect();
        console.log('Connected to', device.name);

        // 获取服务
        const service = await server.getPrimaryService(SERVICE_UUID);
        const characteristic = await service.getCharacteristic(CHARACTERISTIC_UUID);

        // 监听特征的 valuechanged 事件
        await characteristic.startNotifications();
        characteristic.addEventListener('characteristicvaluechanged', (event) => {
            // 读取数据并累积
            const value = new TextDecoder().decode(event.target.value);
            buffer += value; // 将新数据添加到缓冲区
            console.log('Received partial data:', value); // 输出每个接收的数据片段

            // 检查缓冲区中是否包含一个完整的 JSON 数据包
            if (buffer.includes('{') && buffer.includes('}')) {
                const start = buffer.indexOf('{');
                const end = buffer.indexOf('}', start) + 1;

                // 提取完整的 JSON 数据包
                if (start !== -1 && end !== -1 && end > start) {
                    const jsonString = buffer.slice(start, end);

                    try {
                        // 尝试解析 JSON 数据
                        const data = JSON.parse(jsonString);
                        console.log('Received complete data:', data);
                 

                        // 调用 handleData 函数
                        handleData(data);

                        // 清除缓冲区中已处理的数据
                        buffer = buffer.slice(end);
                    } catch (e) {
                        console.error('Failed to parse JSON:', e);
                    }
                }
            }

            // 防止缓冲区过大，如果缓冲区超过设定大小，则清空它
            const MSG_BUFFER_SIZE = 150;
            if (buffer.length > MSG_BUFFER_SIZE) {
                console.warn('Buffer overflow, clearing buffer');
                buffer = ''; // 清空缓冲区
            }
        });

        // 监听设备断开连接事件
        device.addEventListener('gattserverdisconnected', () => {
            console.log('Device disconnected');
            document.getElementById('output').innerText = 'Device disconnected';
        });

    } catch (error) {
        console.error('Error:', error);
    }
});
function updateElement(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.innerText = value;
    } else {
        console.warn(`Element with ID ${id} not found.`);
    }
}
function handleData(data) {
    try {
        const jsonData = data; // 已经是 JSON 对象
        updateElement('time', jsonData.Time);
        updateElement('power', jsonData.PV + "%");
        if (jsonData.PV < 20) {
            updateElement('power', "电量低");
        }
        updateElement('temperature', jsonData.T + " °C");
        if (jsonData.T == 999) {
            updateElement('temperature', "传感器失效");
        }
        updateElement('humidity', jsonData.H + "%");
        if (jsonData.H == 999) {
            updateElement('humidity', "传感器失效");
        }
        updateElement('MQ5', jsonData.MQ === 1 ? '警报' : '正常');
        if (jsonData.MQ == 1) {
            document.getElementById('information').innerHTML = "燃气泄漏";
        }
        updateElement('Fire', jsonData.F === 1 ? '警报' : '正常');
        if (jsonData.F == 1) {
            document.getElementById('information').innerHTML = "起火";
        }
        updateElement('human', jsonData.M === 1 ? '警报' : '正常');
        if (jsonData.ctrlIrrupt == 1 && jsonData.M == 1) {
            document.getElementById('information').innerHTML = "疑似闯入";
        }
        document.getElementById('alarmSwitch').checked = jsonData.a === 1;
        document.getElementById('irruptSwitch').checked = jsonData.CM === 1;
        document.getElementById('fanSwitch').checked = jsonData.f === 1;
        document.getElementById('pumpSwitch').checked = jsonData.p === 1;
        document.getElementById('windowSwitch').checked = jsonData.w === 1;

        lastUpdateTime = Date.now();
        document.getElementById('state').innerText = "在线";
    } 
}
