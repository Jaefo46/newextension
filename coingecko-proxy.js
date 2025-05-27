// AlertCrypto-Matrix-2025 Proxy Server
// Robust proxy for CoinGecko API with rate limiting and caching

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const NodeCache = require('node-cache');

// Configuration
const config = {
    port: 3001,
    apiKey: 'CG-6JY1u9yTik2CJeR9qZJmsfFT',
    baseUrl: 'https://pro-api.coingecko.com/api/v3',
    rateLimit: {
        maxRequests: 300, // Well under the 500/minute limit
        windowMs: 60000, // 1 minute
        maxMonthly: 400000 // Well under the 500,000/month limit
    },
    cache: {
        price: 30, // 30 seconds
        marketChart: 120, // 2 minutes
        coin: 300, // 5 minutes
        candles: 180 // 3 minutes
    },
    retryDelay: 2000, // 2 seconds
    maxRetries: 3
};

// Create Express app
const app = express();

// Enable CORS for all routes
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Create cache
const cache = new NodeCache({
    stdTTL: 60, // Default TTL: 60 seconds
    checkperiod: 120, // Check for expired keys every 2 minutes
    useClones: false
});

// Rate limiting
let requestCount = 0;
let monthlyRequestCount = 0;
let lastReset = Date.now();
let monthlyReset = new Date().setDate(1); // First day of the month

// Reset request count every minute
setInterval(() => {
    requestCount = 0;
    lastReset = Date.now();
    
    // Log current rate
    console.log(`Rate limit reset. Current monthly usage: ${monthlyRequestCount}/${config.rateLimit.maxMonthly}`);
}, config.rateLimit.windowMs);

// Reset monthly count on the first day of each month
setInterval(() => {
    const now = new Date();
    if (now.getDate() === 1 && now > monthlyReset) {
        monthlyRequestCount = 0;
        monthlyReset = new Date().setDate(1); // First day of next month
        console.log('Monthly rate limit reset');
    }
}, 24 * 60 * 60 * 1000); // Check daily

// Rate limit middleware
function rateLimitMiddleware(req, res, next) {
    // Check if rate limit exceeded
    if (requestCount >= config.rateLimit.maxRequests) {
        return res.status(429).json({
            error: 'Rate limit exceeded',
            message: 'Too many requests, please try again later',
            resetIn: Math.ceil((lastReset + config.rateLimit.windowMs - Date.now()) / 1000)
        });
    }
    
    // Check if monthly limit exceeded
    if (monthlyRequestCount >= config.rateLimit.maxMonthly) {
        return res.status(429).json({
            error: 'Monthly rate limit exceeded',
            message: 'Monthly API limit reached',
            resetDate: new Date(monthlyReset).toISOString()
        });
    }
    
    // Increment counters
    requestCount++;
    monthlyRequestCount++;
    
    console.log(`Request count: ${requestCount}/${config.rateLimit.maxRequests} (minute), ${monthlyRequestCount}/${config.rateLimit.maxMonthly} (month)`);
    
    next();
}

// Helper function to make API requests with retries
async function makeRequest(endpoint, params = {}, retries = 0) {
    try {
        // Add API key to headers only (not as query parameter)
        const headers = {
            'x-cg-pro-api-key': config.apiKey
        };
        
        const url = `${config.baseUrl}${endpoint}`;
        
        console.log(`Making request to: ${url}`);
        
        const response = await axios.get(url, {
            params,
            headers
        });
        
        return response.data;
    } catch (error) {
        console.error(`Error making request to ${endpoint}:`, error.message);
        
        // Check if we should retry
        if (retries < config.maxRetries) {
            console.log(`Retrying request to ${endpoint} (${retries + 1}/${config.maxRetries})...`);
            await new Promise(resolve => setTimeout(resolve, config.retryDelay));
            return makeRequest(endpoint, params, retries + 1);
        }
        
        // Handle specific error codes
        if (error.response) {
            const status = error.response.status;
            
            if (status === 401) {
                console.error('API key unauthorized. Check your CoinGecko API key.');
                throw { status: 401, message: 'API key unauthorized. Check your CoinGecko API key.' };
            } else if (status === 429) {
                console.error('Rate limit exceeded. Please try again later.');
                throw { status: 429, message: 'Rate limit exceeded. Please try again later.' };
            } else {
                console.error(`API error: ${status} - ${error.response.data?.error || 'Unknown error'}`);
                throw { status, message: `API error: ${status} - ${error.response.data?.error || 'Unknown error'}` };
            }
        }
        
        throw { status: 500, message: `Request failed: ${error.message}` };
    }
}

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        rateLimit: {
            current: requestCount,
            max: config.rateLimit.maxRequests,
            resetIn: Math.ceil((lastReset + config.rateLimit.windowMs - Date.now()) / 1000)
        },
        monthlyUsage: {
            current: monthlyRequestCount,
            max: config.rateLimit.maxMonthly,
            resetDate: new Date(monthlyReset).toISOString()
        },
        cache: {
            keys: cache.keys().length,
            stats: cache.getStats()
        },
        config: {
            apiKey: config.apiKey ? '****' + config.apiKey.slice(-4) : 'Not set',
            port: config.port
        }
    });
});

