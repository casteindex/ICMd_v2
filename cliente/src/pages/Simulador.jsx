import { useEffect, useMemo, useState } from 'react';
import { listarEstaciones } from '../services/estacionesService';
import { enviarReporteSimulado } from '../services/reportsService';

const Simulador = () => {
    //placeholders que es texto en este caso
    const [estaciones, setEstaciones] = useState([]);
    const [stationId, setStationId] = useState('');
    const [declaredStatus, setDeclaredStatus] = useState('OK');
    const [agentVersion, setAgentVersion] = useState('1.0.0');
    const [ipAddress, setIpAddress] = useState('192.168.1.21');
    const [cpuPercent, setCpuPercent] = useState(35);
    const [memoryPercent, setMemoryPercent] = useState(62);
    const [history, setHistory] = useState([]);
    const [requestState, setRequestState] = useState('idle');
    const [message, setMessage] = useState('');

    useEffect(() => {
        listarEstaciones({ classId: 1 }).then((result) => {
            setEstaciones(result);
            setStationId(String(result[0]?.id || ''));
        });
    }, []);

    const selectedStation = useMemo(
        () => estaciones.find((station) => station.id === Number(stationId)),
        [estaciones, stationId],
    );

    const handleSubmit = async (event) => {
        event.preventDefault();
        setRequestState('loading');
        setMessage('');

        try {
            const report = await enviarReporteSimulado(selectedStation, {
                declaredStatus,
                agentVersion,
                ipAddress,
                cpuPercent,
                memoryPercent,
            });
            setHistory((current) => [report, ...current]);
            setRequestState('success');
            setMessage(`${report.stationCode} declaró ${report.declaredStatus} correctamente.`);
        } catch (error) {
            setRequestState('error');
            setMessage(error.message);
        }
    };

    return (
        <div className="page-wrap simulator-page">
            <section className="simulator-heading">
                <div>
                    <p className="section-kicker">Heartbeat</p>
                    <h1>Simulador</h1>
                    <p className="dashboard-subtitle">Envia un reporte en base a una simulacion</p>
                </div>
                <span className="simulator-note">Datos simulados</span>
            </section>

            <div className="simulator-layout">
                <form className="simulator-form" onSubmit={handleSubmit}>
                    <label htmlFor="simulator-station">Estacion</label>
                    <select id="simulator-station" value={stationId} onChange={(event) => setStationId(event.target.value)} required>
                        <option value="" disabled>Selecciona una estacion</option>
                        {estaciones.map((station) => <option value={station.id} key={station.id}>{station.code} · {station.name}</option>)}
                    </select>

                    <label htmlFor="simulator-status">Estado declarado</label>
                    <select id="simulator-status" value={declaredStatus} onChange={(event) => setDeclaredStatus(event.target.value)}>
                        <option value="OK">OK</option><option value="INTERNET">INTERNET</option>
                        <option value="IA">IA</option>
                    </select>

                    <div className="simulator-fields-row">
                        <div><label htmlFor="agent-version">Version del agente</label>
                            <input id="agent-version" value={agentVersion} onChange={(event) => setAgentVersion(event.target.value)} />
                        </div>
                        <div>
                            <label htmlFor="ip-address">IP simulada</label>
                            <input id="ip-address" value={ipAddress} onChange={(event) => setIpAddress(event.target.value)} />
                        </div>
                    </div>

                    <div className="range-field">
                        <div>
                            <label htmlFor="cpu-percent">CPU (%)</label>
                            <output htmlFor="cpu-percent">{cpuPercent}</output>
                        </div>
                        <input id="cpu-percent" type="range" min="0" max="100" value={cpuPercent} onChange={(event) => setCpuPercent(Number(event.target.value))} />
                    </div>
                    <div className="range-field">
                        <div>
                            <label htmlFor="memory-percent">Memoria (%)</label>
                            <output htmlFor="memory-percent">{memoryPercent}</output>
                        </div>
                        <input id="memory-percent" type="range" min="0" max="100" value={memoryPercent} onChange={(event) => setMemoryPercent(Number(event.target.value))} />
                    </div>

                    {message && <p className={`simulator-message simulator-${requestState}`} role={requestState === 'error' ? 'alert' : 'status'}>{message}</p>}
                    <button className="button button-primary simulator-submit" type="submit" disabled={requestState === 'loading'}>{requestState === 'loading' ? 'Enviando...' : 'Enviar reporte'}
                        <span aria-hidden="true"></span>
                    </button>
                </form>

                <section className="simulator-history" aria-labelledby="history-title">
                    {requestState === 'success' && history[0] && <div className="simulator-result">
                        {/*mensaje de exito */}
                        <span>Ultimo envio aceptado</span>
                        <strong>{history[0].stationCode} · declaro {history[0].declaredStatus}</strong>
                        <small>CPU {history[0].cpuPercent}% · Mem {history[0].memoryPercent}% · calculatedStatus: {history[0].calculatedStatus}</small>
                    </div>}
                    <h2 id="history-title">Historial de envios <span>(esta sesion)</span></h2>
                    {history.length === 0 ?
                        <div className="simulator-history-empty">Todavia no hay reportes enviados</div> :
                        <div className="simulator-history-list">{history.map((report) => <div className="simulator-history-row" key={report.id}>
                            <time>{new Intl.DateTimeFormat('es', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(new Date(report.createdAt))}
                            </time>
                            <strong>{report.stationCode}</strong>
                            <span>{report.declaredStatus}</span>
                            <span>{report.cpuPercent}% / {report.memoryPercent}%</span>
                        </div>)}
                        </div>}
                </section>
            </div>
        </div>
    );
};

export default Simulador;