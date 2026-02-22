function initStatusIcons() {
    const statusDiv = document.querySelector('.top-bar div:last-child');
    
    // Force perfect vertical alignment and uniform spacing
    statusDiv.style.display = 'flex';
    statusDiv.style.alignItems = 'center';
    statusDiv.style.gap = '16px'; 
    statusDiv.style.height = '100%';

    // Clean up the old hardcoded text emojis
    statusDiv.childNodes.forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) {
            node.nodeValue = node.nodeValue.replace(/⚙️|🔋|📶/g, '').trim(); 
        }
    });

    // Fix the weather widget's internal alignment
    const weatherSpan = statusDiv.querySelector('span');
    if (weatherSpan) {
        weatherSpan.style.marginRight = '0';
        weatherSpan.style.display = 'flex';
        weatherSpan.style.alignItems = 'center';
        weatherSpan.style.gap = '6px';
        weatherSpan.style.height = '100%';
    }

    // Global Audio Mute & Volume Logic
    window.mingosMuted = false;
    window.mingosVolume = 0.5; // Default 50% volume

    const originalPlay = HTMLAudioElement.prototype.play;
    HTMLAudioElement.prototype.play = function() {
        this.muted = window.mingosMuted;
        this.volume = window.mingosVolume;
        return originalPlay.call(this);
    };

    // Inject CSS for the dropdown and toggle switch
    const style = document.createElement('style');
    style.textContent = `
        .settings-wrapper {
            position: relative;
            display: flex;
            align-items: center;
            height: 100%;
        }
        .settings-dropdown {
            position: absolute;
            top: 28px;
            right: -10px;
            width: 240px;
            background: rgba(40, 40, 40, 0.95);
            backdrop-filter: blur(15px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            padding: 0.5rem;
            display: flex;
            flex-direction: column;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.2s, transform 0.2s;
            transform: translateY(-10px);
            box-shadow: 0 15px 40px rgba(0,0,0,0.6);
            z-index: 10000;
        }
        /* The Invisible Bridge to prevent hover gap */
        .settings-dropdown::before {
            content: '';
            position: absolute;
            top: -20px;
            left: 0;
            right: 0;
            height: 20px;
            background: transparent;
        }
        .settings-wrapper:hover .settings-dropdown {
            opacity: 1;
            pointer-events: auto;
            transform: translateY(0);
        }
        .dropdown-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.7rem 0.8rem;
            color: #fdfdfd;
            font-size: 0.9rem;
            border-radius: 6px;
            cursor: pointer;
            transition: background 0.2s;
        }
        .dropdown-item:hover {
            background: rgba(255, 255, 255, 0.15);
        }
        .volume-container {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 0.7rem 0.8rem;
            color: #fdfdfd;
        }
        .volume-slider {
            flex-grow: 1;
            -webkit-appearance: none;
            height: 4px;
            background: #555;
            border-radius: 2px;
            outline: none;
        }
        .volume-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 14px;
            height: 14px;
            border-radius: 50%;
            background: var(--accent-colour);
            cursor: pointer;
            transition: transform 0.1s;
        }
        .volume-slider::-webkit-slider-thumb:hover {
            transform: scale(1.2);
        }
        /* Custom Toggle Switch */
        .toggle-switch {
            position: relative;
            width: 36px;
            height: 20px;
            background: var(--accent-colour);
            border-radius: 10px;
            transition: background 0.3s;
        }
        .toggle-switch.muted {
            background: #666;
        }
        .toggle-switch::after {
            content: '';
            position: absolute;
            top: 2px;
            left: 18px;
            width: 16px;
            height: 16px;
            background: #fff;
            border-radius: 50%;
            transition: left 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
        }
        .toggle-switch.muted::after {
            left: 2px;
        }
    `;
    document.head.appendChild(style);

    // Create a flex container for the new SVG icons
    const iconContainer = document.createElement('span');
    iconContainer.style.display = 'flex';
    iconContainer.style.alignItems = 'center';
    iconContainer.style.gap = '16px';

    // SVG Generators
    const getWifiIcon = (bars) => {
        const op1 = bars > 0 ? 1 : 0.2;
        const op2 = bars > 1 ? 1 : 0.2;
        const op3 = bars > 2 ? 1 : 0.2;
        const op4 = bars > 3 ? 1 : 0.2;
        return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fdfdfd" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: block;">
            <path d="M1.42 9a16 16 0 0 1 21.16 0" stroke-opacity="${op4}"/>
            <path d="M5 12.55a11 11 0 0 1 14.08 0" stroke-opacity="${op3}"/>
            <path d="M8.53 16.11a6 6 0 0 1 6.95 0" stroke-opacity="${op2}"/>
            <line x1="12" y1="20" x2="12.01" y2="20" stroke-opacity="${op1}"/>
        </svg>`;
    };

    const getBatteryIcon = (level, charging) => {
        const width = Math.max(2, Math.floor(level * 14)); 
        const chargeIcon = charging ? `<polygon points="11 3 7 10 13 10 9 17" fill="var(--accent-colour)" stroke="var(--window-bg)" stroke-width="1"/>` : '';
        const colour = level <= 0.2 && !charging ? '#ff5f57' : '#fdfdfd';
        
        return `<svg width="24" height="14" viewBox="0 0 24 14" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: block;">
            <rect x="1" y="1" width="18" height="12" rx="2" stroke="#aaa" stroke-width="1.5"/>
            <rect x="3" y="3" width="${width}" height="8" rx="1" fill="${colour}"/>
            <path d="M21 4V10" stroke="#aaa" stroke-width="2" stroke-linecap="round"/>
            ${chargeIcon}
        </svg>`;
    };

    const settingsIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fdfdfd" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="cursor:default; transition: stroke 0.2s; display: block;" onmouseenter="this.style.stroke='var(--accent-colour)'" onmouseleave="this.style.stroke='#fdfdfd'"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`;

    const wifiSpan = document.createElement('span');
    const batterySpan = document.createElement('span');
    
    // Create the wrapper for Settings + Dropdown
    const settingsSpan = document.createElement('span');
    settingsSpan.className = 'settings-wrapper';
    
    const iconEl = document.createElement('div');
    iconEl.innerHTML = settingsIcon;
    settingsSpan.appendChild(iconEl);

    // Build the Dropdown Menu
    const dropdown = document.createElement('div');
    dropdown.className = 'settings-dropdown';
    
    // Mute Toggle Button
    const muteItem = document.createElement('div');
    muteItem.className = 'dropdown-item';
    muteItem.innerHTML = `
        <span>System Sounds</span>
        <div class="toggle-switch" id="mute-toggle"></div>
    `;
    
    // Volume Slider
    const volumeItem = document.createElement('div');
    volumeItem.className = 'volume-container';
    volumeItem.innerHTML = `
        <span style="font-size: 1rem; opacity: 0.7;">🔈</span>
        <input type="range" class="volume-slider" id="volume-slider" min="0" max="100" value="50">
        <span style="font-size: 1rem; opacity: 0.7;">🔊</span>
    `;

    muteItem.onclick = (e) => {
        e.stopPropagation();
        window.mingosMuted = !window.mingosMuted;
        const toggle = document.getElementById('mute-toggle');
        
        if (window.mingosMuted) {
            toggle.classList.add('muted');
        } else {
            toggle.classList.remove('muted');
            // Reset to 50% if unmuted while slider is at 0
            if (window.mingosVolume === 0) {
                window.mingosVolume = 0.5;
                document.getElementById('volume-slider').value = 50;
            }
            if (typeof playRandomPop === 'function') playRandomPop();
        }
    };

    // Handle Slider adjustments
    const slider = volumeItem.querySelector('#volume-slider');
    slider.oninput = (e) => {
        e.stopPropagation();
        window.mingosVolume = e.target.value / 100;
        
        if (window.mingosVolume > 0 && window.mingosMuted) {
            window.mingosMuted = false;
            document.getElementById('mute-toggle').classList.remove('muted');
        } else if (window.mingosVolume === 0 && !window.mingosMuted) {
            window.mingosMuted = true;
            document.getElementById('mute-toggle').classList.add('muted');
        }
    };
    
    slider.onchange = (e) => {
        if (!window.mingosMuted && typeof playRandomPop === 'function') playRandomPop();
    };

    // Prevent dropdown from closing when interacting with slider
    volumeItem.onclick = (e) => e.stopPropagation();

    dropdown.appendChild(muteItem);
    dropdown.appendChild(volumeItem);
    settingsSpan.appendChild(dropdown);
    
    // Ensure wrappers wrap tightly around the block SVGs
    wifiSpan.style.display = 'flex';
    batterySpan.style.display = 'flex';
    
    iconContainer.appendChild(wifiSpan);
    iconContainer.appendChild(batterySpan);
    iconContainer.appendChild(settingsSpan);
    statusDiv.appendChild(iconContainer);

    // --- Network Logic ---
    const updateNetwork = () => {
        if (!navigator.onLine) {
            wifiSpan.innerHTML = getWifiIcon(0);
            wifiSpan.title = "Offline";
            return;
        }
        
        let bars = 4;
        let title = "Connected";
        
        if (navigator.connection) {
            const type = navigator.connection.effectiveType;
            if (type === 'slow-2g') bars = 1;
            else if (type === '2g') bars = 2;
            else if (type === '3g') bars = 3;
            title = type.toUpperCase();
        }
        
        wifiSpan.innerHTML = getWifiIcon(bars);
        wifiSpan.title = title;
    };
    
    updateNetwork();
    window.addEventListener('online', updateNetwork);
    window.addEventListener('offline', updateNetwork);
    if (navigator.connection) {
        navigator.connection.addEventListener('change', updateNetwork);
    }

    // --- Battery Logic ---
    const updateBattery = (level, charging) => {
        batterySpan.innerHTML = getBatteryIcon(level, charging);
        batterySpan.title = `Battery: ${Math.round(level * 100)}% ${charging ? '(Charging)' : ''}`;
    };

    if ('getBattery' in navigator) {
        navigator.getBattery().then(battery => {
            updateBattery(battery.level, battery.charging);
            battery.addEventListener('levelchange', () => updateBattery(battery.level, battery.charging));
            battery.addEventListener('chargingchange', () => updateBattery(battery.level, battery.charging));
        });
    } else {
        updateBattery(1, false);
        batterySpan.title = "Battery: 100% (Estimate)";
    }
}

initStatusIcons();