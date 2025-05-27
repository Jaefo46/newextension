// Dashboard JavaScript for full-page view
// Handles UI interactions and data display for the dashboard

// Configuration and state
const config = {
    updateInterval: 60000, // 1 minute
    selectedAsset: 'BTC',
    connectionStatus: 'connecting',
    lastUpdate: null
};

// DOM Elements
const elements = {
    loadingIndicator: document.getElementById('loading-indicator'),
    errorMessage: document.getElementById('error-message'),
    connectionStatus: document.getElementById('connection-status'),
    lastUpdate: document.getElementById('last-update'),
    assetSelect: document.getElementById('asset-select'),
    configBtn: document.getElementById('config-btn'),
    refreshBtn: document.getElementById('refresh-btn'),
    shortPointsValue: document.getElementById('short-points-value'),
    shortPointsReasons: document.getElementById('short-points-reasons'),
    longPointsValue: document.getElementById('long-points-value'),
    longPointsReasons: document.getElementById('long-points-reasons'),
    candlestickPointsValue: document.getElementById('candlestick-points-value'),
    candlestickDetails: document.getElementById('candlestick-details'),
    alertsList: document.getElementById('alerts-list'),
    rsiValues: {
        '1m': document.getElementById('rsi-1m'),
        '5m': document.getElementById('rsi-5m'),
        '15m': document.getElementById('rsi-15m'),
        '30m': document.getElementById('rsi-30m'),
        '1h': document.getElementById('rsi-1h'),
        '1d': document.getElementById('rsi-1d')
    },
    matrixCanvas: document.getElementById('matrix-canvas')
};

// Initialize Matrix Animation
initMatrixAnimation();

// Initialize the dashboard
document.addEventListener('DOMContentLoaded', () => {
    initializeDashboard();
});

// Initialize dashboard
function initializeDashboard() {
    // Load saved configuration
    loadConfiguration();
    
    // Set up event listeners
    setupEventListeners();
    
    // Get initial data
    requestDataFromBackground();
    
    // Set up interval for regular updates
    setInterval(() => {
        requestDataFromBackground();
    }, config.updateInterval);
}

// Load configuration from storage
function loadConfiguration() {
    chrome.storage.sync.get(['selectedAsset'], (result) => {
        if (result.selectedAsset) {
            config.selectedAsset = result.selectedAsset;
            elements.assetSelect.value = config.selectedAsset;
        }
    });
}

// Set up event listeners
function setupEventListeners() {
    // Asset selection change
    elements.assetSelect.addEventListener('change', (e) => {
        config.selectedAsset = e.target.value;
        
        // Send message to background script
        chrome.runtime.sendMessage({
            type: 'setAsset',
            asset: config.selectedAsset
        }, (response) => {
            if (response && response.success) {
                // Save to storage
                chrome.storage.sync.set({ selectedAsset: config.selectedAsset });
                
                // Request updated data
                requestDataFromBackground();
            }
        });
    });
    
    // Config button click
    elements.configBtn.addEventListener('click', () => {
        chrome.tabs.create({ url: 'config.html' });
    });
    
    // Refresh button click
    elements.refreshBtn.addEventListener('click', () => {
        showLoading(true);
        requestDataFromBackground();
    });
}

// Request data from background script
function requestDataFromBackground() {
    chrome.runtime.sendMessage({ type: 'getState' }, (response) => {
        if (response) {
            updateUI(response);
        } else {
            showError('Failed to get data from background script');
        }
    });
}

