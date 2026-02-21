function initStatusIcons() {
    const statusDiv = document.querySelector('.top-bar div:last-child');
    
    // Force perfect vertical alignment and uniform spacing on the parent container
    statusDiv.style.display = 'flex';
    statusDiv.style.alignItems = 'center';
    statusDiv.style.gap = '16px'; 

    // Clean up the old hardcoded text emojis
    statusDiv.childNodes.forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) {
            node.nodeValue = node.nodeValue.replace(/⚙️|🔋|📶/g, '').trim(); 
        }
    });

    // Fix the weather widget's internal alignment and remove its conflicting margin
    const weatherSpan = statusDiv.querySelector('span');
    if (weatherSpan) {
        weatherSpan.style.marginRight = '0';
        weatherSpan.style.display = 'flex';
        weatherSpan.style.alignItems = 'center';
        weatherSpan.style.gap = '6px';
    }

    // Create a flex container for the new SVG icons
    const iconContainer = document.createElement('span');
    iconContainer.style.display = 'flex';
    iconContainer.style.alignItems = 'center';
    iconContainer.style.gap = '16px';

    // SVG Generators (added display: block to remove descender gaps)
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

    const settingsIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fdfdfd" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="cursor:pointer; transition: stroke 0.2s; display: block;" onmouseenter="this.style.stroke='var(--accent-colour)'" onmouseleave="this.style.stroke='#fdfdfd'"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`;

    const wifiSpan = document.createElement('span');
    const batterySpan = document.createElement('span');
    const settingsSpan = document.createElement('span');
    
    // Ensure wrappers wrap tightly around the block SVGs
    wifiSpan.style.display = 'flex';
    batterySpan.style.display = 'flex';
    settingsSpan.style.display = 'flex';

    settingsSpan.innerHTML = settingsIcon;
    
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