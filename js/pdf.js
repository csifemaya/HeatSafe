// File: js/pdf.js
(function (root) {
  const ns = root.CSIFHeatSafe = root.CSIFHeatSafe || {};

  function buildReportHtml() {
    const company = ns.utils?.getCompany?.() || {};
    const weather = ns.state?.weather || {};
    const risk = ns.state?.lastRisk || { label: 'Sin evaluar' };
    return `
      <div style="font-family: Arial, sans-serif; padding: 24px; color: #14213d;">
        <h2 style="color:#00529B; margin-bottom: 8px;">CSIF HeatSafe</h2>
        <p style="margin:0 0 12px;">Informe profesional de evaluación de riesgo térmico</p>
        <hr>
        <p><strong>Empresa:</strong> ${company.name || 'CSIF'}</p>
        <p><strong>Responsable:</strong> ${company.responsible || 'Sin datos'}</p>
        <p><strong>Servicio:</strong> ${company.service || 'Sin datos'}</p>
        <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-ES')}</p>
        <p><strong>GPS:</strong> ${ns.state?.coords ? `${ns.state.coords.lat.toFixed(4)}, ${ns.state.coords.lon.toFixed(4)}` : 'Sin datos'}</p>
        <p><strong>Temperatura:</strong> ${weather.temperature ?? '--'} °C</p>
        <p><strong>Humedad:</strong> ${weather.humidity ?? '--'} %</p>
        <p><strong>Viento:</strong> ${weather.windSpeed ?? '--'} km/h</p>
        <p><strong>WBGT:</strong> ${Number(ns.state?.lastWBGT ?? 0).toFixed(1)} °C</p>
        <p><strong>Resultado:</strong> ${risk.label}</p>
        <p><strong>Recomendaciones:</strong></p>
        <ul>${(ns.buildRecommendations ? ns.buildRecommendations(risk, document.getElementById('workType')?.value || 'moderado') : []).map((item) => `<li>${item}</li>`).join('')}</ul>
        <div style="margin-top: 24px;">
          <p>________________________</p>
          <p>Firma responsable</p>
        </div>
      </div>
    `;
  }

  function generateReport() {
    const reportWindow = window.open('', '_blank', 'width=900,height=700');
    if (!reportWindow) {
      alert('Permite las ventanas emergentes para generar el informe.');
      return;
    }

    const html = buildReportHtml();
    reportWindow.document.write(`<!doctype html><html><head><title>Informe CSIF HeatSafe</title><style>body{font-family:Arial,sans-serif;padding:24px;}</style></head><body>${html}</body></html>`);
    reportWindow.document.close();
    reportWindow.focus();
    reportWindow.print();
  }

  Object.assign(ns, { generateReport });
})(window);
