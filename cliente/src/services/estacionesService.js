import { apiFetch } from './api';

const formatLastReport = (lastReport) => {
    if (!lastReport?.createdAt) return 'Sin reportes';

    const elapsedSeconds = Math.max(0, Math.floor((Date.now() - new Date(lastReport.createdAt).getTime()) / 1000));
    if (elapsedSeconds < 60) return `hace ${elapsedSeconds}s`;
    return `hace ${Math.floor(elapsedSeconds / 60)}m`;
};

const mapStation = (station) => ({
    ...station,
    status: station.calculatedStatus || 'SIN_REPORTES',
    cpuPercent: station.lastReport?.cpuPercent ?? null,
    memoryPercent: station.lastReport?.memoryPercent ?? null,
    lastReport: formatLastReport(station.lastReport),
});

export const listarEstaciones = ({ classId, q = '' } = {}) =>
    apiFetch(`/stations?classId=${classId}&q=${encodeURIComponent(q)}`)
        .then((stations) => stations.map(mapStation));

export const obtenerEstacion = (id) => apiFetch(`/stations/${id}`)
    .then((data) => ({
        ...data,
        station: mapStation({
            ...data.station,
            calculatedStatus: data.calculatedStatus,
            lastReport: data.lastReport,
        }),
    }));

export const crearEstacion = (data) => apiFetch('/stations', {
    method: 'POST',
    body: JSON.stringify(data),
});

export const actualizarEstacion = (id, data) => apiFetch(`/stations/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
});

export const cambiarIgnorada = (id, ignored) => apiFetch(`/stations/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ ignored }),
});

export const eliminarEstacion = (id) => apiFetch(`/stations/${id}`, {
    method: 'DELETE',
});