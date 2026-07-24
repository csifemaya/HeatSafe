// File: js/charts.js
(function (root) {
  const ns = root.CSIFHeatSafe = root.CSIFHeatSafe || {};
  let historyChart = null;

  function renderCharts() {
    const ctx = document.getElementById('historyChart');
    if (!ctx) return;
    const history = ns.getHistory();
    const labels = history.slice(0, 8).map((entry) => entry.date).reverse();
    const wbgt = history.slice(0, 8).map((entry) => Number(entry.wbgtValue ?? entry.wbgt)).reverse();
    const temp = history.slice(0, 8).map((entry) => Number(entry.temperatureValue ?? entry.temperature)).reverse();
    const humidity = history.slice(0, 8).map((entry) => Number(entry.humidityValue ?? entry.humidity)).reverse();
    if (historyChart) historyChart.destroy();
    historyChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          { label: 'WBGT', data: wbgt, borderColor: '#00529B', tension: .3 },
          { label: 'Temperatura', data: temp, borderColor: '#dc3545', tension: .3, yAxisID: 'y1' },
          { label: 'Humedad', data: humidity, borderColor: '#198754', tension: .3, yAxisID: 'y2' }
        ]
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: false },
          y1: { beginAtZero: false, position: 'right' },
          y2: { beginAtZero: false, position: 'right' }
        }
      }
    });
  }

  Object.assign(ns, { renderCharts });
})(window);
