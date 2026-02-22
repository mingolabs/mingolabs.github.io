window.portfolioData = {
    robotics: [],
    software: []
};
window.portfolioPages = {
    robotics: 1,
    software: 1
};
const ITEMS_PER_PAGE = 5;

async function initProjects() {
    const style = document.createElement('style');
    style.textContent = `
        .project-grid { display: grid; grid-template-columns: 1fr; gap: 1rem; }
        .os-project-card { display: flex; background: rgba(0, 0, 0, 0.2); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 8px; padding: 1rem; cursor: pointer; transition: border-color 0.2s, background 0.2s, transform 0.2s; gap: 1.2rem; align-items: center; }
        .os-project-card:hover { border-color: var(--accent-colour); background: rgba(255, 255, 255, 0.05); transform: translateY(-2px); }
        .os-project-img-container { position: relative; width: 140px; height: 90px; border-radius: 6px; overflow: hidden; flex-shrink: 0; background: #111; }
        .os-project-img { position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; object-position: center; transition: opacity 0.6s ease-in-out; }
        .os-project-info { flex-grow: 1; display: flex; flex-direction: column; gap: 0.4rem; }
        .os-project-title { margin: 0; font-size: 1.2rem; color: var(--accent-colour); display: flex; align-items: center; gap: 0.5rem; }
        .os-project-summary { margin: 0; font-size: 0.9rem; color: #ccc; line-height: 1.4; }
        .os-project-meta { font-size: 0.8rem; color: #888; text-transform: uppercase; letter-spacing: 0.5px; }
        .pinned-badge { background: var(--accent-colour); color: #000; font-size: 0.65rem; padding: 0.1rem 0.4rem; border-radius: 4px; font-weight: bold; text-transform: uppercase; }
        .pagination-bar { display: flex; justify-content: space-between; align-items: center; margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid rgba(255, 255, 255, 0.1); font-size: 0.9rem; color: #aaa; }
        .page-btn { background: #383838; border: 1px solid #555; color: #fff; padding: 0.4rem 1rem; border-radius: 4px; cursor: pointer; transition: background 0.2s; font-family: inherit; }
        .page-btn:hover:not(:disabled) { background: var(--accent-colour); color: #000; border-color: var(--accent-colour); }
        .page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
    `;
    document.head.appendChild(style);

    try {
        const res = await fetch('projects.json');
        if (!res.ok) throw new Error('Could not load projects.json');
        const projects = await res.json();

        projects.sort((a, b) => {
            if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
            return new Date(b.date) - new Date(a.date);
        });

        projects.forEach(proj => {
            if (proj.category === 'robotics') window.portfolioData.robotics.push(proj);
            if (proj.category === 'software') window.portfolioData.software.push(proj);
        });

        const roboticsWin = document.querySelector('#robotics-win .window-content');
        const softwareWin = document.querySelector('#software-win .window-content');
        if (roboticsWin) roboticsWin.innerHTML = '<div id="container-robotics"></div>';
        if (softwareWin) softwareWin.innerHTML = '<div id="container-software"></div>';

        renderCategory('robotics');
        renderCategory('software');

    } catch (error) {
        console.error("Failed to load projects:", error);
    }
}

function renderCategory(category) {
    const container = document.getElementById(`container-${category}`);
    if (!container) return;

    const allProjects = window.portfolioData[category];
    const currentPage = window.portfolioPages[category];
    const totalPages = Math.ceil(allProjects.length / ITEMS_PER_PAGE) || 1;
    
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const visibleProjects = allProjects.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    let html = `<div class="project-grid">`;

    visibleProjects.forEach(proj => {
        const dateObj = new Date(proj.date);
        const formattedDate = dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
        const pinnedHTML = proj.pinned ? `<span class="pinned-badge">📌 Pinned</span>` : '';
        
        // Pre-load all images for the crossfade
        let imagesHTML = '';
        if (proj.hoverImages && proj.hoverImages.length > 0) {
            proj.hoverImages.forEach((src, idx) => {
                imagesHTML += `<img src="${src}" alt="" class="os-project-img hover-img" style="opacity: ${idx === 0 ? '1' : '0'}; z-index: ${proj.hoverImages.length - idx};">`;
            });
        }

        html += `
            <div class="os-project-card" data-id="${proj.id}">
                <div class="os-project-img-container">
                    ${imagesHTML}
                </div>
                <div class="os-project-info">
                    <h4 class="os-project-title">${proj.title} ${pinnedHTML}</h4>
                    <p class="os-project-meta">${formattedDate}</p>
                    <p class="os-project-summary">${proj.summary}</p>
                </div>
            </div>
        `;
    });

    html += `</div>`;

    if (totalPages > 1) {
        html += `
            <div class="pagination-bar">
                <button class="page-btn" onclick="changePage('${category}', -1)" ${currentPage === 1 ? 'disabled' : ''}>Previous</button>
                <span>Page ${currentPage} of ${totalPages}</span>
                <button class="page-btn" onclick="changePage('${category}', 1)" ${currentPage === totalPages ? 'disabled' : ''}>Next</button>
            </div>
        `;
    }

    container.innerHTML = html;

    // Attach Javascript Event Listeners after rendering
    visibleProjects.forEach(proj => {
        const card = container.querySelector(`.os-project-card[data-id="${proj.id}"]`);
        
        // Smooth Hover Crossfade Logic
        if (proj.hoverImages && proj.hoverImages.length > 1) {
            let interval;
            let currentIndex = 0;
            const images = card.querySelectorAll('.hover-img');

            card.onmouseenter = () => {
                if (typeof playRandomPop === 'function') playRandomPop();
                interval = setInterval(() => {
                    images[currentIndex].style.opacity = '0'; // Fade out current
                    currentIndex = (currentIndex + 1) % images.length;
                    images[currentIndex].style.opacity = '1'; // Fade in next
                }, 1500); 
            };

            card.onmouseleave = () => {
                clearInterval(interval);
                images.forEach(img => img.style.opacity = '0');
                currentIndex = 0;
                images[0].style.opacity = '1'; // Snap back to first image
            };
        } else {
            card.onmouseenter = () => { if (typeof playRandomPop === 'function') playRandomPop(); };
        }

        card.onclick = () => openProjectViewer(proj);
    });
}

