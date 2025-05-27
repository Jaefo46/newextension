// CryptoMonitor Configuration Page Script
// Handles UI interactions and configuration management

// DOM Elements
let elements = {};

// Initialize the configuration page
document.addEventListener('DOMContentLoaded', () => {
    // Get all DOM elements
    elements = {
        backBtn: document.getElementById('back-btn'),
        saveConfigBtn: document.getElementById('save-button'),
        statusMessage: document.getElementById('status-message'),
        matrixCanvas: document.getElementById('matrix-canvas'),
        rsiTabs: document.getElementById('rsi-tabs'),
        
        // RSI Configuration Elements
        rsiConfig: {
            '1m': {},
            '5m': {},
            '15m': {},
            '30m': {},
            '1h': {},
            '1d': {}
        },
        
        // Moving Average Configuration Elements
        maConfig: {},
        
        // Bollinger Bands Configuration Elements
        bbConfig: {},
        
        // Candlestick Pattern Configuration Elements
        candleConfig: {}
    };
    
    // Initialize the page
    initializeConfigPage();
});

// Initialize configuration page
function initializeConfigPage() {
    // Set up tab navigation
    setupTabNavigation();
    
    // Load saved configuration
    loadConfiguration();
    
    // Set up event listeners
    setupEventListeners();
    
    // Initialize Matrix Animation
    initMatrixAnimation();
}

// Set up tab navigation
function setupTabNavigation() {
    // Get all tab elements
    const tabs = document.querySelectorAll('.tab');
    
    // Add click event to each tab
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Get the tab ID
            const tabId = tab.getAttribute('data-tab');
            
            // Remove active class from all tabs
            document.querySelectorAll('.tab').forEach(t => {
                t.classList.remove('active');
            });
            
            // Add active class to clicked tab
            tab.classList.add('active');
            
            // Hide all tab content
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            
            // Show the selected tab content
            document.getElementById(`tab-${tabId}`).classList.add('active');
        });
    });
}

