// File: js/wbgt.js
(function (root) {
  const ns = root.CSIFHeatSafe = root.CSIFHeatSafe || {};

  function getClothingCorrection(type, customValue) {
    const map = {
      verano: 0.4,
      invierno: 1.2,
      alta_visibilidad: 0.8,
      impermeable: 1.4,
      quimico: 1.9,
      bombero: 2.2,
      personalizado: Number(customValue || 1.5)
    };
    return map[type] ?? Number(customValue || 1.5);
  }

  function getMetabolicFactor(type) {
    const map = {
      reposo: 0.8,
      ligero: 1.1,
      moderado: 1.4,
      intenso: 1.8,
      'muy intenso': 2.2
    };
    return map[type] || 1.4;
  }

  function computeWetBulb(temp, humidity) {
    const rh = Math.max(5, Math.min(100, humidity));
    const t = Number(temp);
    const a = 0.151977 * Math.sqrt(rh + 8.313659);
    const b = Math.atan(t + rh);
    const c = Math.atan(rh - 1.67633);
    const d = 0.00391838 * Math.pow(rh, 1.5) * Math.atan(0.023101 * rh);
    return t * Math.atan(a) + b - c + d - 4.686035;
  }

  function computeGlobeTemp(temp, radiation) {
    return Number(temp) + Number(radiation || 0) / 1000 * 4.5 + 1.2;
  }

  function computeWBGT(data) {
    const wetBulb = computeWetBulb(data.temp, data.humidity);
    const globeTemp = computeGlobeTemp(data.temp, data.radiation);
    const indoor = 0.7 * wetBulb + 0.3 * globeTemp;
    const outdoor = 0.7 * wetBulb + 0.2 * globeTemp + 0.1 * data.temp;
    const radiationCorrection = Number(data.radiation || 0) / 1000 * 0.8;
    const clothingCorrection = getClothingCorrection(data.clothingType, data.clothingCustom);
    const acclimatizationCorrection = data.acclimatized === 'no' ? 1.2 : 0;
    const windCorrection = data.windSpeed > 2 ? -Math.min(0.9, data.windSpeed * 0.08) : 0;
    const metabolicAdjustment = getMetabolicFactor(data.workType) * (Number(data.metabolismManual || 170) / 180) * 0.15;
    const finalWBGT = outdoor + radiationCorrection + clothingCorrection * 0.15 + acclimatizationCorrection + windCorrection + metabolicAdjustment;
    return {
      wetBulb,
      globeTemp,
      indoor,
      outdoor,
      finalWBGT,
      radiationCorrection,
      clothingCorrection,
      acclimatizationCorrection,
      windCorrection,
      metabolicAdjustment
    };
  }

  function classifyRisk(wbgt) {
    if (wbgt < 24) return { level: 'bajo', color: 'success', label: 'Riesgo bajo' };
    if (wbgt < 28) return { level: 'moderado', color: 'warning', label: 'Riesgo moderado' };
    if (wbgt < 31) return { level: 'alto', color: 'danger', label: 'Riesgo alto' };
    if (wbgt < 34) return { level: 'muy alto', color: 'danger', label: 'Riesgo muy alto' };
    return { level: 'extremo', color: 'danger', label: 'Riesgo extremo' };
  }

  function buildRecommendations(risk, workType) {
    const map = {
      bajo: [
        'Mantener hidratación frecuente.',
        'Planificar pausas de 5 minutos cada 45 minutos.',
        'Revisar sombra y ventilación.'
      ],
      moderado: [
        'Hidratación cada 15-20 minutos.',
        'Tiempo máximo de exposición de 90 minutos.',
        'Establecer descansos de 10 minutos por hora.'
      ],
      alto: [
        'Aumentar la frecuencia de hidratación a cada 10 minutos.',
        'Limitar la exposición a 60 minutos.',
        'Priorizar sombra y rotación del personal.'
      ],
      'muy alto': [
        'Revisar la necesidad de suspensión temporal del trabajo.',
        'Implementar vigilancia sanitaria y descanso obligatorio.',
        'Evitar exposiciones prolongadas.'
      ],
      extremo: [
        'Suspender temporalmente el trabajo al aire libre.',
        'Activar vigilancia sanitaria y monitorización.',
        'Cambiar el horario o reubicar la tarea.'
      ]
    };
    const base = map[risk.level] || map.bajo;
    if (workType === 'intenso' || workType === 'muy intenso') {
      base.push('Reducir la intensidad o rotar al personal.');
    }
    return base;
  }

  Object.assign(ns, {
    computeWBGT,
    classifyRisk,
    buildRecommendations,
    getClothingCorrection,
    getMetabolicFactor
  });
})(window);
