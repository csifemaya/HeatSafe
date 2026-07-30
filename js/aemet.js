// File: js/aemet.js
(function (root) {
  const ns = root.CSIFHeatSafe = root.CSIFHeatSafe || {};
  const apiKey = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJqb2FuY2FybGVzbmljb2xhdUBnbWFpbC5jb20iLCJqdGkiOiIwMzk3OTI0ZC00YTI5LTQyNjEtOWQxMC1hMGEzNTQ5ZDQ0NjEiLCJleHAiOjE3OTQwODc1OTEsImlzcyI6IkFFTUVUIiwiaWF0IjoxNzg1NDQ3NTkxLCJ1c2VySWQiOiIwMzk3OTI0ZC00YTI5LTQyNjEtOWQxMC1hMGEzNTQ5ZDQ0NjEiLCJyb2xlIjoiIn0.AV1y-qaSrTW4BNbTF7KnG2B6_EYI5LO8pRZZABtR2Nw';
  const observationsEndpoint = 'https://opendata.aemet.es/opendata/api/observacion/convencional/todas';

  async function fetchAemetResource(endpoint) {
    const response = await fetch(`${endpoint}?api_key=${encodeURIComponent(apiKey)}`);
    const resource = await response.json();
    if (!response.ok || resource.estado !== 200 || !resource.datos) {
      throw new Error(resource.descripcion || `AEMET respondió con ${response.status}`);
    }
    const dataResponse = await fetch(resource.datos);
    if (!dataResponse.ok) {
      throw new Error(`AEMET no pudo entregar los datos (${dataResponse.status})`);
    }
    return dataResponse.json();
  }

  function distanceBetween(first, second) {
    const latDelta = (first.lat - second.lat) * Math.PI / 180;
    const lonDelta = (first.lon - second.lon) * Math.PI / 180;
    const lat = first.lat * Math.PI / 180;
    const otherLat = second.lat * Math.PI / 180;
    const value = Math.sin(latDelta / 2) ** 2 + Math.cos(lat) * Math.cos(otherLat) * Math.sin(lonDelta / 2) ** 2;
    return 6371 * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
  }

  function parseCoordinate(value) {
    if (typeof value === 'number') return value;
    const text = String(value || '').trim();
    const decimal = Number(text);
    if (Number.isFinite(decimal)) return decimal;
    const match = text.match(/^(\d{2,3})(\d{2})(\d{2})([NSEW])$/i);
    if (!match) return NaN;
    const coordinate = Number(match[1]) + Number(match[2]) / 60 + Number(match[3]) / 3600;
    return /[SW]/i.test(match[4]) ? -coordinate : coordinate;
  }

  function stationCoordinates(station) {
    return {
      lat: parseCoordinate(station.lat ?? station.latitud),
      lon: parseCoordinate(station.lon ?? station.longitud)
    };
  }

  async function fetchAemetWeather(coords) {
    const [observations, stations] = await Promise.all([
      fetchAemetResource(observationsEndpoint),
      fetchAemetResource('https://opendata.aemet.es/opendata/api/maestros/estaciones')
    ]);
    const stationById = new Map(stations.map((station) => [station.indicativo, station]));
    const target = { lat: Number(coords.lat), lon: Number(coords.lon) };
    const candidates = observations
      .map((observation) => ({ observation, station: stationById.get(observation.idema) }))
      .map((candidate) => ({ ...candidate, coordinates: candidate.station && stationCoordinates(candidate.station) }))
      .filter(({ observation, coordinates }) => coordinates && Number.isFinite(coordinates.lat) && Number.isFinite(coordinates.lon) && Number.isFinite(Number(observation.ta)) && Number.isFinite(Number(observation.hr)));
    const nearest = candidates.sort((first, second) => {
      const firstDistance = distanceBetween(target, first.coordinates);
      const secondDistance = distanceBetween(target, second.coordinates);
      return firstDistance - secondDistance;
    })[0];

    if (!nearest) {
      throw new Error('AEMET no tiene observaciones válidas para estas coordenadas.');
    }

    const observation = nearest.observation;
    return {
      temperature: Number(observation.ta),
      humidity: Number(observation.hr),
      windSpeed: Number(observation.vv || 0) * 3.6,
      radiation: Number(observation.psol || 0),
      uvIndex: 0,
      pressure: Number(observation.pres || 1015),
      cloudCover: 0,
      precipitation: Number(observation.prec || 0),
      timestamp: observation.fint || new Date().toISOString(),
      provider: 'aemet',
      station: nearest.station.nombre
    };
  }

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

  Object.assign(ns, { fetchAemetAlert, fetchAemetWeather });
})(window);
