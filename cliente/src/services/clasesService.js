import { apiFetch } from './api';

export const listarClases = ({ active } = {}) => {
	const query = active === undefined ? '' : `?active=${active}`;
	return apiFetch(`/classes${query}`);
};

export const obtenerClase = (id) => apiFetch(`/classes/${id}`);

export const crearClase = (data) => apiFetch('/classes', {
	method: 'POST',
	body: JSON.stringify(data),
});

export const actualizarClase = (id, data) => apiFetch(`/classes/${id}`, {
	method: 'PUT',
	body: JSON.stringify(data),
});

export const eliminarClase = (id) => apiFetch(`/classes/${id}`, {
	method: 'DELETE',
});