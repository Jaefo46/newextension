// Updated popup.js with TradingView widget and fixed tab navigation

document.addEventListener('DOMContentLoaded', initialize);

// Global variables
let priceChart = null;
let currentSymbol = 'BTC';
let connectionStatus = 'connecting';
let shortPoints = 0;
let longPoints = 0;
let shortPointsReasons = [];
let longPointsReasons = [];
let rsiValues = {
    '1m': null,
    '5m': null,
    '15m': null,
    '30m': null,
    '1h': null,
    '1d': null
};

// Configuration defaults
const defaultConfig = {
    // RSI Configuration - 1m
    'rsi-1m-short-threshold1': 50,
    'rsi-1m-short-points1': 1,
    'rsi-1m-short-threshold2': 60,
    'rsi-1m-short-points2': 2,
    'rsi-1m-short-threshold3': 70,
    'rsi-1m-short-points3': 3,
    'rsi-1m-short-threshold4': 80,
    'rsi-1m-short-points4': 5,
    'rsi-1m-long-threshold1': 40,
    'rsi-1m-long-points1': 1,
    'rsi-1m-long-threshold2': 30,
    'rsi-1m-long-points2': 2,
    'rsi-1m-long-threshold3': 20,
    'rsi-1m-long-points3': 3,
    'rsi-1m-long-threshold4': 10,
    'rsi-1m-long-points4': 5,
    
    // RSI Configuration - 5m
    'rsi-5m-short-threshold1': 50,
    'rsi-5m-short-points1': 1,
    'rsi-5m-short-threshold2': 60,
    'rsi-5m-short-points2': 2,
    'rsi-5m-short-threshold3': 70,
    'rsi-5m-short-points3': 3,
    'rsi-5m-short-threshold4': 80,
    'rsi-5m-short-points4': 5,
    'rsi-5m-long-threshold1': 40,
    'rsi-5m-long-points1': 1,
    'rsi-5m-long-threshold2': 30,
    'rsi-5m-long-points2': 2,
    'rsi-5m-long-threshold3': 20,
    'rsi-5m-long-points3': 3,
    'rsi-5m-long-threshold4': 10,
    'rsi-5m-long-points4': 5,
    
    // RSI Configuration - 15m
    'rsi-15m-short-threshold1': 50,
    'rsi-15m-short-points1': 1,
    'rsi-15m-short-threshold2': 60,
    'rsi-15m-short-points2': 2,
    'rsi-15m-short-threshold3': 70,
    'rsi-15m-short-points3': 3,
    'rsi-15m-short-threshold4': 80,
    'rsi-15m-short-points4': 5,
    'rsi-15m-long-threshold1': 40,
    'rsi-15m-long-points1': 1,
    'rsi-15m-long-threshold2': 30,
    'rsi-15m-long-points2': 2,
    'rsi-15m-long-threshold3': 20,
    'rsi-15m-long-points3': 3,
    'rsi-15m-long-threshold4': 10,
    'rsi-15m-long-points4': 5,
    
    // RSI Configuration - 30m
    'rsi-30m-short-threshold1': 50,
    'rsi-30m-short-points1': 1,
    'rsi-30m-short-threshold2': 60,
    'rsi-30m-short-points2': 2,
    'rsi-30m-short-threshold3': 70,
    'rsi-30m-short-points3': 3,
    'rsi-30m-short-threshold4': 80,
    'rsi-30m-short-points4': 5,
    'rsi-30m-long-threshold1': 40,
    'rsi-30m-long-points1': 1,
    'rsi-30m-long-threshold2': 30,
    'rsi-30m-long-points2': 2,
    'rsi-30m-long-threshold3': 20,
    'rsi-30m-long-points3': 3,
    'rsi-30m-long-threshold4': 10,
    'rsi-30m-long-points4': 5,
    
    // RSI Configuration - 1h
    'rsi-1h-short-threshold1': 50,
    'rsi-1h-short-points1': 1,
    'rsi-1h-short-threshold2': 60,
    'rsi-1h-short-points2': 2,
    'rsi-1h-short-threshold3': 70,
    'rsi-1h-short-points3': 3,
    'rsi-1h-short-threshold4': 80,
    'rsi-1h-short-points4': 5,
    'rsi-1h-long-threshold1': 40,
    'rsi-1h-long-points1': 1,
    'rsi-1h-long-threshold2': 30,
    'rsi-1h-long-points2': 2,
    'rsi-1h-long-threshold3': 20,
    'rsi-1h-long-points3': 3,
    'rsi-1h-long-threshold4': 10,
    'rsi-1h-long-points4': 5,
    
    // RSI Configuration - 1d
    'rsi-1d-short-threshold1': 50,
    'rsi-1d-short-points1': 1,
    'rsi-1d-short-threshold2': 60,
    'rsi-1d-short-points2': 2,
    'rsi-1d-short-threshold3': 70,
    'rsi-1d-short-points3': 3,
    'rsi-1d-short-threshold4': 80,
    'rsi-1d-short-points4': 5,
    'rsi-1d-long-threshold1': 40,
    'rsi-1d-long-points1': 1,
    'rsi-1d-long-threshold2': 30,
    'rsi-1d-long-points2': 2,
    'rsi-1d-long-threshold3': 20,
    'rsi-1d-long-points3': 3,
    'rsi-1d-long-threshold4': 10,
    'rsi-1d-long-points4': 5,
    
    // Moving Average Configuration
    'ma-period': 20,
    'ma-base-points': 5,
    'ma-deviation-threshold': 50,
    'ma-deviation-points': 5,
    
    // Bollinger Bands Configuration
    'bb-period': 20,
    'bb-std-dev': 2,
    'bb-touch-points': 3,
    'bb-break-points': 5,
    'bb-upper-threshold': 2,
    'bb-lower-threshold': 2,
    
    // Candlestick Pattern Configuration
    'candle-min-consecutive': 4,
    'candle-base-points': 5,
    'candle-additional-points': 5,
    'candle-alert-threshold': 6,
    'large-candle-threshold': 2.0,
    'large-candle-points': 5
};