window.changePage = function(category, direction) {
    if (typeof playRandomPop === 'function') playRandomPop();
    window.portfolioPages[category] += direction;
    renderCategory(category);
    
    const winContent = document.querySelector(`#${category}-win .window-content`);
    if (winContent) winContent.scrollTop = 0;
};

async function openProjectViewer(proj) {
    const desktop = document.getElementById('desktop-ui');
    
    const existingWin = document.getElementById('project-viewer-win');
    if (existingWin) existingWin.remove();

    const winHTML = `
        <div id="project-viewer-win" class="window active active-focus" style="top: 10%; left: 30%; width: 680px; max-height: 80vh; z-index: 999;">
            <div class="title-bar" id="viewer-title-bar">
                <span class="window-title">${proj.title}</span>
                <div class="window-controls">
                    <button onclick="minimiseWindow('project-viewer-win')" class="win-btn min-btn"></button>
                    <button onclick="maximiseWindow('project-viewer-win')" class="win-btn max-btn"></button>
                    <button onclick="document.getElementById('project-viewer-win').remove()" class="win-btn close-btn"></button>
                </div>
            </div>
            <div class="window-content" id="viewer-content" style="flex-grow: 1; height: 100%;">
                <p class="loading-text">Fetching file from system directory...</p>
            </div>
        </div>
    `;
    desktop.insertAdjacentHTML('beforeend', winHTML);

    const win = document.getElementById('project-viewer-win');
    
    // Attach Global Resizer
    if (window.makeResizable) window.makeResizable(win);
    
    if (typeof zIndexCounter !== 'undefined') {
        zIndexCounter++;
        win.style.zIndex = zIndexCounter;
    }

    win.addEventListener('mousedown', () => focusWindow(win));

    // Refined Dragging Logic
    const titleBar = document.getElementById('viewer-title-bar');
    let isDragging = false, offsetX, offsetY;
    
    titleBar.addEventListener('mousedown', (e) => {
        if (e.target.classList.contains('win-btn')) return;
        isDragging = true;
        win.classList.add('dragging');
        offsetX = e.clientX - win.getBoundingClientRect().left;
        offsetY = e.clientY - win.getBoundingClientRect().top;
        focusWindow(win);
    });
    
    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        if (win.classList.contains('maximised')) return;
        win.style.left = (e.clientX - offsetX) + 'px';
        win.style.top = (e.clientY - offsetY) + 'px';
    });
    
    document.addEventListener('mouseup', () => { 
        isDragging = false; 
        win.classList.remove('dragging');
    });
    
    titleBar.addEventListener('dblclick', (e) => {
        if (!e.target.classList.contains('win-btn')) {
            maximiseWindow(win.id);
        }
    });

    // Content Loading
    try {
        const fileRes = await fetch(proj.contentFile);
        if (!fileRes.ok) throw new Error('File not found');
        
        let textData = await fileRes.text();
        const viewerContent = document.getElementById('viewer-content');

        if (proj.contentFile.endsWith('.md')) {
            viewerContent.innerHTML = marked.parse(textData);
        } else {
            viewerContent.innerHTML = textData;
        }
    } catch (error) {
        document.getElementById('viewer-content').innerHTML = `
            <p class="error-text">System Error: Could not load ${proj.contentFile}.</p>
            <p style="color: #aaa;">Ensure the folder structure matches your projects.json map exactly.</p>
        `;
    }
}

initProjects();