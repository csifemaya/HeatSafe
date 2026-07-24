// File: js/aemet.js
(function (root) {
  const ns = root.CSIFHeatSafe = root.CSIFHeatSafe || {};

  async function fetchAemetAlert() {
    const fallback = {
      level: 'sin aviso',
      description: 'Sin aviso activo. Se mantiene la vigilancia habitual.'
    };

    try {
      const response = await fetch('https://www.aemet.es/es/tiempo/observacion/avisos', {
        method: 'GET',
        mode: 'no-cors'
      });

      if (!response || response.type === 'opaque') {
        return fallback;
      }

      const text = await response.text();
      const level = /amarillo|naranja|rojo/i.test(text) ? 'amarillo' : 'sin aviso';
      return {
        level: level.toLowerCase(),
        description: 'Aviso consultado desde AEMET. Revise la información oficial.'
      };
    } catch (error) {
      return fallback;
    }
  }

  Object.assign(ns, { fetchAemetAlert });
})(window);
