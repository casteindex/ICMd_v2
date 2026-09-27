const estacionesDemo = [
    {
        id: 1,
        code: 'PC-01',
        name: 'Estacion 1',
        location: 'Fila 1',
        operatingSystem: 'WINDOWS',
        classId: 1,
        status: 'OK',
        cpuPercent: 35,
        memoryPercent: 62,
        lastReport: 'hace 12s',
        ignored: false
    },
    {
        id: 2,
        code: 'PC-02',
        name: 'Estacion 2',
        location: 'Fila 2',
        operatingSystem: 'LINUX',
        classId: 1,
        status: 'INTERNET',
        cpuPercent: 51,
        memoryPercent: 44,
        lastReport: 'hace 33s',
        ignored: false
    }
    ,
    {
        id: 3,
        code: 'PC-03',
        name: 'Estacion 3',
        location: 'Fila 3',
        operatingSystem: 'MACOS',
        classId: 1, status: 'IA',
        cpuPercent: null,
        memoryPercent: null,
        lastReport: 'hace 2m',
        ignored: false
    }
    ,
    {
        id: 4,
        code: 'PC-04',
        name: 'Estacion 4',
        location: 'Fila 4',
        operatingSystem: 'WINDOWS',
        classId: 1,
        status: 'OK',
        cpuPercent: null,
        memoryPercent: null,
        lastReport: 'hace 5m',
        ignored: true
    }
    ,
    {
        id: 5,
        code: 'PC-05',
        name: 'Estacion 5',
        location: 'Fila 5',
        operatingSystem: 'CHROMEOS',
        classId: 1,
        status: 'OK',
        cpuPercent: 29,
        memoryPercent: 38,
        lastReport: 'hace 18s',
        ignored: false
    },
];

const copyEstacion = (estacion) => ({ ...estacion });

export const crearEstacionSimulada = async ({ classId, code, name, location, operatingSystem }) => {
    const normalizedCode = code.trim().toUpperCase();
    const normalizedName = name.trim();
    const normalizedLocation = location.trim();

    if (!normalizedCode || !normalizedName || !normalizedLocation || !operatingSystem) {
        throw new Error('Completa todos los campos.');
    }
    if (normalizedCode.length < 3 || normalizedCode.length > 20) {
        throw new Error('El código debe tener entre 3 y 20 caracteres.');
    }
    if (normalizedName.length < 3) {
        throw new Error('El nombre debe tener al menos 3 caracteres.');
    }
    if (estacionesDemo.some((station) => station.classId === Number(classId) && station.code === normalizedCode)) {
        throw new Error('Ya existe una estación con ese código en esta clase.');
    }

    const station = {
        id: Math.max(...estacionesDemo.map((item) => item.id)) + 1,
        code: normalizedCode,
        name: normalizedName,
        location: normalizedLocation,
        operatingSystem,
        classId: Number(classId),
        status: 'OK',
        cpuPercent: null,
        memoryPercent: null,
        lastReport: 'sin reportes',
        ignored: false,
    };

    estacionesDemo.push(station);
    return copyEstacion(station);
};

export const listarEstaciones = async ({ classId = 1 } = {}) => (
    estacionesDemo.filter((estacion) => estacion.classId === Number(classId)).map(copyEstacion)
);

export const obtenerEstacion = async (id) => {
    const estacion = estacionesDemo.find((item) => item.id === Number(id));
    return estacion ? copyEstacion(estacion) : null;
};

export const actualizarEstacionSimulada = async (id, changes) => {
    const station = estacionesDemo.find((item) => item.id === Number(id));
    if (!station) throw new Error('La estación no existe.');

    const code = changes.code.trim().toUpperCase();
    const name = changes.name.trim();
    const location = changes.location.trim();
    if (!code || !name || !location || !changes.operatingSystem) throw new Error('Completa todos los campos.');
    if (code.length < 3 || code.length > 20) throw new Error('El código debe tener entre 3 y 20 caracteres.');
    if (name.length < 3) throw new Error('El nombre debe tener al menos 3 caracteres.');
    if (estacionesDemo.some((item) => item.id !== station.id && item.classId === station.classId && item.code === code)) {
        throw new Error('Ya existe una estación con ese código en esta clase.');
    }

    Object.assign(station, { code, name, location, operatingSystem: changes.operatingSystem });
    return copyEstacion(station);
};

export const eliminarEstacionSimulada = async (id) => {
    const index = estacionesDemo.findIndex((item) => item.id === Number(id));
    if (index === -1) throw new Error('La estación no existe.');
    estacionesDemo.splice(index, 1);
};