// Get price endpoint
app.get('/api/price', rateLimitMiddleware, async (req, res) => {
    try {
        const { symbol } = req.query;
        
        if (!symbol) {
            return res.status(400).json({ error: 'Symbol parameter is required' });
        }
        
        // Check cache
        const cacheKey = `price_${symbol.toLowerCase()}`;
        const cachedData = cache.get(cacheKey);
        
        if (cachedData) {
            console.log(`Cache hit for ${cacheKey}`);
            return res.json(cachedData);
        }
        
        console.log(`Cache miss for ${cacheKey}, fetching from API`);
        
        // Make API request
        const data = await makeRequest('/simple/price', {
            ids: symbol.toLowerCase(),
            vs_currencies: 'usd',
            include_24hr_change: true
        });
        
        // Cache response
        cache.set(cacheKey, data, config.cache.price);
        
        res.json(data);
    } catch (error) {
        console.error('Error in /api/price:', error);
        res.status(error.status || 500).json({ error: error.message });
    }
});

// Get multiple prices endpoint
app.get('/api/prices', rateLimitMiddleware, async (req, res) => {
    try {
        const { symbols } = req.query;
        
        if (!symbols) {
            return res.status(400).json({ error: 'Symbols parameter is required' });
        }
        
        const symbolsArray = symbols.split(',');
        
        // Check cache
        const cacheKey = `prices_${symbolsArray.sort().join('_').toLowerCase()}`;
        const cachedData = cache.get(cacheKey);
        
        if (cachedData) {
            console.log(`Cache hit for ${cacheKey}`);
            return res.json(cachedData);
        }
        
        console.log(`Cache miss for ${cacheKey}, fetching from API`);
        
        // Make API request
        const data = await makeRequest('/simple/price', {
            ids: symbolsArray.join(',').toLowerCase(),
            vs_currencies: 'usd',
            include_24hr_change: true
        });
        
        // Cache response
        cache.set(cacheKey, data, config.cache.price);
        
        res.json(data);
    } catch (error) {
        console.error('Error in /api/prices:', error);
        res.status(error.status || 500).json({ error: error.message });
    }
});

// Get market chart endpoint
app.get('/api/market_chart', rateLimitMiddleware, async (req, res) => {
    try {
        const { symbol, days, interval } = req.query;
        
        if (!symbol || !days) {
            return res.status(400).json({ error: 'Symbol and days parameters are required' });
        }
        
        // Check cache
        const cacheKey = `market_chart_${symbol.toLowerCase()}_${days}_${interval || 'daily'}`;
        const cachedData = cache.get(cacheKey);
        
        if (cachedData) {
            console.log(`Cache hit for ${cacheKey}`);
            return res.json(cachedData);
        }
        
        console.log(`Cache miss for ${cacheKey}, fetching from API`);
        
        // Make API request
        const data = await makeRequest(`/coins/${symbol.toLowerCase()}/market_chart`, {
            vs_currency: 'usd',
            days,
            interval: interval || 'daily'
        });
        
        // Cache response
        cache.set(cacheKey, data, config.cache.marketChart);
        
        res.json(data);
    } catch (error) {
        console.error('Error in /api/market_chart:', error);
        res.status(error.status || 500).json({ error: error.message });
    }
});

