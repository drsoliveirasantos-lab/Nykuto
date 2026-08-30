export const PILOT_LOCATION_BOUNDS = Object.freeze({
  minLatitude: -25.9,
  maxLatitude: -24.8,
  minLongitude: -55.1,
  maxLongitude: -54.2
});

export function roundPublicCoordinate(value) {
  if (value === null || value === undefined || String(value).trim() === '') return null;
  const coordinate = Number(value);
  return Number.isFinite(coordinate) ? Number(coordinate.toFixed(4)) : null;
}

export function isPilotCoordinate(latitudeValue, longitudeValue) {
  if (latitudeValue === null || latitudeValue === undefined || String(latitudeValue).trim() === '') return false;
  if (longitudeValue === null || longitudeValue === undefined || String(longitudeValue).trim() === '') return false;
  const latitude = Number(latitudeValue);
  const longitude = Number(longitudeValue);
  return Number.isFinite(latitude)
    && Number.isFinite(longitude)
    && latitude >= PILOT_LOCATION_BOUNDS.minLatitude
    && latitude <= PILOT_LOCATION_BOUNDS.maxLatitude
    && longitude >= PILOT_LOCATION_BOUNDS.minLongitude
    && longitude <= PILOT_LOCATION_BOUNDS.maxLongitude;
}

export function geolocationErrorMessage(error) {
  if (error?.code === 1) return 'A localização foi recusada. Autorize o acesso nas configurações do navegador ou marque o ponto no mapa.';
  if (error?.code === 2) return 'O aparelho não conseguiu determinar sua localização. Tente novamente ao ar livre ou marque o ponto no mapa.';
  if (error?.code === 3) return 'A localização demorou demais. Tente novamente ou marque o ponto no mapa.';
  return 'Não foi possível usar sua localização neste navegador. Busque um endereço ou marque o ponto no mapa.';
}

export function deviceAccuracyLabel(value) {
  const accuracy = Number(value);
  if (!Number.isFinite(accuracy) || accuracy <= 0) return '';
  if (accuracy < 1000) return `precisão do aparelho ~${Math.max(10, Math.round(accuracy / 10) * 10)} m`;
  return `precisão do aparelho ~${(accuracy / 1000).toFixed(1).replace('.', ',')} km`;
}
