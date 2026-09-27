const estadosValidos = ['OK', 'INTERNET', 'IA'];

export const enviarReporteSimulado = async (estacionEnviada, datosReporte) => {
    const { declaredStatus, agentVersion, ipAddress, cpuPercent, memoryPercent } = datosReporte;

    if (!estacionEnviada)
        throw new Error('Selecciona una estacion');
    if (!estadosValidos.includes(declaredStatus))
        throw new Error('Selecciona un estado valido');
    if (!agentVersion.trim() || !ipAddress.trim())
        throw new Error('Completa la IP');
    if ([cpuPercent, memoryPercent].some((value) => value < 0 || value > 100)) {
        throw new Error('CPU y memoria deben estar entre 0 y 100');
    }

    await new Promise((resolve) => setTimeout(resolve, 350));

    return {
        id: Date.now(),
        stationId: estacionEnviada.id,
        stationCode: estacionEnviada.code,
        stationName: estacionEnviada.name,
        declaredStatus,
        agentVersion: agentVersion.trim(),
        ipAddress: ipAddress.trim(),
        cpuPercent: Number(cpuPercent),
        memoryPercent: Number(memoryPercent),
        createdAt: new Date().toISOString(),
        calculatedStatus: declaredStatus === 'OK' ? 'OK' : 'CRITICO',
    };
};