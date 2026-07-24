// File: js/pwa.js
(function (root) {
  const ns = root.CSIFHeatSafe = root.CSIFHeatSafe || {};

  function init() {
    if ('serviceWorker' in navigator && location.protocol !== 'file:') {
      navigator.serviceWorker.register('./service-worker.js').catch(console.error);
    }
    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      document.getElementById('statusBadge').textContent = 'Listo para instalar';
    });
  }

  Object.assign(ns, { pwa: { init } });
})(window);
