// File: js/app.js
(function (root) {
  const ns = root.CSIFHeatSafe = root.CSIFHeatSafe || {};
  ns.state = {
    coords: { lat: 40.4168, lon: -3.7038 },
    weather: {},
    lastRisk: null,
    history: []
  };

  function getCurrentInputs() {
    return {
      workType: document.getElementById('workType').value,
      metabolismManual: Number(document.getElementById('metabolismManual').value || 180),
      clothingType: document.getElementById('clothingType').value,
      clothingCustom: Number(document.getElementById('clothingCustom').value || 1.5),
      acclimatized: document.getElementById('acclimatized').value,
      temp: Number(ns.state.weather.temperature || 25),
      humidity: Number(ns.state.weather.humidity || 50),
      radiation: Number(ns.state.weather.radiation || 350),
      windSpeed: Number(ns.state.weather.windSpeed || 8)
    };
  }

  function updateClock() {
    const clock = document.getElementById('clockBadge');
    if (clock) clock.textContent = `${ns.utils.formatDate(new Date())} · ${ns.utils.formatTime(new Date())}`;
  }

  function renderOverview() {
    const weather = ns.state.weather || {};
    document.getElementById('tempValue').textContent = ns.utils.formatTemperature(weather.temperature, ns.state.units || 'metric');
    document.getElementById('humidityValue').textContent = ns.utils.formatHumidity(weather.humidity);
    document.getElementById('windValue').textContent = ns.utils.formatSpeed(weather.windSpeed, ns.state.units || 'metric');
    document.getElementById('radiationValue').textContent = `${Number(weather.radiation || 0).toFixed(0)} W/m²`;
    document.getElementById('riskBadge').textContent = ns.state.lastRisk?.label || 'Evaluando…';
    document.getElementById('riskBadge').className = `badge rounded-pill text-bg-${ns.state.lastRisk?.color || 'secondary'}`;

    const wbgtData = ns.computeWBGT({
      ...getCurrentInputs(),
      temp: weather.temperature,
      humidity: weather.humidity,
      radiation: weather.radiation,
      windSpeed: weather.windSpeed
    });
    ns.state.lastRisk = ns.classifyRisk(wbgtData.finalWBGT);
    ns.state.lastWBGT = wbgtData.finalWBGT;
    const list = document.getElementById('wbgtList');
    list.innerHTML = `
      <li><strong>Bulbo húmedo:</strong> ${wbgtData.wetBulb.toFixed(1)} °C</li>
      <li><strong>Temperatura globo:</strong> ${wbgtData.globeTemp.toFixed(1)} °C</li>
      <li><strong>WBGT interior:</strong> ${wbgtData.indoor.toFixed(1)} °C</li>
      <li><strong>WBGT exterior:</strong> ${wbgtData.outdoor.toFixed(1)} °C</li>
      <li><strong>Corrección radiación:</strong> ${wbgtData.radiationCorrection.toFixed(1)} °C</li>
      <li><strong>Corrección ropa:</strong> ${wbgtData.clothingCorrection.toFixed(1)} °C</li>
      <li><strong>Corrección aclimatación:</strong> ${wbgtData.acclimatizationCorrection.toFixed(1)} °C</li>
      <li><strong>Corrección viento:</strong> ${wbgtData.windCorrection.toFixed(1)} °C</li>
      <li><strong>WBGT final:</strong> ${wbgtData.finalWBGT.toFixed(1)} °C</li>
    `;
    const recs = ns.buildRecommendations(ns.state.lastRisk, document.getElementById('workType').value);
    const recContainer = document.getElementById('recommendationsList');
    recContainer.innerHTML = recs.map((item) => `<div class="list-group-item">${item}</div>`).join('');
    document.getElementById('statusBadge').textContent = `${ns.state.lastRisk.label} · ${ns.state.weather.temperature?.toFixed(1)} °C`;
  }

  function loadConfig() {
    const theme = ns.utils.getSetting('theme', 'light');
    const language = ns.utils.getSetting('language', 'es');
    const interval = ns.utils.getSetting('interval', '300000');
    const units = ns.utils.getSetting('units', 'metric');
    ns.state.units = units;
    document.getElementById('themeSelect').value = theme;
    document.getElementById('languageSelect').value = language;
    document.getElementById('intervalSelect').value = interval;
    document.getElementById('unitsSelect').value = units;
    ns.utils.setTheme(theme);
  }

  function saveConfig() {
    ns.utils.setSetting('theme', document.getElementById('themeSelect').value);
    ns.utils.setSetting('language', document.getElementById('languageSelect').value);
    ns.utils.setSetting('interval', document.getElementById('intervalSelect').value);
    ns.utils.setSetting('units', document.getElementById('unitsSelect').value);
    ns.utils.setTheme(document.getElementById('themeSelect').value);
    alert('Configuración guardada');
  }

  function saveHistoryEntry() {
    const weather = ns.state.weather || {};
    const entry = {
      date: ns.utils.formatDate(new Date()),
      time: ns.utils.formatTime(new Date()),
      gps: `${ns.state.coords.lat.toFixed(3)}, ${ns.state.coords.lon.toFixed(3)}`,
      wbgt: `${(ns.state.lastWBGT ?? 0).toFixed(1)} °C`,
      wbgtValue: Number(ns.state.lastWBGT ?? 0),
      temperature: `${weather.temperature?.toFixed(1) || '--'} °C`,
      temperatureValue: Number(weather.temperature ?? 0),
      humidity: `${weather.humidity?.toFixed(0) || '--'} %`,
      humidityValue: Number(weather.humidity ?? 0),
      work: document.getElementById('workType').value,
      result: ns.state.lastRisk?.label || 'N/A',
      comment: prompt('Añada un comentario', 'Sin observaciones') || 'Sin observaciones'
    };
    ns.saveEntry(entry);
    ns.renderHistory('');
    ns.renderCharts();
    alert('Registro guardado en historial');
  }

  function bindEvents() {
    document.querySelectorAll('[data-tab]').forEach((button) => {
      button.addEventListener('click', () => {
        document.querySelectorAll('.tab-pane').forEach((pane) => pane.classList.add('d-none'));
        document.querySelectorAll('[data-tab]').forEach((item) => item.classList.remove('active'));
        const pane = document.getElementById(button.getAttribute('data-tab'));
        pane.classList.remove('d-none');
        button.classList.add('active');
      });
    });
    document.getElementById('refreshWeather').addEventListener('click', () => ns.refreshWeather(true));
    document.getElementById('saveHistoryBtn').addEventListener('click', saveHistoryEntry);
    document.getElementById('saveConfigBtn').addEventListener('click', saveConfig);
    document.getElementById('generatePdf').addEventListener('click', () => ns.generateReport());
    document.getElementById('historySearch').addEventListener('input', (event) => ns.renderHistory(event.target.value));
    document.getElementById('exportHistoryBtn').addEventListener('click', () => ns.exportHistory());
    ['workType', 'clothingType', 'acclimatized', 'metabolismManual', 'clothingCustom'].forEach((id) => {
      document.getElementById(id).addEventListener('change', renderOverview);
      document.getElementById(id).addEventListener('input', renderOverview);
    });
    document.getElementById('themeSelect').addEventListener('change', (event) => ns.utils.setTheme(event.target.value));
  }

  ns.renderOverview = renderOverview;

  async function init() {
    updateClock();
    loadConfig();
    bindEvents();
    await ns.startLocation();
    await ns.refreshWeather(true);
    ns.renderOverview();
    ns.renderHistory('');
    ns.renderCharts();
    ns.pwa.init();
    ns.fetchAemetAlert().then((alert) => {
      const badge = document.getElementById('aemetAlert');
      badge.textContent = alert.level.toUpperCase();
      badge.className = `alert alert-${alert.level === 'rojo' ? 'danger' : alert.level === 'naranja' ? 'warning' : alert.level === 'amarillo' ? 'info' : 'secondary'} mb-2`;
      document.getElementById('aemetDesc').textContent = alert.description;
    });
    setInterval(() => {
      updateClock();
      ns.refreshWeather(false);
    }, Number(ns.utils.getSetting('interval', '300000')));
  }

  document.addEventListener('DOMContentLoaded', init);
})(window);
