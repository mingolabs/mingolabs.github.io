const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');
let shapesArray;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener('resize', () => {
    resizeCanvas();
    initShapes();
});

// Pop!_OS Cosmic Palette
const colours = [
    'rgba(246, 161, 90, 0.7)',  // Orange
    'rgba(72, 185, 199, 0.6)',  // Cyan/Teal
    'rgba(233, 84, 32, 0.6)',   // Deep Orange
    'rgba(123, 123, 180, 0.6)', // Muted Purple
    'rgba(244, 205, 117, 0.5)'  // Warm Yellow
];

class FluidShape {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.radiusX = Math.random() * 400 + 200; // Large, stretched dimensions
        this.radiusY = Math.random() * 400 + 200;
        this.vx = (Math.random() - 0.5) * 1.5;
        this.vy = (Math.random() - 0.5) * 1.5;
        this.colour = colours[Math.floor(Math.random() * colours.length)];
        this.angle = Math.random() * Math.PI * 2;
        this.vAngle = (Math.random() - 0.5) * 0.01;
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.angle += this.vAngle;
        
        // Overshoot bounds slightly to prevent hard clipping on the blurred edges
        if (this.x < -500 || this.x > canvas.width + 500) this.vx *= -1;
        if (this.y < -500 || this.y > canvas.height + 500) this.vy *= -1;
    }
    
    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.beginPath();
        // Drawing solid ellipses. The CSS blur filter on the canvas transforms these into fluid gradients.
        ctx.ellipse(0, 0, this.radiusX, this.radiusY, 0, 0, Math.PI * 2);
        ctx.fillStyle = this.colour;
        ctx.fill();
        ctx.restore();
    }
}

function initShapes() {
    shapesArray = [];
    let numberOfShapes = Math.floor((canvas.width * canvas.height) / 80000); 
    // Constrain count to ensure performance while maintaining fluid density
    if (numberOfShapes < 4) numberOfShapes = 4;
    if (numberOfShapes > 12) numberOfShapes = 12;
    
    for (let i = 0; i < numberOfShapes; i++) {
        shapesArray.push(new FluidShape());
    }
}

function animateBackground() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Use screen composition so intersecting colours brighten dynamically
    ctx.globalCompositeOperation = 'screen';
    
    for (let i = 0; i < shapesArray.length; i++) {
        shapesArray[i].update();
        shapesArray[i].draw();
    }
    
    requestAnimationFrame(animateBackground);
}

resizeCanvas();
initShapes();
animateBackground();