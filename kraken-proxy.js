// Kraken API Proxy Server for AlertCrypto Matrix 2025
// This proxy handles all API requests to Kraken and provides data to the extension

const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
const PORT = 3001;

// Enable CORS for extension
app.use(cors());

// Cache for API responses
const cache = {
    ticker: {},
    ohlc: {},
    historical: {}
};

// Cache expiration times (in milliseconds)
const CACHE_EXPIRY = {
    ticker: 10 * 1000, // 10 seconds
    ohlc: 60 * 1000,   // 1 minute
    historical: 5 * 60 * 1000 // 5 minutes
};

// Kraken API base URL
const KRAKEN_API_URL = 'https://api.kraken.com/0/public';

// Kraken pair mapping
const krakenPairMapping = {
    'BTC': 'XXBTZUSD', // Bitcoin
    'ETH': 'XETHZUSD', // Ethereum
    'SOL': 'SOLUSD',   // Solana
    'BNB': 'BNBUSD',   // Binance Coin
    'AVAX': 'AVAXUSD'  // Avalanche
};

// Timeframe mapping for OHLC data
const timeframeMapping = {
    '1m': 1,
    '5m': 5,
    '15m': 15,
    '30m': 30,
    '1h': 60,
    '4h': 240,
    '1d': 1440
};

// Rate limiting
const requestCounts = {};
const RATE_LIMIT = 15; // requests per minute
const RATE_WINDOW = 60 * 1000; // 1 minute in milliseconds

// Middleware for rate limiting
function rateLimiter(req, res, next) {
    const ip = req.ip;
    const now = Date.now();
    
    // Initialize or clean up old requests
    if (!requestCounts[ip] || now - requestCounts[ip].timestamp > RATE_WINDOW) {
        requestCounts[ip] = {
            count: 0,
            timestamp: now
        };
    }
    
    // Increment request count
    requestCounts[ip].count++;
    
    // Check if rate limit exceeded
    if (requestCounts[ip].count > RATE_LIMIT) {
        return res.status(429).json({
            error: 'Rate limit exceeded. Please try again later.'
        });
    }
    
    next();
}

// Apply rate limiter to all routes
app.use(rateLimiter);

// Endpoint for ticker data
app.get('/api/ticker', async (req, res) => {
    try {
        const symbol = req.query.symbol || 'BTC';
        const pair = krakenPairMapping[symbol] || krakenPairMapping.BTC;
        
        // Check cache
        if (cache.ticker[symbol] && Date.now() - cache.ticker[symbol].timestamp < CACHE_EXPIRY.ticker) {
            return res.json(cache.ticker[symbol].data);
        }
        
        // Fetch from Kraken API
        const response = await axios.get(`${KRAKEN_API_URL}/Ticker?pair=${pair}`);
        
        if (response.data.error && response.data.error.length > 0) {
            throw new Error(response.data.error[0]);
        }
        
        const tickerData = response.data.result[pair];
        
        // Format response
        const formattedData = {
            symbol: symbol,
            price: parseFloat(tickerData.c[0]),
            volume: parseFloat(tickerData.v[1]),
            priceChange: calculatePriceChange(tickerData),
            high: parseFloat(tickerData.h[1]),
            low: parseFloat(tickerData.l[1]),
            timestamp: Date.now()
        };
        
        // Update cache
        cache.ticker[symbol] = {
            data: formattedData,
            timestamp: Date.now()
        };
        
        res.json(formattedData);
    } catch (error) {
        console.error('Error fetching ticker data:', error);
        res.status(500).json({
            error: 'Failed to fetch ticker data from Kraken API'
        });
    }
});