// Initialize the extension
function initialize() {
    console.log('Initializing AlertCrypto Matrix 2025...');
    
    // Set up navigation
    setupNavigation();
    
    // Set up RSI configuration tabs
    setupRsiTabs();
    
    // Load configuration
    loadConfiguration();
    
    // Set up asset selection
    setupAssetSelection();
    
    // Initialize TradingView widget
    initializeTradingViewWidget();
    
    // Set up configuration buttons
    setupConfigButtons();
    
    // Set up fullscreen mode
    setupFullscreenMode();
    
    // Initialize Matrix animation
    initializeMatrixAnimation();
    
    // Connect to background script
    connectToBackground();
}

// Set up navigation between pages
function setupNavigation() {
    const dashboardBtn = document.getElementById('dashboard-btn');
    const configBtn = document.getElementById('config-btn');
    const dashboardPage = document.getElementById('dashboard-page');
    const configPage = document.getElementById('config-page');
    
    if (dashboardBtn) {
        dashboardBtn.addEventListener('click', () => {
            if (dashboardPage) dashboardPage.classList.add('active');
            if (configPage) configPage.classList.remove('active');
        });
    }
    
    if (configBtn) {
        configBtn.addEventListener('click', () => {
            if (dashboardPage) dashboardPage.classList.remove('active');
            if (configPage) configPage.classList.add('active');
        });
    }
}

// Set up RSI configuration tabs
function setupRsiTabs() {
    const tabs = document.querySelectorAll('.rsi-tab');
    
    tabs.forEach(tab => {
        if (tab) {
            tab.addEventListener('click', () => {
                const timeframe = tab.getAttribute('data-timeframe');
                
                // Remove active class from all tabs and content
                document.querySelectorAll('.rsi-tab').forEach(t => {
                    if (t) t.classList.remove('active');
                });
                document.querySelectorAll('.rsi-tab-content').forEach(c => {
                    if (c) c.classList.remove('active');
                });
                
                // Add active class to clicked tab and corresponding content
                tab.classList.add('active');
                const content = document.getElementById(`rsi-${timeframe}-config`);
                if (content) content.classList.add('active');
            });
        }
    });
}

// Load configuration from storage
function loadConfiguration() {
    chrome.storage.local.get('config', (result) => {
        const config = result.config || defaultConfig;
        
        // Set input values from config
        Object.keys(config).forEach(key => {
            const input = document.getElementById(key);
            if (input) {
                input.value = config[key];
            }
        });
    });
}