// Get coin data endpoint
app.get('/api/coin', rateLimitMiddleware, async (req, res) => {
    try {
        const { symbol } = req.query;
        
        if (!symbol) {
            return res.status(400).json({ error: 'Symbol parameter is required' });
        }
        
        // Check cache
        const cacheKey = `coin_${symbol.toLowerCase()}`;
        const cachedData = cache.get(cacheKey);
        
        if (cachedData) {
            console.log(`Cache hit for ${cacheKey}`);
            return res.json(cachedData);
        }
        
        console.log(`Cache miss for ${cacheKey}, fetching from API`);
        
        // Make API request
        const data = await makeRequest(`/coins/${symbol.toLowerCase()}`, {
            localization: false,
            tickers: false,
            market_data: true,
            community_data: false,
            developer_data: false
        });
        
        // Cache response
        cache.set(cacheKey, data, config.cache.coin);
        
        res.json(data);
    } catch (error) {
        console.error('Error in /api/coin:', error);
        res.status(error.status || 500).json({ error: error.message });
    }
});

// Get candles endpoint
app.get('/api/candles', rateLimitMiddleware, async (req, res) => {
    try {
        const { symbol, days } = req.query;
        
        if (!symbol) {
            return res.status(400).json({ error: 'Symbol parameter is required' });
        }
        
        // Check cache
        const cacheKey = `candles_${symbol.toLowerCase()}_${days || '1'}`;
        const cachedData = cache.get(cacheKey);
        
        if (cachedData) {
            console.log(`Cache hit for ${cacheKey}`);
            return res.json(cachedData);
        }
        
        console.log(`Cache miss for ${cacheKey}, fetching from API`);
        
        // For candles, we need to use the market_chart endpoint and transform the data
        const data = await makeRequest(`/coins/${symbol.toLowerCase()}/market_chart`, {
            vs_currency: 'usd',
            days: days || '1',
            interval: '5m' // Use 5-minute intervals for candle data
        });
        
        // Transform data into candle format
        const candles = [];
        const prices = data.prices;
        
        for (let i = 0; i < prices.length; i += 12) { // Group by hour (12 * 5min = 1hr)
            if (i + 11 < prices.length) {
                const hourPrices = prices.slice(i, i + 12).map(p => p[1]);
                const timestamp = prices[i][0];
                const open = hourPrices[0];
                const close = hourPrices[hourPrices.length - 1];
                const high = Math.max(...hourPrices);
                const low = Math.min(...hourPrices);
                
                candles.push([timestamp, open, high, low, close]);
            }
        }
        
        // Cache response
        cache.set(cacheKey, candles, config.cache.candles);
        
        res.json(candles);
    } catch (error) {
        console.error('Error in /api/candles:', error);
        res.status(error.status || 500).json({ error: error.message });
    }
});

// Test endpoint to verify API key
app.get('/api/test', rateLimitMiddleware, async (req, res) => {
    try {
        // Make a simple ping request to verify API key
        const data = await makeRequest('/ping');
        res.json({
            status: 'success',
            message: 'API key is valid',
            data
        });
    } catch (error) {
        console.error('Error in /api/test:', error);
        res.status(error.status || 500).json({ error: error.message });
    }
});

// Start server
app.listen(config.port, '0.0.0.0', () => {
    console.log(`AlertCrypto-Matrix-2025 proxy server running on port ${config.port}`);
    console.log(`Using CoinGecko API key: ${config.apiKey}`);
    console.log(`Rate limit: ${config.rateLimit.maxRequests} requests per minute (max 500)`);
    console.log(`Monthly limit: ${config.rateLimit.maxMonthly} requests per month (max 500,000)`);
    console.log('Available endpoints:');
    console.log('  - /health');
    console.log('  - /api/price?symbol=BTC');
    console.log('  - /api/prices?symbols=BTC,ETH,SOL');
    console.log('  - /api/market_chart?symbol=BTC&days=1&interval=1m');
    console.log('  - /api/coin?symbol=BTC');
    console.log('  - /api/candles?symbol=BTC&days=1');
    console.log('  - /api/test');
});
