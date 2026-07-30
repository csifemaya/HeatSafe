// File: js/weather.js
(function (root) {
  const ns = root.CSIFHeatSafe = root.CSIFHeatSafe || {};
  const weatherKey = 'csif:weather:last';

  async function fetchWeather(coords, force = false) {
    const stored = ns.utils?.storage?.get(weatherKey, null);
    if (!force && stored) {
      return stored;
    }
    try {
      const data = await ns.fetchAemetWeather(coords);
      ns.utils?.storage?.set(weatherKey, data);
      return data;
    } catch (aemetError) {
      console.warn('AEMET weather fetch failed, trying Open-Meteo', aemetError);
    }

    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,shortwave_radiation,uv_index,pressure_msl,cloud_cover,precipitation&timezone=auto`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Open-Meteo respondió con ${response.status}`);
      }
      const json = await response.json();
      const data = {
        temperature: json.current?.temperature_2m ?? stored?.temperature ?? 25,
        humidity: json.current?.relative_humidity_2m ?? stored?.humidity ?? 50,
        windSpeed: json.current?.wind_speed_10m ?? stored?.windSpeed ?? 8,
        radiation: json.current?.shortwave_radiation ?? stored?.radiation ?? 350,
        uvIndex: json.current?.uv_index ?? stored?.uvIndex ?? 3,
        pressure: json.current?.pressure_msl ?? stored?.pressure ?? 1015,
        cloudCover: json.current?.cloud_cover ?? stored?.cloudCover ?? 30,
        precipitation: json.current?.precipitation ?? stored?.precipitation ?? 0,
        timestamp: new Date().toISOString(),
        provider: 'open-meteo'
      };
      ns.utils?.storage?.set(weatherKey, data);
      return data;
    } catch (error) {
      console.warn('Open-Meteo weather fetch failed, using stored data', error);
      return stored || {
        temperature: 25,
        humidity: 50,
        windSpeed: 8,
        radiation: 350,
        uvIndex: 3,
        pressure: 1015,
        cloudCover: 30,
        precipitation: 0,
        timestamp: new Date().toISOString()
      };
    }
  }

  async function refreshWeather(force = false) {
    const coords = ns.state?.coords || { lat: 40.4168, lon: -3.7038 };
    const weather = await fetchWeather(coords, force);
    ns.state.weather = weather;
    ns.renderOverview();
    return weather;
  }

  Object.assign(ns, { fetchWeather, refreshWeather });
})(window);