// Set up asset selection
function setupAssetSelection() {
    const assetSelect = document.getElementById('dashboard-asset-select');
    
    if (assetSelect) {
        assetSelect.addEventListener('change', () => {
            currentSymbol = assetSelect.value;
            
            // Update TradingView widget with new symbol
            updateTradingViewSymbol(currentSymbol);
            
            // Notify background script of symbol change
            chrome.runtime.sendMessage({
                action: 'CHANGE_SYMBOL',
                symbol: currentSymbol
            }, (response) => {
                if (chrome.runtime.lastError) {
                    console.error('Error sending message:', chrome.runtime.lastError);
                    return;
                }
                
                if (response && response.success) {
                    console.log(`Symbol changed to ${currentSymbol}`);
                    updateUI();
                }
            });
        });
    }
}

// Initialize TradingView widget
function initializeTradingViewWidget() {
    const chartContainer = document.getElementById('tradingview-widget');
    
    if (!chartContainer) {
        console.error('TradingView widget container not found');
        return;
    }
    
    // Clear any existing content
    chartContainer.innerHTML = '';
    
    // Create new TradingView widget
    new TradingView.widget({
        "width": "100%",
        "height": "100%",
        "symbol": `KRAKEN:${currentSymbol}USD`,
        "interval": "15",
        "timezone": "Etc/UTC",
        "theme": "dark",
        "style": "1",
        "locale": "en",
        "toolbar_bg": "#000000",
        "enable_publishing": false,
        "hide_top_toolbar": true,
        "hide_legend": false,
        "save_image": false,
        "container_id": "tradingview-widget",
        "studies": [
            "RSI@tv-basicstudies",
            "BB@tv-basicstudies",
            "MASimple@tv-basicstudies"
        ]
    });
    
    console.log('TradingView widget initialized');
}

// Update TradingView widget symbol
function updateTradingViewSymbol(symbol) {
    const chartContainer = document.getElementById('tradingview-widget');
    
    if (!chartContainer) {
        console.error('TradingView widget container not found');
        return;
    }
    
    // Clear existing widget
    chartContainer.innerHTML = '';
    
    // Create new widget with updated symbol
    new TradingView.widget({
        "width": "100%",
        "height": "100%",
        "symbol": `KRAKEN:${symbol}USD`,
        "interval": "15",
        "timezone": "Etc/UTC",
        "theme": "dark",
        "style": "1",
        "locale": "en",
        "toolbar_bg": "#000000",
        "enable_publishing": false,
        "hide_top_toolbar": true,
        "hide_legend": false,
        "save_image": false,
        "container_id": "tradingview-widget",
        "studies": [
            "RSI@tv-basicstudies",
            "BB@tv-basicstudies",
            "MASimple@tv-basicstudies"
        ]
    });
    
    console.log(`TradingView widget updated to ${symbol}`);
}

// Set up configuration buttons
function setupConfigButtons() {
    const saveBtn = document.getElementById('save-config-btn');
    const resetBtn = document.getElementById('reset-config-btn');
    
    if (saveBtn) {
        saveBtn.addEventListener('click', saveConfiguration);
    }
    
    if (resetBtn) {
        resetBtn.addEventListener('click', resetConfiguration);
    }
}

// Save configuration
function saveConfiguration() {
    const config = {};
    
    // Get all input values
    Object.keys(defaultConfig).forEach(key => {
        const input = document.getElementById(key);
        if (input) {
            config[key] = parseFloat(input.value);
        }
    });
    
    // Save to storage
    chrome.storage.local.set({ config }, () => {
        console.log('Configuration saved');
        
        // Show success message
        const statusElement = document.getElementById('config-status');
        if (statusElement) {
            statusElement.textContent = 'Configuration saved successfully!';
            statusElement.style.display = 'block';
            
            // Hide after 3 seconds
            setTimeout(() => {
                statusElement.style.display = 'none';
            }, 3000);
        }
        
        // Notify background script of config change
        chrome.runtime.sendMessage({
            action: 'CONFIG_UPDATED'
        }, (response) => {
            if (chrome.runtime.lastError) {
                console.error('Error sending message:', chrome.runtime.lastError);
                return;
            }
            
            if (response && response.success) {
                console.log('Background script notified of config change');
                updateUI();
            }
        });
    });
}

