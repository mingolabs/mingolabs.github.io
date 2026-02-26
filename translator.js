const GALLIFREYAN_DICT = {
    'b': { stem: 'B', lines: 0, dots: 0 },
    'ch': { stem: 'J', lines: 0, dots: 2 },
    'd': { stem: 'B', lines: 0, dots: 3 },
    'f': { stem: 'B', lines: 3, dots: 0 },
    'g': { stem: 'B', lines: 1, dots: 0 },
    'h': { stem: 'B', lines: 2, dots: 0 },
    'j': { stem: 'J', lines: 0, dots: 0 },
    'k': { stem: 'J', lines: 0, dots: 2 },
    'l': { stem: 'J', lines: 0, dots: 3 },
    'm': { stem: 'J', lines: 3, dots: 0 },
    'n': { stem: 'J', lines: 1, dots: 0 },
    'p': { stem: 'J', lines: 2, dots: 0 },
    't': { stem: 'T', lines: 0, dots: 0 },
    'sh': { stem: 'T', lines: 0, dots: 2 },
    'r': { stem: 'T', lines: 0, dots: 3 },
    's': { stem: 'T', lines: 3, dots: 0 },
    'v': { stem: 'T', lines: 1, dots: 0 },
    'w': { stem: 'T', lines: 2, dots: 0 },
    'th': { stem: 'TH', lines: 0, dots: 0 },
    'y': { stem: 'TH', lines: 0, dots: 2 },
    'z': { stem: 'TH', lines: 0, dots: 3 },
    'qu': { stem: 'TH', lines: 3, dots: 0 },
    'x': { stem: 'TH', lines: 1, dots: 0 },
    'ng': { stem: 'TH', lines: 2, dots: 0 }
};

const VOWELS = ['a', 'e', 'i', 'o', 'u'];

