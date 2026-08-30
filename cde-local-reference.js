// Ciudad del Este commonly describes locations by their approximate kilometre
// along Ruta PY02 and by the side of the road. This is a local orientation aid,
// not the national PY02 chainage.
//
// The axis starts near the Paraguayan end of Ponte da Amizade and is calibrated
// at local Km 8 between UCP Plaza City (Acaray) and UCP Hospital (Monday).
const CDE_KM_ORIGIN = Object.freeze({ latitude: -25.5096, longitude: -54.602 });
const CDE_KM_EIGHT_ANCHOR = Object.freeze({ latitude: -25.5013, longitude: -54.6788 });
const CDE_MIN_PROJECTED_KILOMETRE = 3.5;
const CDE_MAX_PROJECTED_KILOMETRE = 13.5;
const CDE_MAX_CROSS_TRACK_KM = 4;
const CDE_SIDE_THRESHOLD_KM = 0.15;
const KM_PER_LATITUDE_DEGREE = 111.32;
const KM_PER_LONGITUDE_DEGREE = KM_PER_LATITUDE_DEGREE
  * Math.cos(CDE_KM_ORIGIN.latitude * Math.PI / 180);

function localVector(latitude, longitude) {
  return {
    x: (longitude - CDE_KM_ORIGIN.longitude) * KM_PER_LONGITUDE_DEGREE,
    y: (latitude - CDE_KM_ORIGIN.latitude) * KM_PER_LATITUDE_DEGREE
  };
}

const axis = localVector(CDE_KM_EIGHT_ANCHOR.latitude, CDE_KM_EIGHT_ANCHOR.longitude);
const axisLengthKm = Math.hypot(axis.x, axis.y);

export function deriveCdeLocalReference(latitudeValue, longitudeValue) {
  const latitude = Number(latitudeValue);
  const longitude = Number(longitudeValue);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)
    || latitude < -26 || latitude > -25 || longitude < -55.2 || longitude > -54.2) return null;

  const point = localVector(latitude, longitude);
  const alongTrackKm = ((point.x * axis.x) + (point.y * axis.y)) / axisLengthKm;
  const projectedKilometre = alongTrackKm * (8 / axisLengthKm);
  const crossTrackKm = ((axis.x * point.y) - (axis.y * point.x)) / axisLengthKm;
  if (projectedKilometre < CDE_MIN_PROJECTED_KILOMETRE
    || projectedKilometre > CDE_MAX_PROJECTED_KILOMETRE
    || Math.abs(crossTrackKm) > CDE_MAX_CROSS_TRACK_KM) return null;

  const side = crossTrackKm >= CDE_SIDE_THRESHOLD_KM
    ? 'Monday'
    : crossTrackKm <= -CDE_SIDE_THRESHOLD_KM ? 'Acaray' : '';
  return `Km ${Math.round(projectedKilometre)}${side ? ` · lado ${side}` : ''} (aprox.)`;
}
