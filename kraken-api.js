// Updated Kraken API Integration for AlertCrypto Matrix 2025
// Now using proxy server for all API requests

// Constants
const PROXY_BASE_URL = 'http://localhost:3001/api';

// Symbol mapping from extension symbols to display names
const symbolMapping = {
    'BTC': 'Bitcoin',
    'ETH': 'Ethereum',
    'SOL': 'Solana',
    'BNB': 'Binance Coin',
    'AVAX': 'Avalanche'
};

// Symbol mapping from extension symbols to Kraken pairs
const krakenPairMapping = {
    'BTC': 'XXBTZUSD', // Bitcoin
    'ETH': 'XETHZUSD', // Ethereum
    'SOL': 'SOLUSD',   // Solana
    'BNB': 'BNBUSD',   // Binance Coin
    'AVAX': 'AVAXUSD'  // Avalanche
};

// Timeframe mapping
const timeframeMapping = {
    '1m': '1 minute',
    '5m': '5 minutes',
    '15m': '15 minutes',
    '30m': '30 minutes',
    '1h': '1 hour',
    '1d': '1 day'
};

// Get current ticker information through proxy
async function getTickerInfo(symbol) {
    try {
        const response = await fetch(`${PROXY_BASE_URL}/ticker?symbol=${symbol}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error(`Error fetching ticker for ${symbol}:`, error);
        return null;
    }
}

// Get OHLC data through proxy
async function getOHLCData(symbol, interval, since = null) {
    try {
        let url = `${PROXY_BASE_URL}/ohlc?symbol=${symbol}&interval=${interval}`;
        if (since) {
            url += `&since=${since}`;
        }
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data.candles;
    } catch (error) {
        console.error(`Error fetching OHLC data for ${symbol}:`, error);
        return null;
    }
}

// Backfill historical data for all timeframes through proxy
async function backfillHistoricalData(symbol) {
    console.log(`Backfilling historical data for ${symbol}`);
    
    try {
        const response = await fetch(`${PROXY_BASE_URL}/historical?symbol=${symbol}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error(`Error backfilling historical data for ${symbol}:`, error);
        return null;
    }
}

// Export functions and constants
export {
    getTickerInfo,
    getOHLCData,
    backfillHistoricalData,
    symbolMapping,
    timeframeMapping,
    krakenPairMapping
};
