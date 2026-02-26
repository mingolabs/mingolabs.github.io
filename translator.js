function initGallifreyanEngine() {
    const input = document.getElementById('gallifreyan-input');
    const canvas = document.getElementById('gallifreyan-canvas');
    if (!input || !canvas) return;

    const ctx = canvas.getContext('2d');

    // 1. Tokeniser: Converts English to Sherman's groupings
    function parseGallifreyan(text) {
        // Strip punctuation and apply standard rule: C becomes K
        text = text.toLowerCase().replace(/[^a-z\s]/g, '').replace(/c/g, 'k');
        
        const words = text.split(/\s+/).filter(w => w.length > 0);
        
        return words.map(word => {
            let tokens = [];
            let i = 0;
            const vowels = ['a','e','i','o','u'];
            const digraphs = ['ch','sh','th','ng','qu'];
            
            while (i < word.length) {
                let chunk = word[i];
                
                // Group Sherman's specific digraphs (e.g., 'sh', 'th')
                if (i < word.length - 1 && digraphs.includes(word.substring(i, i+2))) {
                    chunk = word.substring(i, i+2);
                    i++;
                }
                
                // Attach trailing vowels to consonants (e.g., 'he', 'lo')
                if (i < word.length - 1 && vowels.includes(word[i+1]) && !vowels.includes(chunk)) {
                    chunk += word[i+1];
                    i++;
                }
                
                tokens.push(chunk);
                i++;
            }
            return tokens;
        });
    }

    // 2. Geometry Engine: Draws the circular structures
    function drawGallifreyan() {
        // Ensure canvas resolution matches display size for crisp rendering
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const text = input.value;
        if (!text.trim()) return;

        const words = parseGallifreyan(text);
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        // The outer sentence ring scales dynamically to window size
        const sentenceRadius = Math.min(centerX, centerY) * 0.85;

        // Draw the primary sentence rings
        ctx.strokeStyle = '#f6a15a'; // MingOS Accent Colour
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, sentenceRadius, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, sentenceRadius * 0.94, 0, Math.PI * 2);
        ctx.stroke();

        if (words.length === 0) return;

        // 3. Mathematical Distribution 
        // Sherman's Rule: Start at bottom (Math.PI / 2) and read counter-clockwise
        words.forEach((wordTokens, wIndex) => {
            // Subtracting angle moves counter-clockwise on an HTML Canvas
            const wordAngle = (Math.PI / 2) - ((Math.PI * 2 / words.length) * wIndex);
            
            // Dynamic sizing based on word count
            const wordRadius = words.length === 1 ? sentenceRadius * 0.6 : (sentenceRadius / words.length) * 1.3;
            const wordDist = sentenceRadius - wordRadius - 15;
            
            const wX = centerX + Math.cos(wordAngle) * wordDist;
            const wY = centerY + Math.sin(wordAngle) * wordDist;
            
            // Draw Word Circle
            ctx.strokeStyle = '#fdfdfd';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(wX, wY, wordRadius, 0, Math.PI * 2);
            ctx.stroke();
            
            // Distribute Consonant/Vowel chunks around the word circle
            wordTokens.forEach((token, tIndex) => {
                const tokenAngle = (Math.PI / 2) - ((Math.PI * 2 / wordTokens.length) * tIndex);
                const tokenRadius = wordRadius * 0.35;
                
                // Place letter circles on the inner edge of the word ring
                const tX = wX + Math.cos(tokenAngle) * (wordRadius - tokenRadius);
                const tY = wY + Math.sin(tokenAngle) * (wordRadius - tokenRadius);
                
                ctx.beginPath();
                ctx.arc(tX, tY, tokenRadius, 0, Math.PI * 2);
                ctx.stroke();
                
                // Inject the raw token string for debugging/visual tracking
                ctx.fillStyle = '#888';
                ctx.font = '12px Fira Sans';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(token, tX, tY);
            });
        });
    }

    // Trigger redraw when typing
    input.addEventListener('input', drawGallifreyan);
    
    // Trigger redraw when MingOS window is resized
    new ResizeObserver(() => {
        // Tiny timeout ensures the CSS layout has finished transitioning before doing canvas math
        setTimeout(drawGallifreyan, 50); 
    }).observe(canvas.parentElement);
}

// Ensure the window has the resizer tools if applicable, then boot the engine
document.addEventListener("DOMContentLoaded", () => {
    const win = document.getElementById('translator-win');
    if (window.makeResizable && win) {
        window.makeResizable(win);
        const titleBar = win.querySelector('.title-bar');
        titleBar.addEventListener('mousedown', () => {
            win.addEventListener('mouseup', () => {
                // Redraw when user finishes dragging
                setTimeout(() => document.getElementById('gallifreyan-input').dispatchEvent(new Event('input')), 50);
            }, { once: true });
        });
    }
    initGallifreyanEngine();
});