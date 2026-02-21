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
        
        // Fetch weather data
        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
        if (!weatherRes.ok) throw new Error('Weather fetch failed');
        const weatherData = await weatherRes.json();
        
        const current = weatherData.current_weather;
        let temp = current.temperature;
        let unit = '°C';
        
        // Auto-convert to Fahrenheit for US visitors
        if (isUS) {
            temp = (temp * 9/5) + 32;
            unit = '°F';
        }
        
        temp = Math.round(temp);
        const code = current.weathercode;
        
        // WMO Weather interpretation into Emojis
        let icon = '☁️';
        if (code === 0) icon = '☀️';
        else if (code === 1 || code === 2) icon = '⛅';
        else if (code === 3) icon = '☁️';
        else if (code >= 45 && code <= 48) icon = '🌫️';
        else if (code >= 51 && code <= 67) icon = '🌧️';
        else if (code >= 71 && code <= 77) icon = '❄️';
        else if (code >= 80 && code <= 82) icon = '🌦️';
        else if (code >= 95) icon = '⛈️';
        
        // Inject into the top right bar
        const topBarStatus = document.querySelector('.top-bar div:last-child');
        const weatherSpan = document.createElement('span');
        weatherSpan.style.cursor = 'pointer';
        weatherSpan.style.marginRight = '12px';
        weatherSpan.style.transition = 'color 0.2s';
        weatherSpan.innerHTML = `${icon} ${temp}${unit}`;
        
        // Add hover effect matching the OS style
        weatherSpan.onmouseenter = () => weatherSpan.style.color = 'var(--accent-colour)';
        weatherSpan.onmouseleave = () => weatherSpan.style.color = '#fdfdfd';
        weatherSpan.onclick = () => toggleWeatherWindow();
        
        topBarStatus.prepend(weatherSpan);
        
        // Generate the OS window dynamically
        createWeatherWindow(city, temp, unit, icon, current.windspeed);
        
    } catch (error) {
        console.log("Weather app silently failed to load (likely adblocker blocking IP check).", error);
    }
}

function createWeatherWindow(city, temp, unit, icon, wind) {
    const desktop = document.getElementById('desktop-ui');
    
    const winHTML = `
        <div id="weather-win" class="window" style="top: 15%; left: 60%; width: 280px; z-index: 100;">
            <div class="title-bar" id="weather-title-bar">
                <span class="window-title">Weather</span>
                <button onclick="document.getElementById('weather-win').classList.remove('active')" class="close-btn"></button>
            </div>
            <div class="window-content" style="min-height: auto; text-align: center; padding: 2.5rem 1.5rem;">
                <div style="font-size: 4.5rem; margin-bottom: 0.5rem;">${icon}</div>
                <h2 style="margin: 0; font-size: 3rem; color: #fdfdfd; font-weight: 300;">${temp}${unit}</h2>
                <p style="color: var(--accent-colour); font-weight: 600; font-size: 1.2rem; margin: 0.5rem 0;">${city}</p>
                <p style="color: #aaa; font-size: 0.85rem; margin-top: 1rem;">Wind Speed: ${wind} km/h</p>
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
    if (win.classList.contains('active')) {
        win.classList.remove('active');
    } else {
        win.classList.add('active');
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