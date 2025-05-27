// Background Script for AlertCrypto Matrix 2025
// Handles data fetching, indicator calculations, and messaging

// Global variables
let currentSymbol = 'BTC';
let config = null;
let historicalData = {};
let rsiValues = {
    '1m': null,
    '5m': null,
    '15m': null,
    '30m': null,
    '1h': null,
    '1d': null
};
let maValue = null;
let maDeviation = null;
let bbValues = null;
let shortPoints = 0;
let longPoints = 0;
let shortPointsReasons = [];
let longPointsReasons = [];
let candlestickPatterns = [];
let wickPatterns = [];
let alerts = [];

// Kraken API proxy URL
const PROXY_URL = 'http://localhost:3001/api';

// Initialize extension
function initialize() {
    console.log('Initializing AlertCrypto Matrix 2025 background service...');
    
    // Load configuration
    loadConfiguration();
    
    // Set up alarms for data fetching
    chrome.alarms.create('fetchData', { periodInMinutes: 1 });
    chrome.alarms.create('calculateIndicators', { periodInMinutes: 1 });
    
    // Set up alarm listener
    chrome.alarms.onAlarm.addListener(handleAlarm);
    
    // Set up message listener
    chrome.runtime.onMessage.addListener(handleMessage);
    
    // Initial data fetch
    fetchInitialData();
}

// Load configuration from storage
function loadConfiguration() {
    chrome.storage.local.get('config', (result) => {
        if (result.config) {
            config = result.config;
            console.log('Configuration loaded');
        } else {
            // Use default configuration
            config = getDefaultConfig();
            chrome.storage.local.set({ config }, () => {
                console.log('Default configuration saved');
            });
        }
    });
}

