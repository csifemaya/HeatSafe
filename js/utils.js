// File: js/utils.js
(function (root) {
  const ns = root.CSIFHeatSafe = root.CSIFHeatSafe || {};
  const storage = {
    get(key, fallback) {
      try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch (e) { return fallback; }
    },
    set(key, value) {
      localStorage.setItem(key, JSON.stringify(value));
    },
    remove(key) {
      localStorage.removeItem(key);
    }
  };

  function formatDate(value) {
    const date = value ? new Date(value) : new Date();
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  function formatTime(value) {
    const date = value ? new Date(value) : new Date();
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  }

  function formatTemperature(value, unit = 'metric') {
    const v = Number(value ?? 0);
    return unit === 'metric' ? `${v.toFixed(1)} °C` : `${(v * 9 / 5 + 32).toFixed(1)} °F`;
  }

  function formatHumidity(value) {
    return `${Number(value ?? 0).toFixed(0)} %`;
  }

  function formatSpeed(value, unit = 'metric') {
    const v = Number(value ?? 0);
    return unit === 'metric' ? `${v.toFixed(1)} km/h` : `${(v / 1.609).toFixed(1)} mph`;
  }

  function formatPressure(value) {
    return `${Number(value ?? 0).toFixed(0)} hPa`;
  }

  function setTheme(theme) {
    document.body.classList.toggle('dark', theme === 'dark');
  }

  function getSetting(key, fallback) {
    return storage.get(`csif:${key}`, fallback);
  }

  function setSetting(key, value) {
    storage.set(`csif:${key}`, value);
  }

  function getCompany() {
    return storage.get('csif:company', {
      name: 'CSIF',
      responsible: 'Responsable',
      service: 'Seguridad y salud',
      phone: '000 000 000',
      email: 'contacto@empresa.es',
      logo: 'img/logo.png'
    });
  }

  function setCompany(company) {
    storage.set('csif:company', company);
  }

  ns.utils = {
    storage,
    formatDate,
    formatTime,
    formatTemperature,
    formatHumidity,
    formatSpeed,
    formatPressure,
    setTheme,
    getSetting,
    setSetting,
    getCompany,
    setCompany
  };
})(window);
