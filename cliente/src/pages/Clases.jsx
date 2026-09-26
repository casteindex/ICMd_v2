import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listarClases } from '../services/clasesService';

const Clases = () => {
	const [clases, setClases] = useState([]);
	const [status, setStatus] = useState('loading');

	useEffect(() => {
		let active = true;

		listarClases({ active: true })
			.then((result) => {
				if (!active) return;
				setClases(result);
				setStatus('success');
			})
			.catch(() => {
				if (active) setStatus('error');
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
				{status === 'success' && <span className="section-count">{clases.length} clases activas</span>}
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
							</div>
							<div className="class-card-footer">
								<span>{clase._count.stations} estaciones</span>
								<span className="class-card-arrow" aria-hidden="true">Ver detalles</span>
							</div>
						</Link>
					))}
				</div>
			)}
		</div>
	);
};

export default Clases;