// Endpoint for OHLC data
app.get('/api/ohlc', async (req, res) => {
    try {
        const symbol = req.query.symbol || 'BTC';
        const interval = req.query.interval || '1m';
        const since = req.query.since || null;
        
        const pair = krakenPairMapping[symbol] || krakenPairMapping.BTC;
        const intervalValue = timeframeMapping[interval] || 1;
        
        // Create cache key
        const cacheKey = `${symbol}_${interval}_${since || 'latest'}`;
        
        // Check cache
        if (cache.ohlc[cacheKey] && Date.now() - cache.ohlc[cacheKey].timestamp < CACHE_EXPIRY.ohlc) {
            return res.json(cache.ohlc[cacheKey].data);
        }
        
        // Build request URL
        let url = `${KRAKEN_API_URL}/OHLC?pair=${pair}&interval=${intervalValue}`;
        if (since) {
            url += `&since=${since}`;
        }
        
        // Fetch from Kraken API
        const response = await axios.get(url);
        
        if (response.data.error && response.data.error.length > 0) {
            throw new Error(response.data.error[0]);
        }
        
        const ohlcData = response.data.result[pair];
        const lastTimestamp = response.data.result.last;
        
        // Format candles
        const candles = ohlcData.map(candle => ({
            timestamp: candle[0] * 1000, // Convert to milliseconds
            open: parseFloat(candle[1]),
            high: parseFloat(candle[2]),
            low: parseFloat(candle[3]),
            close: parseFloat(candle[4]),
            volume: parseFloat(candle[6])
        }));
        
        // Format response
        const formattedData = {
            symbol: symbol,
            interval: interval,
            candles: candles,
            lastTimestamp: lastTimestamp
        };
        
        // Update cache
        cache.ohlc[cacheKey] = {
            data: formattedData,
            timestamp: Date.now()
        };
        
        res.json(formattedData);
    } catch (error) {
        console.error('Error fetching OHLC data:', error);
        res.status(500).json({
            error: 'Failed to fetch OHLC data from Kraken API'
        });
    }
});

// Endpoint for historical data (all timeframes)
app.get('/api/historical', async (req, res) => {
    try {
        const symbol = req.query.symbol || 'BTC';
        
        // Check cache
        if (cache.historical[symbol] && Date.now() - cache.historical[symbol].timestamp < CACHE_EXPIRY.historical) {
            return res.json(cache.historical[symbol].data);
        }
        
        // Fetch data for all timeframes
        const timeframes = ['1m', '5m', '15m', '30m', '1h', '1d'];
        const historicalData = {};
        
        // Fetch data for each timeframe
        for (const timeframe of timeframes) {
            const pair = krakenPairMapping[symbol] || krakenPairMapping.BTC;
            const intervalValue = timeframeMapping[timeframe] || 1;
            
            // Fetch from Kraken API
            const url = `${KRAKEN_API_URL}/OHLC?pair=${pair}&interval=${intervalValue}`;
            const response = await axios.get(url);
            
            if (response.data.error && response.data.error.length > 0) {
                throw new Error(response.data.error[0]);
            }
            
            const ohlcData = response.data.result[pair];
            
            // Format candles
            const candles = ohlcData.map(candle => ({
                timestamp: candle[0] * 1000, // Convert to milliseconds
                open: parseFloat(candle[1]),
                high: parseFloat(candle[2]),
                low: parseFloat(candle[3]),
                close: parseFloat(candle[4]),
                volume: parseFloat(candle[6])
            }));
            
            historicalData[timeframe] = candles;
        }
        
        // Format response
        const formattedData = {
            symbol: symbol,
            data: historicalData
        };
        
        // Update cache
        cache.historical[symbol] = {
            data: formattedData,
            timestamp: Date.now()
        };
        
        res.json(formattedData);
    } catch (error) {
        console.error('Error fetching historical data:', error);
        res.status(500).json({
            error: 'Failed to fetch historical data from Kraken API'
        });
    }
});

// Helper function to calculate price change percentage
function calculatePriceChange(tickerData) {
    const currentPrice = parseFloat(tickerData.c[0]);
    const openPrice = parseFloat(tickerData.o);
    
    return ((currentPrice - openPrice) / openPrice) * 100;
}

// Start server
app.listen(PORT, () => {
    console.log(`Kraken API Proxy Server running on port ${PORT}`);
    console.log(`Access the API at http://localhost:${PORT}/api/`);
});
