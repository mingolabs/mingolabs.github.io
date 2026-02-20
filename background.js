const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');
let particlesArray;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener('resize', function() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initParticles();
});

// Pop!_OS inspired palette
const colours = [
    { r: 246, g: 161, b: 90 },   // Orange
    { r: 72,  g: 185, b: 199 }   // Cyan
];

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 80 + 40; 
        this.speedX = (Math.random() * 1.5) - 0.75;
        this.speedY = (Math.random() * 1.5) - 0.75;
        this.baseColour = colours[Math.floor(Math.random() * colours.length)];
    }
    
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x < 0 - this.size || this.x > canvas.width + this.size) this.speedX *= -1;
        if (this.y < 0 - this.size || this.y > canvas.height + this.size) this.speedY *= -1;
    }
    
    draw() {
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
        gradient.addColorStop(0, `rgba(${this.baseColour.r}, ${this.baseColour.g}, ${this.baseColour.b}, 0.6)`);
        gradient.addColorStop(1, `rgba(${this.baseColour.r}, ${this.baseColour.g}, ${this.baseColour.b}, 0)`);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function initParticles() {
    particlesArray = [];
    let numberOfParticles = (canvas.width * canvas.height) / 15000; 
    for (let i = 0; i < numberOfParticles; i++) {
        particlesArray.push(new Particle());
    }
}

function animateParticles() {
    ctx.fillStyle = '#2b2a29'; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.globalCompositeOperation = 'screen'; 
    
    for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
        particlesArray[i].draw();
    }
    
    ctx.globalCompositeOperation = 'source-over';
    
    requestAnimationFrame(animateParticles);
}

initParticles();
animateParticles();