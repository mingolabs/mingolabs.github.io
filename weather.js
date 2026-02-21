async function initWeatherApp() {
    try {
        // Fetch approximate location via IP
        const geoRes = await fetch('https://ipapi.co/json/');
        if (!geoRes.ok) throw new Error('Location fetch failed');
        const geoData = await geoRes.json();
        
        const lat = geoData.latitude;
        const lon = geoData.longitude;
        const city = geoData.city;
        const isUS = geoData.country_code === 'US';
        
        // Fetch richer weather data
        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min&timezone=auto`);
        if (!weatherRes.ok) throw new Error('Weather fetch failed');
        const weatherData = await weatherRes.json();
        
        const current = weatherData.current;
        const daily = weatherData.daily;
        
        let temp = current.temperature_2m;
        let feelsLike = current.apparent_temperature;
        let humidity = current.relative_humidity_2m;
        let wind = current.wind_speed_10m;
        let tempMax = daily.temperature_2m_max[0];
        let tempMin = daily.temperature_2m_min[0];
        let unit = '°C';
        
        // Auto-convert everything to Fahrenheit for US visitors
        if (isUS) {
            temp = (temp * 9/5) + 32;
            feelsLike = (feelsLike * 9/5) + 32;
            tempMax = (tempMax * 9/5) + 32;
            tempMin = (tempMin * 9/5) + 32;
            unit = '°F';
            wind = wind * 0.621371; // Convert km/h to mph
        }
        
        const code = current.weather_code;
        
        // WMO Weather interpretation into Emojis
        let icon = '☁️';
        let condition = 'Cloudy';
        if (code === 0) { icon = '☀️'; condition = 'Clear Sky'; }
        else if (code === 1 || code === 2) { icon = '⛅'; condition = 'Partly Cloudy'; }
        else if (code === 3) { icon = '☁️'; condition = 'Overcast'; }
        else if (code >= 45 && code <= 48) { icon = '🌫️'; condition = 'Foggy'; }
        else if (code >= 51 && code <= 67) { icon = '🌧️'; condition = 'Rain'; }
        else if (code >= 71 && code <= 77) { icon = '❄️'; condition = 'Snow'; }
        else if (code >= 80 && code <= 82) { icon = '🌦️'; condition = 'Showers'; }
        else if (code >= 95) { icon = '⛈️'; condition = 'Thunderstorm'; }
        
        // Inject into the top right bar
        const topBarStatus = document.querySelector('.top-bar div:last-child');
        const weatherSpan = document.createElement('span');
        weatherSpan.style.cursor = 'pointer';
        weatherSpan.style.marginRight = '12px';
        weatherSpan.style.transition = 'color 0.2s';
        weatherSpan.innerHTML = `${icon} ${Math.round(temp)}${unit}`;
        
        // Add hover effect matching the OS style
        weatherSpan.onmouseenter = () => weatherSpan.style.color = 'var(--accent-colour)';
        weatherSpan.onmouseleave = () => weatherSpan.style.color = '#fdfdfd';
        weatherSpan.onclick = () => toggleWeatherWindow();
        
        topBarStatus.prepend(weatherSpan);
        
        // Generate the OS window and dock icon dynamically
        createWeatherWindow(city, Math.round(temp), unit, icon, condition, Math.round(feelsLike), humidity, Math.round(tempMax), Math.round(tempMin), Math.round(wind), isUS ? 'mph' : 'km/h');
        
    } catch (error) {
        console.log("Weather app silently failed to load (likely adblocker blocking IP check).", error);
    }
}

function createWeatherWindow(city, temp, unit, icon, condition, feelsLike, humidity, tempMax, tempMin, wind, windUnit) {
    const desktop = document.getElementById('desktop-ui');
    const dock = document.querySelector('.dock');
    
    // Inject the temporary dock icon (hidden by default)
    if (dock && !document.getElementById('dock-weather')) {
        const dockIconHTML = `<div class="dock-icon active" id="dock-weather" style="display: none;" onclick="toggleWeatherWindow()" onmouseenter="if(typeof playRandomPop === 'function') playRandomPop()" title="Weather Widget">${icon}</div>`;
        dock.insertAdjacentHTML('beforeend', dockIconHTML);
    }
    
    const winHTML = `
        <div id="weather-win" class="window" style="top: 15%; left: 60%; width: 320px; z-index: 100;">
            <div class="title-bar" id="weather-title-bar">
                <span class="window-title">Weather Widget</span>
                <button onclick="toggleWeatherWindow()" class="close-btn"></button>
            </div>
            <div class="window-content" style="min-height: auto; text-align: center; padding: 2rem 1.5rem;">
                <p style="color: var(--accent-colour); font-weight: 600; font-size: 1.3rem; margin: 0 0 1rem 0; letter-spacing: 1px; text-transform: uppercase;">${city}</p>
                <div style="font-size: 5rem; line-height: 1;">${icon}</div>
                <h2 style="margin: 0.5rem 0 0 0; font-size: 3.5rem; color: #fdfdfd; font-weight: 300;">${temp}${unit}</h2>
                <p style="color: #ccc; font-size: 1.1rem; margin: 0.5rem 0 1.5rem 0;">${condition}</p>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; text-align: left; background: rgba(0,0,0,0.3); padding: 1.2rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);">
                    <div>
                        <span style="color:#aaa; font-size:0.8rem; text-transform: uppercase;">Feels Like</span><br>
                        <b style="font-size: 1.1rem;">${feelsLike}${unit}</b>
                    </div>
                    <div>
                        <span style="color:#aaa; font-size:0.8rem; text-transform: uppercase;">High / Low</span><br>
                        <b style="font-size: 1.1rem;">${tempMax} / ${tempMin}${unit}</b>
                    </div>
                    <div>
                        <span style="color:#aaa; font-size:0.8rem; text-transform: uppercase;">Humidity</span><br>
                        <b style="font-size: 1.1rem;">${humidity}%</b>
                    </div>
                    <div>
                        <span style="color:#aaa; font-size:0.8rem; text-transform: uppercase;">Wind</span><br>
                        <b style="font-size: 1.1rem;">${wind} ${windUnit}</b>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    desktop.insertAdjacentHTML('beforeend', winHTML);
    
    // Attach MingOS drag-and-drop mechanics to the new window
    const win = document.getElementById('weather-win');
    const titleBar = document.getElementById('weather-title-bar');
    
    win.addEventListener('mousedown', () => {
        document.querySelectorAll('.window').forEach(w => w.classList.remove('active-focus'));
        win.classList.add('active-focus');
        if (typeof zIndexCounter !== 'undefined') {
            zIndexCounter++;
            win.style.zIndex = zIndexCounter;
        }
    });
    
    let isDragging = false, offsetX, offsetY;
    titleBar.addEventListener('mousedown', (e) => {
        isDragging = true;
        offsetX = e.clientX - win.getBoundingClientRect().left;
        offsetY = e.clientY - win.getBoundingClientRect().top;
    });
    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        win.style.left = (e.clientX - offsetX) + 'px';
        win.style.top = (e.clientY - offsetY) + 'px';
    });
    document.addEventListener('mouseup', () => { isDragging = false; });
}

function toggleWeatherWindow() {
    const win = document.getElementById('weather-win');
    const dockIcon = document.getElementById('dock-weather');
    
    if (win.classList.contains('active')) {
        // Close window and remove dock icon
        win.classList.remove('active');
        if (dockIcon) dockIcon.style.display = 'none';
    } else {
        // Open window and show dock icon
        win.classList.add('active');
        if (dockIcon) {
            dockIcon.style.display = 'flex';
            dockIcon.classList.add('active');
        }
        
        // Focus the newly opened window
        document.querySelectorAll('.window').forEach(w => w.classList.remove('active-focus'));
        win.classList.add('active-focus');
        if (typeof zIndexCounter !== 'undefined') {
            zIndexCounter++;
            win.style.zIndex = zIndexCounter;
        }
    }
}

// Initialise on load
initWeatherApp();