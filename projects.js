async function initProjects() {
    // 1. Inject CSS for the dynamic project cards and viewer
    const style = document.createElement('style');
    style.textContent = `
        .project-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 1rem;
        }
        .os-project-card {
            display: flex;
            background: rgba(0, 0, 0, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.05);
            border-radius: 8px;
            padding: 1rem;
            cursor: pointer;
            transition: border-color 0.2s, background 0.2s, transform 0.2s;
            gap: 1.2rem;
            align-items: center;
        }
        .os-project-card:hover {
            border-color: var(--accent-colour);
            background: rgba(255, 255, 255, 0.05);
            transform: translateY(-2px);
        }
        .os-project-img-container {
            width: 140px;
            height: 90px;
            border-radius: 6px;
            overflow: hidden;
            flex-shrink: 0;
            background: #111;
        }
        .os-project-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: opacity 0.2s;
        }
        .os-project-info {
            flex-grow: 1;
            display: flex;
            flex-direction: column;
            gap: 0.4rem;
        }
        .os-project-title {
            margin: 0;
            font-size: 1.2rem;
            color: var(--accent-colour);
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        .os-project-summary {
            margin: 0;
            font-size: 0.9rem;
            color: #ccc;
            line-height: 1.4;
        }
        .os-project-meta {
            font-size: 0.8rem;
            color: #888;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .pinned-badge {
            background: var(--accent-colour);
            color: #000;
            font-size: 0.65rem;
            padding: 0.1rem 0.4rem;
            border-radius: 4px;
            font-weight: bold;
            text-transform: uppercase;
        }
    `;
    document.head.appendChild(style);

    try {
        // 2. Fetch the JSON database
        const res = await fetch('projects.json');
        if (!res.ok) throw new Error('Could not load projects.json');
        const projects = await res.json();

        // 3. Sort: Pinned first, then by date (newest to oldest)
        projects.sort((a, b) => {
            if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
            return new Date(b.date) - new Date(a.date);
        });

        // 4. Clear the hardcoded content in the target windows
        const roboticsWin = document.querySelector('#robotics-win .window-content');
        const softwareWin = document.querySelector('#software-win .window-content');
        if (roboticsWin) roboticsWin.innerHTML = '<div class="project-grid" id="grid-robotics"></div>';
        if (softwareWin) softwareWin.innerHTML = '<div class="project-grid" id="grid-software"></div>';

        // 5. Generate and inject cards
        projects.forEach(proj => {
            const gridId = `grid-${proj.category}`;
            const grid = document.getElementById(gridId);
            if (!grid) return; // Skip if category window doesn't exist

            // Format the date to UK standard (e.g., 15 Nov 2025)
            const dateObj = new Date(proj.date);
            const formattedDate = dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

            const pinnedHTML = proj.pinned ? `<span class="pinned-badge">📌 Pinned</span>` : '';
            const initialImg = proj.hoverImages && proj.hoverImages.length > 0 ? proj.hoverImages[0] : '';

            const card = document.createElement('div');
            card.className = 'os-project-card';
            card.innerHTML = `
                <div class="os-project-img-container">
                    <img src="${initialImg}" alt="${proj.title}" class="os-project-img" id="img-${proj.id}">
                </div>
                <div class="os-project-info">
                    <h4 class="os-project-title">${proj.title} ${pinnedHTML}</h4>
                    <p class="os-project-meta">${formattedDate}</p>
                    <p class="os-project-summary">${proj.summary}</p>
                </div>
            `;

            // Hover Slideshow Logic
            if (proj.hoverImages && proj.hoverImages.length > 1) {
                let interval;
                let imgIndex = 0;
                const imgElement = card.querySelector(`#img-${proj.id}`);

                card.onmouseenter = () => {
                    if (typeof playRandomPop === 'function') playRandomPop();
                    interval = setInterval(() => {
                        imgIndex = (imgIndex + 1) % proj.hoverImages.length;
                        imgElement.src = proj.hoverImages[imgIndex];
                    }, 600); // Cycles every 0.6 seconds
                };

                card.onmouseleave = () => {
                    clearInterval(interval);
                    imgIndex = 0;
                    imgElement.src = proj.hoverImages[0];
                };
            } else {
                card.onmouseenter = () => { if (typeof playRandomPop === 'function') playRandomPop(); };
            }

            // Click to open project
            card.onclick = () => openProjectViewer(proj);
            grid.appendChild(card);
        });

    } catch (error) {
        console.error("Failed to load projects:", error);
    }
}

// 6. Dynamic Project Viewer Window Logic
async function openProjectViewer(proj) {
    const desktop = document.getElementById('desktop-ui');
    
    // Check if the viewer is already open, if so, close it to refresh
    const existingWin = document.getElementById('project-viewer-win');
    if (existingWin) existingWin.remove();

    // Create the dynamic window
    const winHTML = `
        <div id="project-viewer-win" class="window active active-focus" style="top: 10%; left: 30%; width: 680px; z-index: 999;">
            <div class="title-bar" id="viewer-title-bar">
                <span class="window-title">${proj.title}</span>
                <button onclick="document.getElementById('project-viewer-win').remove()" class="close-btn"></button>
            </div>
            <div class="window-content" id="viewer-content">
                <p class="loading-text">Fetching file from system directory...</p>
            </div>
        </div>
    `;
    desktop.insertAdjacentHTML('beforeend', winHTML);

    // Apply drag-and-drop and focus mechanics
    const win = document.getElementById('project-viewer-win');
    const titleBar = document.getElementById('viewer-title-bar');
    
    if (typeof zIndexCounter !== 'undefined') {
        zIndexCounter++;
        win.style.zIndex = zIndexCounter;
    }

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

    // 7. Fetch the actual content file
    try {
        const fileRes = await fetch(proj.contentFile);
        if (!fileRes.ok) throw new Error('File not found');
        
        let textData = await fileRes.text();
        const viewerContent = document.getElementById('viewer-content');

        // If it's a markdown file, parse it using the marked.js library you already have
        if (proj.contentFile.endsWith('.md')) {
            viewerContent.innerHTML = marked.parse(textData);
        } else {
            // Otherwise, inject the raw HTML
            viewerContent.innerHTML = textData;
        }
    } catch (error) {
        document.getElementById('viewer-content').innerHTML = `
            <p class="error-text">System Error: Could not load ${proj.contentFile}.</p>
            <p style="color: #aaa;">Ensure the folder structure matches your projects.json map exactly.</p>
        `;
    }
}

// Initialise on load
initProjects();