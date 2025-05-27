// dashboard.js
document.addEventListener('DOMContentLoaded', () => {
  const symbolSelect = document.getElementById('dashboard-asset-select');

  // When user changes asset, tell background and reload widget
  symbolSelect.addEventListener('change', () => {
    const sym = symbolSelect.value;
    chrome.runtime.sendMessage({ action: 'CHANGE_SYMBOL', symbol: sym }, resp => {
      if (resp.success) loadTradingViewWidget(sym);
    });
  });

  // Initial widget load
  loadTradingViewWidget(symbolSelect.value);

  // Poll background for data every second
  setInterval(() => {
    chrome.runtime.sendMessage({ action: 'GET_DATA' }, resp => {
      if (!resp.success) return;
      const d = resp.data;

      // Price & change
      document.getElementById('dashboard-price').textContent = `$${d.price.toFixed(2)}`;
      document.getElementById('dashboard-price-change').textContent = `(${d.change.toFixed(2)}%)`;

      // MA & deviation
      document.getElementById('dashboard-ma').textContent = `$${d.ma.toFixed(2)}`;
      document.getElementById('dashboard-ma-deviation').textContent = `${d.maDeviation.toFixed(2)}%`;

      // RSI table
      ['1m','5m','15m','30m','1h','1d'].forEach(tf => {
        const el = document.getElementById(`dashboard-rsi-${tf}`);
        el.textContent = d.rsi[tf].toFixed(1);
        el.classList.toggle('overbought', d.rsi[tf] >= 70);
        el.classList.toggle('oversold',   d.rsi[tf] <= 30);
      });

      // Points
      document.getElementById('dashboard-short-points').textContent = d.shortPoints;
      document.getElementById('dashboard-long-points').textContent  = d.longPoints;

      // Reasons & Alerts
      document.getElementById('short-points-reasons').innerHTML = d.shortReasons.join('<br>');
      document.getElementById('long-points-reasons').innerHTML  = d.longReasons.join('<br>');
      document.getElementById('dashboard-alerts').innerHTML      = d.alerts.length
        ? d.alerts.map(a => `<div class="alert-item">${a}</div>`).join('')
        : 'No alerts';
    });
  }, 1000);
});

/**
 * Instantiate the TradingView widget in the #tradingview-container
 */
function loadTradingViewWidget(symbol) {
  const container = document.getElementById('tradingview-container');
  container.innerHTML = ''; // clear old chart
  new TradingView.widget({
    symbol: symbol,
    interval: '60',
    container_id: 'tradingview-container',
    toolbar_bg: '#000000',
    theme: 'dark',
    width: '100%',
    height: '300'
  });
}