// Get default configuration
function getDefaultConfig() {
    return {
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
}

// Handle alarms
function handleAlarm(alarm) {
    if (alarm.name === 'fetchData') {
        fetchData();
    } else if (alarm.name === 'calculateIndicators') {
        calculateIndicators();
    }
}

// Handle messages from popup
function handleMessage(message, sender, sendResponse) {
    console.log('Message received:', message);
    
    if (message.action === 'GET_INITIAL_DATA') {
        // Send initial data to popup
        currentSymbol = message.symbol || currentSymbol;
        
        sendResponse({
            success: true,
            data: getDataForPopup()
        });
        
        return true;
    } else if (message.action === 'GET_DATA') {
        // Send current data to popup
        sendResponse({
            success: true,
            data: getDataForPopup()
        });
        
        return true;
    } else if (message.action === 'CHANGE_SYMBOL') {
        // Change current symbol
        currentSymbol = message.symbol;
        
        // Fetch data for new symbol
        fetchInitialData().then(() => {
            sendResponse({
                success: true
            });
        }).catch(error => {
            console.error('Error fetching data for new symbol:', error);
            sendResponse({
                success: false,
                error: 'Failed to fetch data for new symbol'
            });
        });
        
        return true;
    } else if (message.action === 'CONFIG_UPDATED') {
        // Reload configuration
        loadConfiguration();
        
        // Recalculate indicators
        calculateIndicators();
        
        sendResponse({
            success: true
        });
        
        return true;
    }
    
    return false;
}

// Fetch initial data
async function fetchInitialData() {
    try {
        // Fetch historical data for all timeframes
        await fetchHistoricalData();
        
        // Calculate indicators
        calculateIndicators();
        
        // Notify popup of data update
        notifyPopup();
        
        console.log('Initial data fetched and processed');
    } catch (error) {
        console.error('Error fetching initial data:', error);
    }
}

// Fetch data
async function fetchData() {
    try {
        // Fetch ticker data
        const tickerData = await fetchTickerData();
        
        // Fetch OHLC data for all timeframes
        const timeframes = ['1m', '5m', '15m', '30m', '1h', '1d'];
        
        for (const timeframe of timeframes) {
            const ohlcData = await fetchOHLCData(timeframe);
            
            // Update historical data
            if (!historicalData[timeframe]) {
                historicalData[timeframe] = [];
            }
            
            // Add new candles
            for (const candle of ohlcData.candles) {
                // Check if candle already exists
                const existingIndex = historicalData[timeframe].findIndex(c => c.timestamp === candle.timestamp);
                
                if (existingIndex >= 0) {
                    // Update existing candle
                    historicalData[timeframe][existingIndex] = candle;
                } else {
                    // Add new candle
                    historicalData[timeframe].push(candle);
                }
            }
            
            // Sort by timestamp
            historicalData[timeframe].sort((a, b) => a.timestamp - b.timestamp);
            
            // Limit to 500 candles
            if (historicalData[timeframe].length > 500) {
                historicalData[timeframe] = historicalData[timeframe].slice(-500);
            }
        }
        
        // Calculate indicators
        calculateIndicators();
        
        // Notify popup of data update
        notifyPopup();
        
        console.log('Data fetched and processed');
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Fetch historical data
async function fetchHistoricalData() {
    try {
        const response = await fetch(`${PROXY_URL}/historical?symbol=${currentSymbol}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        // Update historical data
        historicalData = data.data;
        
        return data;
    } catch (error) {
        console.error('Error fetching historical data:', error);
        throw error;
    }
}

// Fetch ticker data
async function fetchTickerData() {
    try {
        const response = await fetch(`${PROXY_URL}/ticker?symbol=${currentSymbol}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        return data;
    } catch (error) {
        console.error('Error fetching ticker data:', error);
        throw error;
    }
}

// Fetch OHLC data
async function fetchOHLCData(timeframe) {
    try {
        const response = await fetch(`${PROXY_URL}/ohlc?symbol=${currentSymbol}&interval=${timeframe}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        return data;
    } catch (error) {
        console.error(`Error fetching OHLC data for ${timeframe}:`, error);
        throw error;
    }
}

// Calculate indicators
function calculateIndicators() {
    if (!config) {
        console.error('Configuration not loaded');
        return;
    }
    
    // Reset points and reasons
    shortPoints = 0;
    longPoints = 0;
    shortPointsReasons = [];
    longPointsReasons = [];
    candlestickPatterns = [];
    wickPatterns = [];
    alerts = [];
    
    // Calculate RSI for all timeframes
    const timeframes = ['1m', '5m', '15m', '30m', '1h', '1d'];
    
    for (const timeframe of timeframes) {
        if (historicalData[timeframe] && historicalData[timeframe].length >= 14) {
            // Calculate RSI
            const rsi = calculateRSI(historicalData[timeframe]);
            rsiValues[timeframe] = rsi;
            
            // Calculate RSI points
            calculateRSIPoints(timeframe, rsi);
        }
    }
    
    // Calculate Moving Average
    if (historicalData['1d'] && historicalData['1d'].length >= config['ma-period']) {
        calculateMovingAverage();
    }
    
    // Calculate Bollinger Bands
    if (historicalData['1d'] && historicalData['1d'].length >= config['bb-period']) {
        calculateBollingerBands();
    }
    
    // Calculate Candlestick Patterns
    for (const timeframe of timeframes) {
        if (historicalData[timeframe] && historicalData[timeframe].length >= config['candle-min-consecutive']) {
            calculateCandlestickPatterns(timeframe);
        }
    }
    
    // Calculate Wick Patterns
    for (const timeframe of timeframes) {
        if (historicalData[timeframe] && historicalData[timeframe].length >= 1) {
            calculateWickPatterns(timeframe);
        }
    }
    
    console.log('Indicators calculated');
    console.log('Short Points:', shortPoints);
    console.log('Long Points:', longPoints);
}

// Calculate RSI
function calculateRSI(candles) {
    if (candles.length < 14) {
        return null;
    }
    
    // Get closing prices
    const closes = candles.map(candle => candle.close);
    
    // Calculate price changes
    const changes = [];
    for (let i = 1; i < closes.length; i++) {
        changes.push(closes[i] - closes[i - 1]);
    }
    
    // Calculate gains and losses
    const gains = changes.map(change => change > 0 ? change : 0);
    const losses = changes.map(change => change < 0 ? Math.abs(change) : 0);
    
    // Calculate average gain and loss
    let avgGain = gains.slice(0, 14).reduce((sum, gain) => sum + gain, 0) / 14;
    let avgLoss = losses.slice(0, 14).reduce((sum, loss) => sum + loss, 0) / 14;
    
    // Calculate RSI for each period
    const rsiValues = [];
    
    // First RSI value
    let rs = avgGain / (avgLoss === 0 ? 0.001 : avgLoss); // Avoid division by zero
    let rsi = 100 - (100 / (1 + rs));
    rsiValues.push(rsi);
    
    // Remaining RSI values
    for (let i = 14; i < changes.length; i++) {
        // Update average gain and loss
        avgGain = ((avgGain * 13) + gains[i]) / 14;
        avgLoss = ((avgLoss * 13) + losses[i]) / 14;
        
        // Calculate RS and RSI
        rs = avgGain / (avgLoss === 0 ? 0.001 : avgLoss);
        rsi = 100 - (100 / (1 + rs));
        rsiValues.push(rsi);
    }
    
    // Return the most recent RSI value
    return rsiValues[rsiValues.length - 1];
}

// Calculate RSI points
function calculateRSIPoints(timeframe, rsi) {
    if (rsi === null) {
        return;
    }
    
    // Short points (RSI above thresholds)
    const shortThresholds = [
        {
            threshold: config[`rsi-${timeframe}-short-threshold1`],
            points: config[`rsi-${timeframe}-short-points1`]
        },
        {
            threshold: config[`rsi-${timeframe}-short-threshold2`],
            points: config[`rsi-${timeframe}-short-points2`]
        },
        {
            threshold: config[`rsi-${timeframe}-short-threshold3`],
            points: config[`rsi-${timeframe}-short-points3`]
        },
        {
            threshold: config[`rsi-${timeframe}-short-threshold4`],
            points: config[`rsi-${timeframe}-short-points4`]
        }
    ];
    
    // Sort by threshold in descending order
    shortThresholds.sort((a, b) => b.threshold - a.threshold);
    
    // Check if RSI is above any threshold
    for (const { threshold, points } of shortThresholds) {
        if (rsi >= threshold) {
            shortPoints += points;
            shortPointsReasons.push(`RSI ${timeframe}: ${rsi.toFixed(2)} >= ${threshold} (+${points} Short)`);
            
            // Add alert if RSI is very high
            if (rsi >= 70) {
                alerts.push(`RSI ${timeframe} Overbought: ${rsi.toFixed(2)}`);
            }
            
            break; // Only count the highest threshold
        }
    }
    
    // Long points (RSI below thresholds)
    const longThresholds = [
        {
            threshold: config[`rsi-${timeframe}-long-threshold1`],
            points: config[`rsi-${timeframe}-long-points1`]
        },
        {
            threshold: config[`rsi-${timeframe}-long-threshold2`],
            points: config[`rsi-${timeframe}-long-points2`]
        },
        {
            threshold: config[`rsi-${timeframe}-long-threshold3`],
            points: config[`rsi-${timeframe}-long-points3`]
        },
        {
            threshold: config[`rsi-${timeframe}-long-threshold4`],
            points: config[`rsi-${timeframe}-long-points4`]
        }
    ];
    
    // Sort by threshold in ascending order
    longThresholds.sort((a, b) => a.threshold - b.threshold);
    
    // Check if RSI is below any threshold
    for (const { threshold, points } of longThresholds) {
        if (rsi <= threshold) {
            longPoints += points;
            longPointsReasons.push(`RSI ${timeframe}: ${rsi.toFixed(2)} <= ${threshold} (+${points} Long)`);
            
            // Add alert if RSI is very low
            if (rsi <= 30) {
                alerts.push(`RSI ${timeframe} Oversold: ${rsi.toFixed(2)}`);
            }
            
            break; // Only count the lowest threshold
        }
    }
}

// Calculate Moving Average
function calculateMovingAverage() {
    const period = config['ma-period'];
    const candles = historicalData['1d'];
    
    if (candles.length < period) {
        return;
    }
    
    // Get closing prices
    const closes = candles.map(candle => candle.close);
    
    // Calculate MA
    const ma = closes.slice(-period).reduce((sum, close) => sum + close, 0) / period;
    maValue = ma;
    
    // Get current price
    const currentPrice = closes[closes.length - 1];
    
    // Calculate deviation
    maDeviation = ((currentPrice - ma) / ma) * 100;
    
    // Calculate points
    const basePoints = config['ma-base-points'];
    const deviationThreshold = config['ma-deviation-threshold'];
    const deviationPoints = config['ma-deviation-points'];
    
    if (currentPrice > ma) {
        // Price above MA -> Short
        shortPoints += basePoints;
        shortPointsReasons.push(`Price above MA: $${currentPrice.toFixed(2)} > $${ma.toFixed(2)} (+${basePoints} Short)`);
        
        // Check for significant deviation
        if (maDeviation >= deviationThreshold) {
            shortPoints += deviationPoints;
            shortPointsReasons.push(`Price ${maDeviation.toFixed(2)}% above MA (+${deviationPoints} Short)`);
            
            // Add alert for significant deviation
            alerts.push(`Price ${maDeviation.toFixed(2)}% above MA (1d)`);
        }
    } else {
        // Price below MA -> Long
        longPoints += basePoints;
        longPointsReasons.push(`Price below MA: $${currentPrice.toFixed(2)} < $${ma.toFixed(2)} (+${basePoints} Long)`);
        
        // Check for significant deviation
        if (Math.abs(maDeviation) >= deviationThreshold) {
            longPoints += deviationPoints;
            longPointsReasons.push(`Price ${Math.abs(maDeviation).toFixed(2)}% below MA (+${deviationPoints} Long)`);
            
            // Add alert for significant deviation
            alerts.push(`Price ${Math.abs(maDeviation).toFixed(2)}% below MA (1d)`);
        }
    }
}

// Calculate Bollinger Bands
function calculateBollingerBands() {
    const period = config['bb-period'];
    const stdDev = config['bb-std-dev'];
    const candles = historicalData['1d'];
    
    if (candles.length < period) {
        return;
    }
    
    // Get closing prices
    const closes = candles.map(candle => candle.close);
    const recentCloses = closes.slice(-period);
    
    // Calculate MA
    const ma = recentCloses.reduce((sum, close) => sum + close, 0) / period;
    
    // Calculate standard deviation
    const squaredDiffs = recentCloses.map(close => Math.pow(close - ma, 2));
    const variance = squaredDiffs.reduce((sum, diff) => sum + diff, 0) / period;
    const sd = Math.sqrt(variance);
    
    // Calculate Bollinger Bands
    const upperBand = ma + (stdDev * sd);
    const lowerBand = ma - (stdDev * sd);
    
    bbValues = {
        ma: ma,
        upperBand: upperBand,
        lowerBand: lowerBand
    };
    
    // Get current price
    const currentPrice = closes[closes.length - 1];
    
    // Calculate points
    const touchPoints = config['bb-touch-points'];
    const breakPoints = config['bb-break-points'];
    
    if (currentPrice >= upperBand) {
        // Price above upper band -> Short
        shortPoints += breakPoints;
        shortPointsReasons.push(`Price above Upper BB: $${currentPrice.toFixed(2)} >= $${upperBand.toFixed(2)} (+${breakPoints} Short)`);
        
        // Add alert
        alerts.push(`Price above Upper BB (1d)`);
    } else if (currentPrice <= lowerBand) {
        // Price below lower band -> Long
        longPoints += breakPoints;
        longPointsReasons.push(`Price below Lower BB: $${currentPrice.toFixed(2)} <= $${lowerBand.toFixed(2)} (+${breakPoints} Long)`);
        
        // Add alert
        alerts.push(`Price below Lower BB (1d)`);
    } else if (Math.abs(currentPrice - upperBand) / upperBand < 0.01) {
        // Price touching upper band -> Short
        shortPoints += touchPoints;
        shortPointsReasons.push(`Price touching Upper BB (+${touchPoints} Short)`);
    } else if (Math.abs(currentPrice - lowerBand) / lowerBand < 0.01) {
        // Price touching lower band -> Long
        longPoints += touchPoints;
        longPointsReasons.push(`Price touching Lower BB (+${touchPoints} Long)`);
    }
}

// Calculate Candlestick Patterns
function calculateCandlestickPatterns(timeframe) {
    const minConsecutive = config['candle-min-consecutive'];
    const basePoints = config['candle-base-points'];
    const additionalPoints = config['candle-additional-points'];
    const alertThreshold = config['candle-alert-threshold'];
    const candles = historicalData[timeframe];
    
    if (candles.length < minConsecutive) {
        return;
    }
    
    // Get recent candles
    const recentCandles = candles.slice(-20); // Look at last 20 candles
    
    // Check for consecutive bullish candles
    let consecutiveBullish = 0;
    for (let i = recentCandles.length - 1; i >= 0; i--) {
        const candle = recentCandles[i];
        
        if (candle.close > candle.open) {
            consecutiveBullish++;
        } else {
            break;
        }
    }
    
    // Check for consecutive bearish candles
    let consecutiveBearish = 0;
    for (let i = recentCandles.length - 1; i >= 0; i--) {
        const candle = recentCandles[i];
        
        if (candle.close < candle.open) {
            consecutiveBearish++;
        } else {
            break;
        }
    }
    
    // Calculate points for bullish candles
    if (consecutiveBullish >= minConsecutive) {
        const extraCandles = consecutiveBullish - minConsecutive;
        const points = basePoints + (extraCandles * additionalPoints);
        
        longPoints += points;
        longPointsReasons.push(`${consecutiveBullish} consecutive bullish candles (${timeframe}) (+${points} Long)`);
        
        candlestickPatterns.push({
            pattern: `${consecutiveBullish} consecutive bullish candles (${timeframe})`,
            points: points,
            direction: 'long'
        });
        
        // Add alert if threshold reached
        if (consecutiveBullish >= alertThreshold) {
            alerts.push(`${consecutiveBullish} consecutive bullish candles (${timeframe})`);
        }
    }
    
    // Calculate points for bearish candles
    if (consecutiveBearish >= minConsecutive) {
        const extraCandles = consecutiveBearish - minConsecutive;
        const points = basePoints + (extraCandles * additionalPoints);
        
        shortPoints += points;
        shortPointsReasons.push(`${consecutiveBearish} consecutive bearish candles (${timeframe}) (+${points} Short)`);
        
        candlestickPatterns.push({
            pattern: `${consecutiveBearish} consecutive bearish candles (${timeframe})`,
            points: points,
            direction: 'short'
        });
        
        // Add alert if threshold reached
        if (consecutiveBearish >= alertThreshold) {
            alerts.push(`${consecutiveBearish} consecutive bearish candles (${timeframe})`);
        }
    }
    
    // Check for large candles
    const largeThreshold = config['large-candle-threshold'];
    const largePoints = config['large-candle-points'];
    
    const lastCandle = recentCandles[recentCandles.length - 1];
    const candleSize = Math.abs(lastCandle.close - lastCandle.open) / lastCandle.open * 100;
    
    if (candleSize >= largeThreshold) {
        if (lastCandle.close > lastCandle.open) {
            // Large bullish candle
            longPoints += largePoints;
            longPointsReasons.push(`Large bullish candle: ${candleSize.toFixed(2)}% (${timeframe}) (+${largePoints} Long)`);
            
            candlestickPatterns.push({
                pattern: `Large bullish candle: ${candleSize.toFixed(2)}% (${timeframe})`,
                points: largePoints,
                direction: 'long'
            });
            
            // Add alert
            alerts.push(`Large bullish candle: ${candleSize.toFixed(2)}% (${timeframe})`);
        } else {
            // Large bearish candle
            shortPoints += largePoints;
            shortPointsReasons.push(`Large bearish candle: ${candleSize.toFixed(2)}% (${timeframe}) (+${largePoints} Short)`);
            
            candlestickPatterns.push({
                pattern: `Large bearish candle: ${candleSize.toFixed(2)}% (${timeframe})`,
                points: largePoints,
                direction: 'short'
            });
            
            // Add alert
            alerts.push(`Large bearish candle: ${candleSize.toFixed(2)}% (${timeframe})`);
        }
    }
}

// Calculate Wick Patterns
function calculateWickPatterns(timeframe) {
    const candles = historicalData[timeframe];
    
    if (candles.length < 1) {
        return;
    }
    
    // Get last candle
    const lastCandle = candles[candles.length - 1];
    
    // Calculate wick sizes
    const topWickSize = lastCandle.high - Math.max(lastCandle.open, lastCandle.close);
    const bottomWickSize = Math.min(lastCandle.open, lastCandle.close) - lastCandle.low;
    
    // Calculate body size
    const bodySize = Math.abs(lastCandle.close - lastCandle.open);
    
    // Check for long wicks
    if (topWickSize > bodySize * 2) {
        // Long top wick -> Short signal
        shortPoints += 3;
        shortPointsReasons.push(`Long top wick (${timeframe}) (+3 Short)`);
        
        wickPatterns.push({
            pattern: `Long top wick (${timeframe})`,
            points: 3,
            direction: 'short'
        });
    }
    
    if (bottomWickSize > bodySize * 2) {
        // Long bottom wick -> Long signal
        longPoints += 3;
        longPointsReasons.push(`Long bottom wick (${timeframe}) (+3 Long)`);
        
        wickPatterns.push({
            pattern: `Long bottom wick (${timeframe})`,
            points: 3,
            direction: 'long'
        });
    }
}

// Get data for popup
function getDataForPopup() {
    // Get ticker data
    let price = 0;
    let priceChange = 0;
    
    if (historicalData['1m'] && historicalData['1m'].length > 0) {
        const lastCandle = historicalData['1m'][historicalData['1m'].length - 1];
        price = lastCandle.close;
        
        if (historicalData['1d'] && historicalData['1d'].length > 1) {
            const todayOpen = historicalData['1d'][historicalData['1d'].length - 1].open;
            priceChange = ((price - todayOpen) / todayOpen) * 100;
        }
    }
    
    // Format candlestick patterns
    const formattedCandlestickPatterns = candlestickPatterns.map(pattern => pattern.pattern);
    
    // Format wick patterns
    const formattedWickPatterns = wickPatterns.map(pattern => pattern.pattern);
    
    // Calculate total points for candlestick and wick patterns
    const candlestickPoints = candlestickPatterns.reduce((sum, pattern) => sum + pattern.points, 0);
    const wickPoints = wickPatterns.reduce((sum, pattern) => sum + pattern.points, 0);
    
    return {
        symbol: currentSymbol,
        price: price,
        priceChange: priceChange,
        rsi: rsiValues,
        ma: {
            value: maValue,
            deviation: maDeviation
        },
        bb: bbValues,
        points: {
            short: shortPoints,
            long: longPoints,
            shortReasons: shortPointsReasons,
            longReasons: longPointsReasons
        },
        candlestick: {
            points: candlestickPoints,
            patterns: formattedCandlestickPatterns
        },
        wick: {
            points: wickPoints,
            patterns: formattedWickPatterns
        },
        alerts: alerts
    };
}

// Notify popup of data update
function notifyPopup() {
    chrome.runtime.sendMessage({
        action: 'UPDATE_DATA',
        data: getDataForPopup()
    });
}

// Initialize extension
initialize();
