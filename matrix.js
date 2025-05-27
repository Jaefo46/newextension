// Matrix Rain Animation
const canvas = document.getElementById('matrix-canvas');
const ctx = canvas.getContext('2d');

// Set canvas dimensions
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// Initialize canvas size
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Matrix rain settings
const fontSize = 14;
const columns = Math.floor(canvas.width / fontSize) + 1;
const drops = [];

// Initialize drops
for (let i = 0; i < columns; i++) {
    drops[i] = Math.floor(Math.random() * canvas.height / fontSize);
}

// Matrix characters
const matrixChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ123456789@#$%^&*()*&^%+-/~{[|`]}";

// Draw the matrix rain
function drawMatrix() {
    // Semi-transparent black background for trail effect
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Green text
    ctx.fillStyle = '#00ff00';
    ctx.font = fontSize + 'px monospace';
    
    // Draw characters
    for (let i = 0; i < drops.length; i++) {
        // Random character
        const text = matrixChars[Math.floor(Math.random() * matrixChars.length)];
        
        // x = i * fontSize, y = drops[i] * fontSize
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        
        // Randomly reset drop position
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
            drops[i] = 0;
        }
        
        // Move drop down
        drops[i]++;
    }
}

// Animate matrix rain
setInterval(drawMatrix, 50);
