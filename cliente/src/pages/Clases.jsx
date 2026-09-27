import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { actualizarClase, crearClase, listarClases } from '../services/clasesService';
import ClassModal from '../components/ClassModal';

const formatDate = (date) => new Intl.DateTimeFormat('es', {
	day: '2-digit',
	month: 'short',
	year: 'numeric',
}).format(new Date(date));

const Clases = () => {
	const [clases, setClases] = useState([]);
	const [clasesInactivas, setClasesInactivas] = useState([]);
	const [status, setStatus] = useState('loading');
	const [inactiveStatus, setInactiveStatus] = useState('loading');
	const [reactivatingId, setReactivatingId] = useState(null);
	const [inactiveError, setInactiveError] = useState('');
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [formError, setFormError] = useState('');
	const [form, setForm] = useState({ code: '', name: '', section: '', location: '', schedule: '' });

	const updateField = (event) => {
		setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
	};

	const handleCreate = async (event) => {
		event.preventDefault();
		try {
			const newClass = await crearClase(form);
			setClases((current) => [...current, { ...newClass, _count: { stations: 0 } }]);
			setForm({ code: '', name: '', section: '', location: '', schedule: '' });
			setFormError('');
			setIsModalOpen(false);
		} catch (error) {
			setFormError(error.message);
		}
	};

	const handleReactivate = async (clase) => {
		setInactiveError('');
		setReactivatingId(clase.id);
		try {
			await actualizarClase(clase.id, {
				code: clase.code,
				name: clase.name,
				section: clase.section,
				location: clase.location,
				schedule: clase.schedule,
				active: true,
			});
			setClasesInactivas((current) => current.filter((item) => item.id !== clase.id));
			setClases((current) => [...current, { ...clase, active: true }]);
		} catch (error) {
			setInactiveError(error.message);
		} finally {
			setReactivatingId(null);
		}
	};

	useEffect(() => {
		let active = true;

		Promise.all([listarClases({ active: true }), listarClases({ active: false })])
			.then(([activeClasses, inactiveClasses]) => {
				if (!active) return;
				setClases(activeClasses);
				setClasesInactivas(inactiveClasses);
				setStatus('success');
				setInactiveStatus('success');
			})
			.catch(() => {
				if (!active) return;
				setStatus('error');
				setInactiveStatus('error');
			});

		return () => { active = false; };
	}, []);

	return (
		<div className="page-wrap dashboard-page">
			<section className="dashboard-heading">
				<div>
					<p className="section-kicker">Gestion academica</p>
					<h1>Clases</h1>
					<p className="dashboard-subtitle">Consulta grupos, horarios y espacios de trabajo.</p>
				</div>
				<div className="class-heading-actions">
					{status === 'success' && <span className="section-count">{clases.length} clases activas</span>}
					<button className="button button-primary" type="button" onClick={() => { setFormError(''); setIsModalOpen(true); }}>+ Nueva clase</button>
				</div>
			</section>

			{status === 'loading' && <p className="data-message" role="status">Cargando clases...</p>}
			{status === 'error' && <p className="data-message data-error" role="alert">No se pudieron cargar las clases.</p>}
			{status === 'success' && clases.length === 0 && (
				<div className="empty-page-state">
					<h2>Todavia no hay clases</h2>
					<p>Cuando haya clases registradas, apareceran en esta seccion.</p>
				</div>
			)}
			{status === 'success' && clases.length > 0 && (
				<div className="class-grid">
					{clases.map((clase) => (
						<Link className="class-card" to={`/clases/${clase.id}`} key={clase.id}>
							<div className="class-card-top">
								<span className="class-code">{clase.code}</span>
								<span className="class-status"><span /> Activa</span>
							</div>
							<h2>{clase.name}</h2>
							<p className="class-section">Seccion {clase.section}</p>
							<div className="class-card-meta">
								<span>{clase.location}</span>
								<span>{clase.schedule}</span>
								<span>Actualizada: {formatDate(clase.updatedAt)}</span>
							</div>
							<div className="class-card-footer">
								<span>{clase._count.stations} estaciones</span>
								<span className="class-card-arrow" aria-hidden="true">Ver detalles</span>
							</div>
						</Link>
					))}
				</div>
			)}
			{inactiveStatus === 'success' && (
				<section className="inactive-classes-section" aria-labelledby="inactive-classes-title">
					<div className="section-heading">
						<div>
							<p className="section-kicker">Archivadas</p>
							<h2 id="inactive-classes-title">Clases inactivas</h2>
						</div>
						<span className="section-count">{clasesInactivas.length} clases</span>
					</div>
					{inactiveError && <p className="form-error" role="alert">{inactiveError}</p>}
					{clasesInactivas.length === 0 ? <p className="data-message">No hay clases inactivas.</p> : (
						<div className="station-table-wrap inactive-classes-table-wrap">
							<table className="station-table inactive-classes-table">
								<thead><tr><th>Codigo</th><th>Nombre</th><th>Seccion</th><th>Ubicacion</th><th>Accion</th></tr></thead>
								<tbody>{clasesInactivas.map((clase) => (
									<tr key={clase.id}>
										<td><Link className="station-name-link" to={`/clases/${clase.id}`}>{clase.code}</Link></td>
										<td>{clase.name}</td>
										<td>{clase.section}</td>
										<td>{clase.location}</td>
										<td><label className="reactivate-control"><input type="checkbox" checked={reactivatingId === clase.id} disabled={reactivatingId !== null} onChange={() => handleReactivate(clase)} /> Reactivar</label></td>
									</tr>
								))}</tbody>
							</table>
						</div>
					)}
				</section>
			)}
			{isModalOpen && <ClassModal form={form} formError={formError} onChange={updateField} onClose={() => setIsModalOpen(false)} onSubmit={handleCreate} />}
		</div>
	);
};

export default Clases;