// Reset configuration
function resetConfiguration() {
    // Save default config to storage
    chrome.storage.local.set({ config: defaultConfig }, () => {
        console.log('Configuration reset to defaults');
        
        // Set input values from default config
        Object.keys(defaultConfig).forEach(key => {
            const input = document.getElementById(key);
            if (input) {
                input.value = defaultConfig[key];
            }
        });
        
        // Show success message
        const statusElement = document.getElementById('config-status');
        if (statusElement) {
            statusElement.textContent = 'Configuration reset to defaults!';
            statusElement.style.display = 'block';
            
            // Hide after 3 seconds
            setTimeout(() => {
                statusElement.style.display = 'none';
            }, 3000);
        }
        
        // Notify background script of config change
        chrome.runtime.sendMessage({
            action: 'CONFIG_UPDATED'
        }, (response) => {
            if (chrome.runtime.lastError) {
                console.error('Error sending message:', chrome.runtime.lastError);
                return;
            }
            
            if (response && response.success) {
                console.log('Background script notified of config reset');
                updateUI();
            }
        });
    });
}

// Set up fullscreen mode
function setupFullscreenMode() {
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    const container = document.querySelector('.container');
    
    if (fullscreenBtn && container) {
        fullscreenBtn.addEventListener('click', () => {
            container.classList.toggle('fullscreen-mode');
        });
    }
}

// Initialize Matrix Animation
function initializeMatrixAnimation() {
    const canvas = document.getElementById('matrix-canvas');
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

// Connect to background script
function connectToBackground() {
    console.log('Connecting to background script...');
    
    // Update connection status
    updateConnectionStatus('connecting');
    
    // Request initial data
    chrome.runtime.sendMessage({
        action: 'GET_INITIAL_DATA',
        symbol: currentSymbol
    }, (response) => {
        if (chrome.runtime.lastError) {
            console.error('Error connecting to background script:', chrome.runtime.lastError);
            updateConnectionStatus('disconnected');
            return;
        }
        
        if (response && response.success) {
            console.log('Connected to background script');
            updateConnectionStatus('connected');
            
            // Update UI with initial data
            if (response.data) {
                updateUIWithData(response.data);
            }
        } else {
            console.error('Failed to get initial data from background script');
            updateConnectionStatus('disconnected');
        }
    });
    
    // Set up message listener for updates from background script
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === 'UPDATE_DATA') {
            console.log('Received data update from background script');
            updateUIWithData(message.data);
            sendResponse({ success: true });
            return true;
        }
        return false;
    });
}

// Update connection status
function updateConnectionStatus(status) {
    connectionStatus = status;
    
    const statusDot = document.getElementById('status-dot');
    const statusText = document.getElementById('status-text');
    
    if (statusDot) {
        statusDot.className = 'status-dot';
        
        if (status === 'connecting') {
            statusDot.classList.add('status-connecting');
            if (statusText) statusText.textContent = 'Connecting to Kraken API...';
        } else if (status === 'connected') {
            statusDot.classList.add('status-connected');
            if (statusText) statusText.textContent = 'Connected to Kraken API';
        } else if (status === 'disconnected') {
            statusDot.classList.add('status-disconnected');
            if (statusText) statusText.textContent = 'Disconnected from Kraken API';
        }
    }
}