function initGallifreyanEngine() {
    const input = document.getElementById('gallifreyan-input');
    const canvas = document.getElementById('gallifreyan-canvas');
    if (!input || !canvas) return;

    const ctx = canvas.getContext('2d');

    function parseGallifreyan(text) {
        text = text.toLowerCase().replace(/[^a-z\s]/g, '').replace(/c/g, 'k');
        const words = text.split(/\s+/).filter(w => w.length > 0);
        
        return words.map(word => {
            let tokens = [];
            let i = 0;
            
            while (i < word.length) {
                let chunk = word[i];
                let isDigraph = false;
                
                if (i < word.length - 1) {
                    const possibleDigraph = word.substring(i, i + 2);
                    if (GALLIFREYAN_DICT[possibleDigraph]) {
                        chunk = possibleDigraph;
                        isDigraph = true;
                        i++;
                    }
                }
                
                let tokenObj = { type: VOWELS.includes(chunk) ? 'vowel' : 'consonant', char: chunk, attachedVowels: [] };
                
                while (i + 1 < word.length && VOWELS.includes(word[i + 1])) {
                    tokenObj.attachedVowels.push(word[i + 1]);
                    i++;
                }
                
                tokens.push(tokenObj);
                i++;
            }
            return tokens;
        });
    }

    function drawGallifreyan() {
        canvas.width = canvas.parentElement.clientWidth * window.devicePixelRatio;
        canvas.height = canvas.parentElement.clientHeight * window.devicePixelRatio;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        
        const displayWidth = canvas.parentElement.clientWidth;
        const displayHeight = canvas.parentElement.clientHeight;
        
        ctx.clearRect(0, 0, displayWidth, displayHeight);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        const text = input.value;
        if (!text.trim()) return;

        const words = parseGallifreyan(text);
        const centreX = displayWidth / 2;
        const centreY = displayHeight / 2;
        const sentenceRadius = Math.min(centreX, centreY) * 0.85;

        // Draw Sentence Rings
        ctx.strokeStyle = '#f6a15a';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(centreX, centreY, sentenceRadius, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(centreX, centreY, sentenceRadius * 0.94, 0, Math.PI * 2);
        ctx.stroke();
        
        // Inner aesthetic ring
        ctx.strokeStyle = 'rgba(246, 161, 90, 0.3)';
        ctx.beginPath();
        ctx.arc(centreX, centreY, sentenceRadius * 0.90, 0, Math.PI * 2);
        ctx.stroke();

        if (words.length === 0) return;

        ctx.strokeStyle = '#fdfdfd';
        ctx.fillStyle = '#fdfdfd';

        words.forEach((wordTokens, wIndex) => {
            const wordAngle = (Math.PI / 2) - ((Math.PI * 2 / words.length) * wIndex);
            const wordRadius = words.length === 1 ? sentenceRadius * 0.5 : (sentenceRadius / words.length) * 1.2;
            const wordDist = sentenceRadius * 0.94 - wordRadius;
            
            const wX = centreX + Math.cos(wordAngle) * wordDist;
            const wY = centreY + Math.sin(wordAngle) * wordDist;
            
            // Mask out intersecting stems
            ctx.globalCompositeOperation = 'destination-out';
            ctx.lineWidth = 3;
            wordTokens.forEach((token, tIndex) => {
                if (token.type !== 'consonant') return;
                const tokenAngle = (Math.PI / 2) - ((Math.PI * 2 / wordTokens.length) * tIndex);
                const stemData = GALLIFREYAN_DICT[token.char];
                const tokenRadius = wordRadius * 0.35;
                
                let tX = wX + Math.cos(tokenAngle) * (wordRadius - tokenRadius);
                let tY = wY + Math.sin(tokenAngle) * (wordRadius - tokenRadius);
                
                if (stemData.stem === 'B') {
                    tX = wX + Math.cos(tokenAngle) * wordRadius;
                    tY = wY + Math.sin(tokenAngle) * wordRadius;
                    ctx.beginPath();
                    ctx.arc(tX, tY, tokenRadius, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.stroke();
                } else if (stemData.stem === 'T') {
                    tX = wX + Math.cos(tokenAngle) * wordRadius;
                    tY = wY + Math.sin(tokenAngle) * wordRadius;
                    ctx.beginPath();
                    ctx.arc(tX, tY, tokenRadius * 0.8, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.stroke();
                }
            });
            
            // Draw Main Word Circle
            ctx.globalCompositeOperation = 'source-over';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(wX, wY, wordRadius, 0, Math.PI * 2);
            ctx.stroke();

            // Draw Letters
            wordTokens.forEach((token, tIndex) => {
                const tokenAngle = (Math.PI / 2) - ((Math.PI * 2 / wordTokens.length) * tIndex);
                let tX, tY;
                let tokenRadius = wordRadius * 0.35;

                if (token.type === 'consonant') {
                    const stemData = GALLIFREYAN_DICT[token.char];
                    
                    if (stemData.stem === 'B') {
                        tX = wX + Math.cos(tokenAngle) * wordRadius;
                        tY = wY + Math.sin(tokenAngle) * wordRadius;
                    } else if (stemData.stem === 'J') {
                        tX = wX + Math.cos(tokenAngle) * (wordRadius - tokenRadius - 5);
                        tY = wY + Math.sin(tokenAngle) * (wordRadius - tokenRadius - 5);
                    } else if (stemData.stem === 'T') {
                        tX = wX + Math.cos(tokenAngle) * wordRadius;
                        tY = wY + Math.sin(tokenAngle) * wordRadius;
                        tokenRadius = tokenRadius * 0.8; 
                    } else if (stemData.stem === 'TH') {
                        tX = wX + Math.cos(tokenAngle) * wordRadius;
                        tY = wY + Math.sin(tokenAngle) * wordRadius;
                    }

                    ctx.beginPath();
                    ctx.arc(tX, tY, tokenRadius, 0, Math.PI * 2);
                    ctx.stroke();

                    // Draw Dots
                    if (stemData.dots > 0) {
                        for (let d = 0; d < stemData.dots; d++) {
                            const dotAngle = tokenAngle + (Math.PI * 2 / stemData.dots) * d;
                            const dotX = tX + Math.cos(dotAngle) * (tokenRadius * 0.6);
                            const dotY = tY + Math.sin(dotAngle) * (tokenRadius * 0.6);
                            ctx.beginPath();
                            ctx.arc(dotX, dotY, 4, 0, Math.PI * 2);
                            ctx.fill();
                        }
                    }

                    // Draw Lines (simplified straight lines radiating outwards)
                    if (stemData.lines > 0) {
                        for (let l = 0; l < stemData.lines; l++) {
                            const lineAngle = tokenAngle + (Math.PI / stemData.lines) * l + 0.5;
                            ctx.beginPath();
                            ctx.moveTo(tX + Math.cos(lineAngle) * tokenRadius, tY + Math.sin(lineAngle) * tokenRadius);
                            ctx.lineTo(tX + Math.cos(lineAngle) * (tokenRadius + 20), tY + Math.sin(lineAngle) * (tokenRadius + 20));
                            ctx.stroke();
                        }
                    }

                    // Draw Attached Vowels
                    token.attachedVowels.forEach((vowel, vIndex) => {
                        const vRadius = wordRadius * 0.1;
                        let vX = tX;
                        let vY = tY;

                        if (vowel === 'a') {
                            vX = tX + Math.cos(tokenAngle) * (tokenRadius + vRadius + 5);
                            vY = tY + Math.sin(tokenAngle) * (tokenRadius + vRadius + 5);
                        } else if (vowel === 'e') {
                            vX = tX;
                            vY = tY;
                        } else if (vowel === 'i') {
                            vX = tX;
                            vY = tY;
                            ctx.beginPath();
                            ctx.moveTo(vX, vY);
                            ctx.lineTo(vX - Math.cos(tokenAngle) * 15, vY - Math.sin(tokenAngle) * 15);
                            ctx.stroke();
                        } else if (vowel === 'o') {
                            vX = tX + Math.cos(tokenAngle + Math.PI) * tokenRadius;
                            vY = tY + Math.sin(tokenAngle + Math.PI) * tokenRadius;
                        } else if (vowel === 'u') {
                            vX = tX;
                            vY = tY;
                            ctx.beginPath();
                            ctx.moveTo(vX, vY);
                            ctx.lineTo(vX + Math.cos(tokenAngle) * 15, vY + Math.sin(tokenAngle) * 15);
                            ctx.stroke();
                        }
                        
                        ctx.beginPath();
                        ctx.arc(vX, vY, vRadius, 0, Math.PI * 2);
                        ctx.stroke();
                    });

                } else if (token.type === 'vowel') {
                    // Standalone Vowel
                    const vRadius = wordRadius * 0.15;
                    tX = wX + Math.cos(tokenAngle) * (wordRadius - vRadius - 5);
                    tY = wY + Math.sin(tokenAngle) * (wordRadius - vRadius - 5);

                    if (token.char === 'a') {
                        tX = wX + Math.cos(tokenAngle) * (wordRadius + vRadius + 5);
                        tY = wY + Math.sin(tokenAngle) * (wordRadius + vRadius + 5);
                    } else if (token.char === 'o') {
                        tX = wX + Math.cos(tokenAngle) * wordRadius;
                        tY = wY + Math.sin(tokenAngle) * wordRadius;
                    }

                    ctx.beginPath();
                    ctx.arc(tX, tY, vRadius, 0, Math.PI * 2);
                    ctx.stroke();

                    if (token.char === 'i') {
                        ctx.beginPath();
                        ctx.moveTo(tX, tY);
                        ctx.lineTo(tX - Math.cos(tokenAngle) * 15, tY - Math.sin(tokenAngle) * 15);
                        ctx.stroke();
                    } else if (token.char === 'u') {
                        ctx.beginPath();
                        ctx.moveTo(tX, tY);
                        ctx.lineTo(tX + Math.cos(tokenAngle) * 15, tY + Math.sin(tokenAngle) * 15);
                        ctx.stroke();
                    }
                }
            });
        });
    }

    input.addEventListener('input', drawGallifreyan);
    
    new ResizeObserver(() => {
        setTimeout(drawGallifreyan, 50); 
    }).observe(canvas.parentElement);
}

document.addEventListener("DOMContentLoaded", () => {
    const win = document.getElementById('translator-win');
    if (window.makeResizable && win) {
        window.makeResizable(win);
        const titleBar = win.querySelector('.title-bar');
        titleBar.addEventListener('mousedown', () => {
            win.addEventListener('mouseup', () => {
                setTimeout(() => document.getElementById('gallifreyan-input').dispatchEvent(new Event('input')), 50);
            }, { once: true });
        });
    }
    initGallifreyanEngine();
});