// Load configuration from storage
function loadConfiguration() {
    // Initialize RSI config elements
    const timeframes = ['1m', '5m', '15m', '30m', '1h', '1d'];
    
    timeframes.forEach(timeframe => {
        elements.rsiConfig[timeframe] = {
            // Short points (RSI Above)
            threshold1: document.getElementById(`rsi-${timeframe}-threshold1`),
            points1: document.getElementById(`rsi-${timeframe}-points1`),
            threshold2: document.getElementById(`rsi-${timeframe}-threshold2`),
            points2: document.getElementById(`rsi-${timeframe}-points2`),
            threshold3: document.getElementById(`rsi-${timeframe}-threshold3`),
            points3: document.getElementById(`rsi-${timeframe}-points3`),
            threshold4: document.getElementById(`rsi-${timeframe}-threshold4`),
            points4: document.getElementById(`rsi-${timeframe}-points4`),
            
            // Long points (RSI Below)
            threshold5: document.getElementById(`rsi-${timeframe}-threshold5`),
            points5: document.getElementById(`rsi-${timeframe}-points5`),
            threshold6: document.getElementById(`rsi-${timeframe}-threshold6`),
            points6: document.getElementById(`rsi-${timeframe}-points6`),
            threshold7: document.getElementById(`rsi-${timeframe}-threshold7`),
            points7: document.getElementById(`rsi-${timeframe}-points7`),
            threshold8: document.getElementById(`rsi-${timeframe}-threshold8`),
            points8: document.getElementById(`rsi-${timeframe}-points8`)
        };
    });
    
    // Initialize other config elements
    elements.maConfig = {
        period: document.getElementById('ma-period'),
        basePoints: document.getElementById('ma-base-points'),
        deviationThreshold: document.getElementById('ma-deviation-threshold'),
        deviationPoints: document.getElementById('ma-deviation-points')
    };
    
    elements.bbConfig = {
        period: document.getElementById('bb-period'),
        stdDev: document.getElementById('bb-std-dev'),
        touchPoints: document.getElementById('bb-touch-points'),
        breakPoints: document.getElementById('bb-break-points')
    };
    
    elements.candleConfig = {
        minConsecutive: document.getElementById('candle-min-consecutive'),
        basePoints: document.getElementById('candle-base-points'),
        additionalPoints: document.getElementById('candle-additional-points'),
        alertThreshold: document.getElementById('candle-alert-threshold')
    };
    
    // Load configuration from storage
    chrome.storage.local.get('config', (result) => {
        if (!result.config) return;
        
        const config = result.config;
        
        // Load RSI configuration
        timeframes.forEach(timeframe => {
            if (elements.rsiConfig[timeframe].threshold1) {
                // Short points (RSI Above)
                elements.rsiConfig[timeframe].threshold1.value = config[`rsi-${timeframe}-short-threshold1`] || 50;
                elements.rsiConfig[timeframe].points1.value = config[`rsi-${timeframe}-short-points1`] || 1;
                elements.rsiConfig[timeframe].threshold2.value = config[`rsi-${timeframe}-short-threshold2`] || 60;
                elements.rsiConfig[timeframe].points2.value = config[`rsi-${timeframe}-short-points2`] || 2;
                elements.rsiConfig[timeframe].threshold3.value = config[`rsi-${timeframe}-short-threshold3`] || 70;
                elements.rsiConfig[timeframe].points3.value = config[`rsi-${timeframe}-short-points3`] || 3;
                elements.rsiConfig[timeframe].threshold4.value = config[`rsi-${timeframe}-short-threshold4`] || 80;
                elements.rsiConfig[timeframe].points4.value = config[`rsi-${timeframe}-short-points4`] || 5;
                
                // Long points (RSI Below)
                elements.rsiConfig[timeframe].threshold5.value = config[`rsi-${timeframe}-long-threshold1`] || 40;
                elements.rsiConfig[timeframe].points5.value = config[`rsi-${timeframe}-long-points1`] || 1;
                elements.rsiConfig[timeframe].threshold6.value = config[`rsi-${timeframe}-long-threshold2`] || 30;
                elements.rsiConfig[timeframe].points6.value = config[`rsi-${timeframe}-long-points2`] || 2;
                elements.rsiConfig[timeframe].threshold7.value = config[`rsi-${timeframe}-long-threshold3`] || 20;
                elements.rsiConfig[timeframe].points7.value = config[`rsi-${timeframe}-long-points3`] || 3;
                elements.rsiConfig[timeframe].threshold8.value = config[`rsi-${timeframe}-long-threshold4`] || 10;
                elements.rsiConfig[timeframe].points8.value = config[`rsi-${timeframe}-long-points4`] || 5;
            }
        });
        
        // Load MA configuration
        if (elements.maConfig.period) {
            elements.maConfig.period.value = config['ma-period'] || 20;
            elements.maConfig.basePoints.value = config['ma-base-points'] || 5;
            elements.maConfig.deviationThreshold.value = config['ma-deviation-threshold'] || 50;
            elements.maConfig.deviationPoints.value = config['ma-deviation-points'] || 5;
        }
        
        // Load BB configuration
        if (elements.bbConfig.period) {
            elements.bbConfig.period.value = config['bb-period'] || 20;
            elements.bbConfig.stdDev.value = config['bb-std-dev'] || 2;
            elements.bbConfig.touchPoints.value = config['bb-touch-points'] || 3;
            elements.bbConfig.breakPoints.value = config['bb-break-points'] || 5;
        }
        
        // Load Candlestick configuration
        if (elements.candleConfig.minConsecutive) {
            elements.candleConfig.minConsecutive.value = config['candle-min-consecutive'] || 4;
            elements.candleConfig.basePoints.value = config['candle-base-points'] || 5;
            elements.candleConfig.additionalPoints.value = config['candle-additional-points'] || 5;
            elements.candleConfig.alertThreshold.value = config['candle-alert-threshold'] || 6;
        }
    });
}

// Set up event listeners
function setupEventListeners() {
    // Back button click
    if (elements.backBtn) {
        elements.backBtn.addEventListener('click', () => {
            window.location.href = 'popup.html';
        });
    }
    
    // Save configuration button click
    if (elements.saveConfigBtn) {
        elements.saveConfigBtn.addEventListener('click', saveConfiguration);
    }
}

