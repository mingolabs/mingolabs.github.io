const fluidCanvas = document.getElementById('bg-fluid');
const fluidCtx = fluidCanvas.getContext('2d');
const particleCanvas = document.getElementById('bg-particles');
const particleCtx = particleCanvas.getContext('2d');

let fluidShapesArray;
let particlesArray;

function resizeCanvases() {
    fluidCanvas.width = window.innerWidth;
    fluidCanvas.height = window.innerHeight;
    particleCanvas.width = window.innerWidth;
    particleCanvas.height = window.innerHeight;
}

window.addEventListener('resize', () => {
    resizeCanvases();
    initShapes();
    initParticles();
});

const fluidColours = [
    'rgba(246, 161, 90, 0.7)',
    'rgba(72, 185, 199, 0.6)',
    'rgba(233, 84, 32, 0.6)',
    'rgba(123, 123, 180, 0.6)',
    'rgba(244, 205, 117, 0.5)'
];

class FluidShape {
    constructor() {
        this.x = Math.random() * fluidCanvas.width;
        this.y = Math.random() * fluidCanvas.height;
        this.radiusX = Math.random() * 400 + 200;
        this.radiusY = Math.random() * 400 + 200;
        this.vx = (Math.random() - 0.5) * 1.5;
        this.vy = (Math.random() - 0.5) * 1.5;
        this.colour = fluidColours[Math.floor(Math.random() * fluidColours.length)];
        this.angle = Math.random() * Math.PI * 2;
        this.vAngle = (Math.random() - 0.5) * 0.01;
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.angle += this.vAngle;
        if (this.x < -500 || this.x > fluidCanvas.width + 500) this.vx *= -1;
        if (this.y < -500 || this.y > fluidCanvas.height + 500) this.vy *= -1;
    }
    
    draw() {
        fluidCtx.save();
        fluidCtx.translate(this.x, this.y);
        fluidCtx.rotate(this.angle);
        fluidCtx.beginPath();
        fluidCtx.ellipse(0, 0, this.radiusX, this.radiusY, 0, 0, Math.PI * 2);
        fluidCtx.fillStyle = this.colour;
        fluidCtx.fill();
        fluidCtx.restore();
    }
}

class Particle {
    constructor() {
        this.x = Math.random() * particleCanvas.width;
        this.y = Math.random() * particleCanvas.height;
        this.size = Math.random() * 3 + 1.5;
        this.speedX = (Math.random() * 1) - 0.5;
        this.speedY = (Math.random() * 1) - 0.5;
    }
    
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x < 0 || this.x > particleCanvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > particleCanvas.height) this.speedY *= -1;
    }
    
    draw() {
        particleCtx.fillStyle = 'rgba(246, 161, 90, 0.9)';
        particleCtx.beginPath();
        particleCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        particleCtx.fill();
    }
}

function initShapes() {
    fluidShapesArray = [];
    let numberOfShapes = Math.floor((fluidCanvas.width * fluidCanvas.height) / 50000); 
    if (numberOfShapes < 4) numberOfShapes = 4;
    if (numberOfShapes > 12) numberOfShapes = 12;
    
    for (let i = 0; i < numberOfShapes; i++) {
        fluidShapesArray.push(new FluidShape());
    }
}

function initParticles() {
    particlesArray = [];
    let numberOfParticles = (particleCanvas.width * particleCanvas.height) / 9000;
    for (let i = 0; i < numberOfParticles; i++) {
        particlesArray.push(new Particle());
    }
}

function animateBackground() {
    fluidCtx.clearRect(0, 0, fluidCanvas.width, fluidCanvas.height);
    fluidCtx.globalCompositeOperation = 'screen';
    
    for (let i = 0; i < fluidShapesArray.length; i++) {
        fluidShapesArray[i].update();
        fluidShapesArray[i].draw();
    }
    
    particleCtx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
    
    for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
        particlesArray[i].draw();
        
        for (let j = i; j < particlesArray.length; j++) {
            const dx = particlesArray[i].x - particlesArray[j].x;
            const dy = particlesArray[i].y - particlesArray[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 150) {
                particleCtx.beginPath();
                particleCtx.strokeStyle = `rgba(255, 255, 255, ${1 - distance/150})`;
                particleCtx.lineWidth = 0.6;
                particleCtx.moveTo(particlesArray[i].x, particlesArray[i].y);
                particleCtx.lineTo(particlesArray[j].x, particlesArray[j].y);
                particleCtx.stroke();
            }
        }
    }
    
    requestAnimationFrame(animateBackground);
}

resizeCanvases();
initShapes();
initParticles();
animateBackground();