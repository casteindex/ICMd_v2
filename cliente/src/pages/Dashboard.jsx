import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { listarClases } from '../services/clasesService';
import { listarEstaciones } from '../services/estacionesService';

const statusLabels = { OK: 'Ok', ADVERTENCIA: 'Advertencia', CRITICO: 'Crítico', SIN_REPORTES: 'Sin reportes' };

const Dashboard = () => {
	const [clases, setClases] = useState([]);
	const [estaciones, setEstaciones] = useState([]);
	const [selectedClassId, setSelectedClassId] = useState(1);
	const [query, setQuery] = useState('');
	const [statusFilter, setStatusFilter] = useState('all');

	useEffect(() => {
		listarClases({ active: true }).then(setClases);
	}, []);

	useEffect(() => {
		listarEstaciones({ classId: selectedClassId }).then(setEstaciones);
	}, [selectedClassId]);

	const filteredStations = useMemo(() => estaciones.filter((station) => {
		const text = `${station.code} ${station.name} ${station.location}`.toLowerCase();
		const stationStatus = station.ignored ? 'ignored' : station.status;
		const matchesQuery = text.includes(query.toLowerCase());
		const matchesStatus = statusFilter === 'all' || stationStatus === statusFilter;
		return matchesQuery && matchesStatus;
	}), [estaciones, query, statusFilter]);

	const counts = useMemo(() => ({
		active: estaciones.filter((station) => !station.ignored).length,
		ok: estaciones.filter((station) => station.status === 'OK' && !station.ignored).length,
		warning: estaciones.filter((station) => station.status === 'ADVERTENCIA' && !station.ignored).length,
		critical: estaciones.filter((station) => station.status === 'CRITICO' && !station.ignored).length,
		ignored: estaciones.filter((station) => station.ignored).length,
	}), [estaciones]);

	const selectedClass = clases.find((clase) => clase.id === selectedClassId);
	const formatOs = (os) => ({ WINDOWS: 'Windows', LINUX: 'Linux', MACOS: 'macOS', CHROMEOS: 'ChromeOS' }[os]);

	return (
		<div className="page-wrap dashboard-page">
			<section className="monitor-toolbar">
				<select value={selectedClassId} onChange={(event) => setSelectedClassId(Number(event.target.value))} aria-label="Seleccionar clase">
					{clases.map((clase) => <option value={clase.id} key={clase.id}>{clase.code} · {clase.name}</option>)}
				</select>
				<strong>{selectedClass ? `Sección ${selectedClass.section} · ${selectedClass.location}` : 'Cargando clase...'}</strong>
				<span className="api-status"><span /> API conectada</span>
			</section>

			<section className="monitor-stats" aria-label="Resumen de estaciones">
				<div className="monitor-total">
					<span>Activas</span><strong>{counts.active}</strong>
				</div>
				<div className="monitor-stat stat-ok">
					<span>Ok</span><strong>{counts.ok}</strong>
				</div>
				<div className="monitor-stat stat-warning">
					<span>Advertencia</span><strong>{counts.warning}</strong>
				</div>
				<div className="monitor-stat stat-critical">
					<span>Critico</span><strong>{counts.critical}</strong>
				</div>
				<div className="monitor-total">
					<span>Ignoradas</span><strong>{counts.ignored}</strong>
				</div>
			</section>

			<section className="station-panel">
				<div className="station-toolbar">
					<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por codigo, nombre o ubicacion" aria-label="Buscar estaciones" />
					<select aria-label="Filtrar por estado" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
						<option value="all">Todos los estados</option>
						<option value="OK">Ok</option>
						<option value="ADVERTENCIA">Advertencia</option>
						<option value="CRITICO">Critico</option>
						<option value="SIN_REPORTES">Sin reportes</option>
						<option value="ignored">Ignorada</option>
					</select>
				</div>
				<div className="station-table-wrap">
					<table className="station-table">
						<thead>
							<tr>
								<th>Codigo</th>
								<th>Nombre</th>
								<th>Ubicacion</th>
								<th>SO</th>
								<th>Ult. act.</th>
								<th>CPU</th>
								<th>Mem</th>
								<th>Estado</th>
								<th />
							</tr>
						</thead>
						<tbody>{filteredStations.map((station) => (
							<tr key={station.id}>
								<td>{station.code}</td>
								<td>{station.name}</td>
								<td>{station.location}</td>
								<td>{formatOs(station.operatingSystem)}</td>
								<td>{station.lastReport}</td>
								<td>{station.cpuPercent ? `${station.cpuPercent}%` : '—'}</td>
								<td>{station.memoryPercent ? `${station.memoryPercent}%` : '—'}</td>
								<td>
									<span className={`status-pill status-${station.ignored ? 'ignored' : station.status.toLowerCase()}`}><span />{station.ignored ? 'Ignorada' : statusLabels[station.status]}</span>
								</td>
							</tr>
						))}</tbody>
					</table>
				</div>
			</section>

			<Link className="monitor-back" to="/estaciones">Administrar estaciones <span aria-hidden="true"></span></Link>
		</div>
	);
};

export default Dashboard;
