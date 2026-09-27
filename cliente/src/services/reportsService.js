import { apiFetch } from './api';

export const enviarReporte = (stationId, data) => apiFetch(`/stations/${stationId}/reports`, {
    method: 'POST',
    body: JSON.stringify(data),
});