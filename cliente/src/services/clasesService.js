const clasesDemo = [
	{
		id: 1,
		code: 'CCC312',
		name: 'Desarrollo Web',
		section: '1401',
		location: 'Laboratorio 3/204',
		schedule: 'Lunes y miércoles, 10:00 - 11:30',
		active: true,
		createdAt: '2026-09-01T14:30:00.000Z',
		updatedAt: '2026-09-18T09:15:00.000Z',
		_count: { stations: 24 },
	},
	{
		id: 2,
		code: 'IAR101',
		name: 'Introduccion a ciencia de datos',
		section: '1202',
		location: 'Laboratorio 3/306',
		schedule: 'Martes y jueves, 13:00 - 14:30',
		active: true,
		createdAt: '2026-08-28T16:00:00.000Z',
		updatedAt: '2026-09-12T11:45:00.000Z',
		_count: { stations: 18 },
	},
	{
		id: 3,
		code: 'CCC208',
		name: 'Programacion III',
		section: '1101',
		location: 'Laboratorio 3/211',
		schedule: 'Viernes, 01:00 - 5:00',
		active: true,
		createdAt: '2026-08-20T10:20:00.000Z',
		updatedAt: '2026-09-20T08:10:00.000Z',
		_count: { stations: 20 },
	},
];

const copyClase = (clase) => ({ ...clase, _count: { ...clase._count } });

export const listarClases = async ({ active } = {}) => {
	const clases = active === undefined
		? clasesDemo
		: clasesDemo.filter((clase) => clase.active === active);

	return clases.map(copyClase);
};

export const obtenerClase = async (id) => {
	const clase = clasesDemo.find((item) => item.id === Number(id));
	return clase ? copyClase(clase) : null;
};