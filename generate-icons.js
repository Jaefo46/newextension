// Matrix-themed icon generator
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');

// Generate icons of different sizes
function generateIcon(size) {
  canvas.width = size;
  canvas.height = size;
  
  // Black background
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, size, size);
  
  // Matrix-style text effect
  const fontSize = Math.max(size / 4, 8);
  ctx.font = `bold ${fontSize}px monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Draw glowing text
  const text = 'CM';
  
  // Glow effect
  ctx.shadowColor = '#00ff00';
  ctx.shadowBlur = size / 8;
  ctx.fillStyle = '#00ff00';
  ctx.fillText(text, size / 2, size / 2);
  
  // Add matrix code rain effect
  const chars = '01';
  const rainDrops = Math.floor(size / 8);
  
  for (let i = 0; i < rainDrops; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const char = chars[Math.floor(Math.random() * chars.length)];
    
    ctx.font = `${size / 16}px monospace`;
    ctx.fillText(char, x, y);
  }
  
  // Add border
  ctx.strokeStyle = '#00ff00';
  ctx.lineWidth = Math.max(1, size / 32);
  ctx.strokeRect(2, 2, size - 4, size - 4);
  
  return canvas.toDataURL('image/png');
}

// Generate icons
const icon16 = generateIcon(16);
const icon48 = generateIcon(48);
const icon128 = generateIcon(128);

// Download icons
function downloadIcon(dataUrl, size) {
  const link = document.createElement('a');
  link.download = `icon${size}.png`;
  link.href = dataUrl;
  link.click();
}

downloadIcon(icon16, 16);
downloadIcon(icon48, 48);
downloadIcon(icon128, 128);
