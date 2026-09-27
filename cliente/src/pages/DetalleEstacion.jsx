import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { actualizarEstacion, cambiarIgnorada, eliminarEstacion, obtenerEstacion } from '../services/estacionesService';
import StationEditModal from '../components/StationEditModal';
import ConfirmModal from '../components/ConfirmModal';

const osLabels = { WINDOWS: 'Windows', LINUX: 'Linux', MACOS: 'macOS', CHROMEOS: 'ChromeOS' };
const statusLabels = { OK: 'Ok', ADVERTENCIA: 'Advertencia', CRITICO: 'Crítico', SIN_REPORTES: 'Sin reportes' };

const formatDate = (date) => date
	? new Intl.DateTimeFormat('es', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(date))
	: 'Sin información';

const DetalleEstacion = () => {
	const { id } = useParams();
	const [data, setData] = useState(null);
	const [status, setStatus] = useState('loading');
	const [isEditOpen, setIsEditOpen] = useState(false);
	const [isDeleteOpen, setIsDeleteOpen] = useState(false);
	const [formError, setFormError] = useState('');
	const [editForm, setEditForm] = useState(null);
	const navigate = useNavigate();

	useEffect(() => {
		let active = true;

		obtenerEstacion(id)
			.then((result) => {
				if (!active) return;
				setData(result);
				setStatus('success');
			})
			.catch(() => {
				if (active) setStatus('error');
			});

		return () => { active = false; };
	}, [id]);

	if (status === 'loading') return
	<div className="page-wrap dashboard-page">
		<p className="data-message">Cargando estación...</p>
	</div>;

	if (status === 'error') return
	<div className="page-wrap dashboard-page">
		<p className="data-message data-error">No se pudo cargar la estación</p>
		<Link className="back-link" to="/estaciones">Volver a estaciones</Link>
	</div>;

	const { station, class: clase, reports } = data;
	const stationStatus = station.ignored ? 'IGNORADA' : station.status;
	const statusClass = stationStatus.toLowerCase().replace('_', '-');
	const handleUpdate = async (event) => {
		event.preventDefault();
		const changes = {
			code: station.code,
			name: editForm.name,
			location: editForm.location,
			operatingSystem: station.operatingSystem,
			classId: station.classId,
		};

		try {
			await actualizarEstacion(station.id, changes);
			if (editForm.ignored !== station.ignored) {
				await cambiarIgnorada(station.id, editForm.ignored);
			}
			navigate('/estaciones');
		} catch (error) {
			setFormError(error.message);
		}
	};

	const handleDelete = async () => {
		try {
			await eliminarEstacion(station.id);
			navigate('/estaciones');
		} catch (error) {
			setFormError(error.message);
			setIsDeleteOpen(false);
		}
	};

	const handleToggleIgnored = async () => {
		try {
			await cambiarIgnorada(station.id, !station.ignored);
			navigate('/estaciones');
		} catch (error) {
			setFormError(error.message);
		}
	};

	return (
		<div className="page-wrap dashboard-page">
			<Link className="back-link" to="/estaciones">Volver a estaciones</Link>

			{/*titulo de detalle estacion*/}
			<section className="dashboard-heading">
				<div>
					<p className="section-kicker">Estaciones / Detalle</p>
					<h1>{station.name}</h1>
					<p className="dashboard-subtitle">{station.code} · {clase?.name}</p>
				</div>
				<span className={`status-pill status-${statusClass}`}><span /> {station.ignored ? 'Ignorada' : statusLabels[station.status]}</span>
			</section>
			<div className="station-detail-actions">
				<button className="button button-primary" type="button" onClick={() => { setFormError(''); setEditForm({ name: station.name, location: station.location, ignored: station.ignored }); setIsEditOpen(true); }}>Editar estación</button>
				<button className={station.ignored ? 'button button-primary' : 'modal-cancel'} type="button" onClick={handleToggleIgnored}>{station.ignored ? 'Reactivar estación' : 'Marcar como ignorada'}</button>
				<button className="modal-danger" type="button" onClick={() => { setFormError(''); setIsDeleteOpen(true); }}>Eliminar estación</button>
			</div>
			{formError && !isEditOpen && <p className="form-error" role="alert">{formError}</p>}

			{/*info de estacion*/}
			<section className="class-detail-grid" aria-label="Información de la estación">
				<div className="class-detail-field">
					<span>Ubicación</span><strong>{station.location}</strong>
				</div>
				<div className="class-detail-field">
					<span>Sistema operativo</span><strong>{osLabels[station.operatingSystem]}</strong>
				</div>
				<div className="class-detail-field">
					<span>CPU</span><strong>{station.cpuPercent ?? '—'}%</strong>
				</div>
				<div className="class-detail-field">
					<span>Memoria</span><strong>{station.memoryPercent ?? '—'}%</strong>
				</div>
				<div className="class-detail-field">
					<span>Último reporte</span><strong>{station.lastReport}</strong>
				</div>
				<div className="class-detail-field">
					<span>Creada</span><strong>{formatDate(station.createdAt)}</strong>
				</div>
			</section>

			{/*info de estacion*/}
			<section className="station-panel">
				<h2>Historial de reportes</h2>
				{reports.length === 0 ? <p className="data-message">Esta estación todavía no tiene reportes.</p> : (
					<div className="station-table-wrap">
						<table className="station-table"><thead><tr><th>Fecha</th><th>Estado</th><th>CPU</th><th>Memoria</th><th>Agente</th><th>IP</th></tr></thead>
							<tbody>{reports.map((report) => <tr key={report.id}><td>{formatDate(report.createdAt)}</td><td>{report.declaredStatus}</td><td>{report.cpuPercent}%</td><td>{report.memoryPercent}%</td><td>{report.agentVersion}</td><td>{report.ipAddress}</td></tr>)}</tbody>
						</table>
					</div>
				)}
			</section>
			{isEditOpen && <StationEditModal
				form={editForm}
				formError={formError}
				onChange={(event) => {
					const { name, value, type, checked } = event.target;
					setEditForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
				}}
				onClose={() => setIsEditOpen(false)}
				onSubmit={handleUpdate}
			/>}
			{isDeleteOpen && <ConfirmModal
				stationName={station.name}
				onCancel={() => setIsDeleteOpen(false)}
				onConfirm={handleDelete}
			/>}
		</div>
	);
};

export default DetalleEstacion;