// Save configuration
function saveConfiguration() {
    const config = {};
    const timeframes = ['1m', '5m', '15m', '30m', '1h', '1d'];
    
    // Collect RSI configuration
    timeframes.forEach(timeframe => {
        if (elements.rsiConfig[timeframe].threshold1) {
            // Short points (RSI Above)
            config[`rsi-${timeframe}-short-threshold1`] = parseFloat(elements.rsiConfig[timeframe].threshold1.value);
            config[`rsi-${timeframe}-short-points1`] = parseInt(elements.rsiConfig[timeframe].points1.value);
            config[`rsi-${timeframe}-short-threshold2`] = parseFloat(elements.rsiConfig[timeframe].threshold2.value);
            config[`rsi-${timeframe}-short-points2`] = parseInt(elements.rsiConfig[timeframe].points2.value);
            config[`rsi-${timeframe}-short-threshold3`] = parseFloat(elements.rsiConfig[timeframe].threshold3.value);
            config[`rsi-${timeframe}-short-points3`] = parseInt(elements.rsiConfig[timeframe].points3.value);
            config[`rsi-${timeframe}-short-threshold4`] = parseFloat(elements.rsiConfig[timeframe].threshold4.value);
            config[`rsi-${timeframe}-short-points4`] = parseInt(elements.rsiConfig[timeframe].points4.value);
            
            // Long points (RSI Below)
            config[`rsi-${timeframe}-long-threshold1`] = parseFloat(elements.rsiConfig[timeframe].threshold5.value);
            config[`rsi-${timeframe}-long-points1`] = parseInt(elements.rsiConfig[timeframe].points5.value);
            config[`rsi-${timeframe}-long-threshold2`] = parseFloat(elements.rsiConfig[timeframe].threshold6.value);
            config[`rsi-${timeframe}-long-points2`] = parseInt(elements.rsiConfig[timeframe].points6.value);
            config[`rsi-${timeframe}-long-threshold3`] = parseFloat(elements.rsiConfig[timeframe].threshold7.value);
            config[`rsi-${timeframe}-long-points3`] = parseInt(elements.rsiConfig[timeframe].points7.value);
            config[`rsi-${timeframe}-long-threshold4`] = parseFloat(elements.rsiConfig[timeframe].threshold8.value);
            config[`rsi-${timeframe}-long-points4`] = parseInt(elements.rsiConfig[timeframe].points8.value);
        }
    });
    
    // Collect MA configuration
    if (elements.maConfig.period) {
        config['ma-period'] = parseInt(elements.maConfig.period.value);
        config['ma-base-points'] = parseInt(elements.maConfig.basePoints.value);
        config['ma-deviation-threshold'] = parseFloat(elements.maConfig.deviationThreshold.value);
        config['ma-deviation-points'] = parseInt(elements.maConfig.deviationPoints.value);
    }
    
    // Collect BB configuration
    if (elements.bbConfig.period) {
        config['bb-period'] = parseInt(elements.bbConfig.period.value);
        config['bb-std-dev'] = parseFloat(elements.bbConfig.stdDev.value);
        config['bb-touch-points'] = parseInt(elements.bbConfig.touchPoints.value);
        config['bb-break-points'] = parseInt(elements.bbConfig.breakPoints.value);
    }
    
    // Collect Candlestick configuration
    if (elements.candleConfig.minConsecutive) {
        config['candle-min-consecutive'] = parseInt(elements.candleConfig.minConsecutive.value);
        config['candle-base-points'] = parseInt(elements.candleConfig.basePoints.value);
        config['candle-additional-points'] = parseInt(elements.candleConfig.additionalPoints.value);
        config['candle-alert-threshold'] = parseInt(elements.candleConfig.alertThreshold.value);
    }
    
    // Save to storage
    chrome.storage.local.set({ config }, () => {
        showStatusMessage('Configuration saved successfully!', 'success');
        
        // Notify background script of config change
        chrome.runtime.sendMessage({
            action: 'CONFIG_UPDATED'
        });
    });
}

// Show status message
function showStatusMessage(message, type) {
    if (!elements.statusMessage) return;
    
    elements.statusMessage.textContent = message;
    elements.statusMessage.className = `status-message ${type}`;
    elements.statusMessage.style.display = 'block';
    
    // Hide after 3 seconds
    setTimeout(() => {
        elements.statusMessage.style.display = 'none';
    }, 3000);
}

// Initialize Matrix Animation
function initMatrixAnimation() {
    const canvas = elements.matrixCanvas;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Set canvas dimensions
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Characters for matrix rain
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789$+-*/=%"\'#&_(),.;:?!\\|{}<>[]^~';
    
    // Font size and columns
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    
    // Array to track y position of each column
    const drops = [];
    for (let i = 0; i < columns; i++) {
        drops[i] = Math.floor(Math.random() * -100); // Random start position above the canvas
    }
    
    // Draw matrix rain
    function drawMatrixRain() {
        // Semi-transparent black to create fade effect
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Green text
        ctx.fillStyle = '#00ff00';
        ctx.font = fontSize + 'px monospace';
        
        // Draw characters
        for (let i = 0; i < drops.length; i++) {
            // Random character
            const char = chars[Math.floor(Math.random() * chars.length)];
            
            // Draw character
            ctx.fillText(char, i * fontSize, drops[i] * fontSize);
            
            // Move drop down
            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            
            drops[i]++;
        }
    }
    
    // Animate matrix rain
    setInterval(drawMatrixRain, 50);
}