// Update UI with data from background script
function updateUIWithData(data) {
    if (!data) return;
    
    // Update price
    if (data.price) {
        const priceElement = document.getElementById('dashboard-price');
        if (priceElement) {
            priceElement.textContent = `$${data.price.toFixed(2)}`;
        }
    }
    
    // Update price change
    if (data.priceChange) {
        const priceChangeElement = document.getElementById('dashboard-price-change');
        if (priceChangeElement) {
            const changeText = `(${data.priceChange > 0 ? '+' : ''}${data.priceChange.toFixed(2)}%)`;
            priceChangeElement.textContent = changeText;
            priceChangeElement.className = 'dashboard-price-change ' + (data.priceChange >= 0 ? 'positive' : 'negative');
        }
    }
    
    // Update RSI values
    if (data.rsi) {
        rsiValues = data.rsi;
        
        // Update RSI display
        Object.keys(rsiValues).forEach(timeframe => {
            const rsiElement = document.getElementById(`dashboard-rsi-${timeframe}`);
            if (rsiElement && rsiValues[timeframe] !== null) {
                rsiElement.textContent = rsiValues[timeframe].toFixed(2);
                
                // Add color class based on RSI value
                rsiElement.className = 'rsi-number';
                if (rsiValues[timeframe] >= 70) {
                    rsiElement.classList.add('overbought');
                } else if (rsiValues[timeframe] <= 30) {
                    rsiElement.classList.add('oversold');
                }
            }
        });
    }
    
    // Update Moving Average
    if (data.ma) {
        const maElement = document.getElementById('dashboard-ma');
        const maDeviationElement = document.getElementById('dashboard-ma-deviation');
        
        if (maElement && data.ma.value !== null) {
            maElement.textContent = `$${data.ma.value.toFixed(2)}`;
        }
        
        if (maDeviationElement && data.ma.deviation !== null) {
            const deviationText = `${data.ma.deviation > 0 ? '+' : ''}${data.ma.deviation.toFixed(2)}%`;
            maDeviationElement.textContent = deviationText;
            maDeviationElement.className = data.ma.deviation >= 0 ? 'positive' : 'negative';
        }
    }
    
    // Update Bollinger Bands
    if (data.bb) {
        // Could add BB display if needed
    }
    
    // Update Short Points
    if (data.points && data.points.short !== undefined) {
        shortPoints = data.points.short;
        shortPointsReasons = data.points.shortReasons || [];
        
        const shortPointsElement = document.getElementById('dashboard-short-points');
        const shortReasonsElement = document.getElementById('short-points-reasons');
        
        if (shortPointsElement) {
            shortPointsElement.textContent = shortPoints;
        }
        
        if (shortReasonsElement) {
            shortReasonsElement.innerHTML = shortPointsReasons.map(reason => `<div>${reason}</div>`).join('');
        }
    }
    
    // Update Long Points
    if (data.points && data.points.long !== undefined) {
        longPoints = data.points.long;
        longPointsReasons = data.points.longReasons || [];
        
        const longPointsElement = document.getElementById('dashboard-long-points');
        const longReasonsElement = document.getElementById('long-points-reasons');
        
        if (longPointsElement) {
            longPointsElement.textContent = longPoints;
        }
        
        if (longReasonsElement) {
            longReasonsElement.innerHTML = longPointsReasons.map(reason => `<div>${reason}</div>`).join('');
        }
    }
    
    // Update Candlestick Patterns
    if (data.candlestick) {
        const candlestickPointsElement = document.getElementById('dashboard-candlestick-points');
        const candlestickDetailsElement = document.getElementById('dashboard-candlestick-details');
        
        if (candlestickPointsElement) {
            candlestickPointsElement.textContent = `${data.candlestick.points} points`;
        }
        
        if (candlestickDetailsElement) {
            if (data.candlestick.patterns && data.candlestick.patterns.length > 0) {
                candlestickDetailsElement.innerHTML = data.candlestick.patterns.map(pattern => `<div>${pattern}</div>`).join('');
            } else {
                candlestickDetailsElement.textContent = 'No candlestick patterns detected';
            }
        }
    }
    
    // Update Wick Patterns
    if (data.wick) {
        const wickPointsElement = document.getElementById('dashboard-wick-points');
        const wickDetailsElement = document.getElementById('dashboard-wick-details');
        
        if (wickPointsElement) {
            wickPointsElement.textContent = `${data.wick.points} points`;
        }
        
        if (wickDetailsElement) {
            if (data.wick.patterns && data.wick.patterns.length > 0) {
                wickDetailsElement.innerHTML = data.wick.patterns.map(pattern => `<div>${pattern}</div>`).join('');
            } else {
                wickDetailsElement.textContent = 'No wick patterns detected';
            }
        }
    }
    
    // Update Alerts
    if (data.alerts) {
        const alertsElement = document.getElementById('dashboard-alerts');
        
        if (alertsElement) {
            if (data.alerts.length > 0) {
                alertsElement.innerHTML = data.alerts.map(alert => `<div class="alert-item">${alert}</div>`).join('');
            } else {
                alertsElement.textContent = 'No alerts';
            }
        }
    }
}

// Update UI (used after symbol change)
function updateUI() {
    // Request data for current symbol
    chrome.runtime.sendMessage({
        action: 'GET_DATA',
        symbol: currentSymbol
    }, (response) => {
        if (chrome.runtime.lastError) {
            console.error('Error getting data:', chrome.runtime.lastError);
            return;
        }
        
        if (response && response.success) {
            updateUIWithData(response.data);
        }
    });
}