// Update UI with data
function updateUI(data) {
    // Update selected asset
    if (data.selectedAsset && data.selectedAsset !== config.selectedAsset) {
        config.selectedAsset = data.selectedAsset;
        elements.assetSelect.value = config.selectedAsset;
    }
    
    // Update RSI values
    for (const timeframe in data.rsiValues) {
        updateRSIDisplay(timeframe, data.rsiValues[timeframe]);
    }
    
    // Update points
    updatePointsDisplay('short', data.shortPoints, data.pointsReasons.short);
    updatePointsDisplay('long', data.longPoints, data.pointsReasons.long);
    
    // Update candlestick points
    updateCandlestickDisplay(data.candlestickPoints, data.candlestickDetails);
    
    // Update alerts
    updateAlertsDisplay(data.alerts);
    
    // Update connection status
    updateConnectionStatus(data.connectionStatus);
    
    // Update last update time
    if (data.lastUpdate) {
        const lastUpdateTime = new Date(data.lastUpdate);
        elements.lastUpdate.textContent = `Last updated: ${lastUpdateTime.toLocaleTimeString()}`;
    }
    
    // Hide loading indicator
    showLoading(false);
}

// Update RSI display
function updateRSIDisplay(timeframe, rsi) {
    if (rsi === null || rsi === undefined) {
        elements.rsiValues[timeframe].textContent = '--';
        elements.rsiValues[timeframe].className = 'rsi-number';
        return;
    }
    
    elements.rsiValues[timeframe].textContent = rsi;
    
    // Apply styling based on RSI value
    if (rsi >= 70) {
        elements.rsiValues[timeframe].className = 'rsi-number overbought';
    } else if (rsi <= 30) {
        elements.rsiValues[timeframe].className = 'rsi-number oversold';
    } else {
        elements.rsiValues[timeframe].className = 'rsi-number';
    }
}

// Update points display
function updatePointsDisplay(type, points, reasons) {
    const valueElement = type === 'short' ? elements.shortPointsValue : elements.longPointsValue;
    const reasonsElement = type === 'short' ? elements.shortPointsReasons : elements.longPointsReasons;
    
    // Update points value
    valueElement.textContent = points;
    
    // Update reasons
    reasonsElement.innerHTML = '';
    reasons.forEach(reason => {
        const reasonElement = document.createElement('div');
        reasonElement.className = 'points-reason';
        reasonElement.textContent = reason.reason;
        reasonsElement.appendChild(reasonElement);
    });
}

// Update candlestick display
function updateCandlestickDisplay(points, details) {
    elements.candlestickPointsValue.textContent = `${points} points`;
    elements.candlestickDetails.innerHTML = details.join('<br>');
}

// Update alerts display
function updateAlertsDisplay(alerts) {
    elements.alertsList.innerHTML = '';
    alerts.forEach(alert => {
        const alertElement = document.createElement('div');
        alertElement.className = 'alert-item';
        alertElement.textContent = `[${alert.timestamp}] ${alert.message}`;
        elements.alertsList.appendChild(alertElement);
    });
}

// Update connection status
function updateConnectionStatus(status) {
    config.connectionStatus = status;
    
    switch (status) {
        case 'connected':
            elements.connectionStatus.textContent = 'Connected';
            elements.connectionStatus.className = 'connection-status connected';
            break;
        case 'disconnected':
            elements.connectionStatus.textContent = 'Disconnected';
            elements.connectionStatus.className = 'connection-status disconnected';
            break;
        default:
            elements.connectionStatus.textContent = 'Connecting...';
            elements.connectionStatus.className = 'connection-status';
    }
}

// Show/hide loading indicator
function showLoading(show) {
    elements.loadingIndicator.style.display = show ? 'flex' : 'none';
}

// Show error message
function showError(message) {
    elements.errorMessage.textContent = message;
    elements.errorMessage.style.display = 'block';
    
    // Hide after 5 seconds
    setTimeout(() => {
        elements.errorMessage.style.display = 'none';
    }, 5000);
}

// Initialize Matrix Animation
function initMatrixAnimation() {
    const canvas = elements.matrixCanvas;
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
    
    // Resize canvas on window resize
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        // Recalculate columns
        const newColumns = Math.floor(canvas.width / fontSize);
        
        // Adjust drops array
        if (newColumns > columns) {
            // Add new columns
            for (let i = columns; i < newColumns; i++) {
                drops[i] = Math.floor(Math.random() * -100);
            }
        } else {
            // Remove excess columns
            drops.length = newColumns;
        }
    });
}
