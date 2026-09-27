import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { actualizarClase, eliminarClase, obtenerClase } from '../services/clasesService';
import ClassModal from '../components/ClassModal';
import ConfirmModal from '../components/ConfirmModal';

const formatDate = (date) => new Intl.DateTimeFormat('es', {
	day: '2-digit',
	month: 'long',
	year: 'numeric',
}).format(new Date(date));

const DetalleClase = () => {
	const { id } = useParams();
	const [clase, setClase] = useState(null);
	const [status, setStatus] = useState('loading');
	const [isEditOpen, setIsEditOpen] = useState(false);
	const [isDeleteOpen, setIsDeleteOpen] = useState(false);
	const [formError, setFormError] = useState('');
	const [form, setForm] = useState(null);
	const navigate = useNavigate();

	useEffect(() => {
		let active = true;

		obtenerClase(id)
			.then((result) => {
				if (!active) return;
				setClase(result);
				setStatus(result ? 'success' : 'empty');
			})
			.catch(() => {
				if (active) setStatus('error');
			});

		return () => { active = false; };
	}, [id]);

	const updateField = (event) => {
		const { name, value, type, checked } = event.target;
		setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
	};

	const handleUpdate = async (event) => {
		event.preventDefault();
		try {
			await actualizarClase(id, form);
			navigate('/clases');
		} catch (error) {
			setFormError(error.message);
		}
	};

	const handleDelete = async () => {
		try {
			await eliminarClase(id);
			navigate('/clases');
		} catch (error) {
			setFormError(error.message);
			setIsDeleteOpen(false);
		}
	};

	return (
		<div className="page-wrap dashboard-page">
			<Link className="back-link" to="/clases">Volver a clases</Link>
			{status === 'loading' && <p className="data-message" role="status">Cargando detalle de clase...</p>}
			{status === 'error' && <p className="data-message data-error" role="alert">No se pudo cargar el detalle de la clase.</p>}
			{status === 'empty' && (
				<div className="empty-page-state">
					<h2>No encontramos esa clase</h2>
					<p>Revisa el identificador o vuelve al listado de clases.</p>
				</div>
			)}
			{status === 'success' && (
				<>
					<section className="dashboard-heading class-detail-heading">
						<div>
							<p className="section-kicker">{clase.code} / Sección {clase.section}</p>
							<h1>{clase.name}</h1>
							<p className="dashboard-subtitle">Detalle del grupo y sus recursos.</p>
						</div>
						<span className="class-status"><span /> {clase.active ? 'Activa' : 'Inactiva'}</span>
					</section>
					<div className="station-detail-actions">
						<button className="button button-primary" type="button" onClick={() => { setForm({ code: clase.code, name: clase.name, section: clase.section, location: clase.location, schedule: clase.schedule, active: Boolean(clase.active) }); setFormError(''); setIsEditOpen(true); }}>Editar clase</button>
						<button className="modal-danger" type="button" onClick={() => { setFormError(''); setIsDeleteOpen(true); }}>Eliminar clase</button>
					</div>
					<section className="class-detail-grid" aria-label="Informacion de la clase">
						<div className="class-detail-field"><span>Ubicación</span><strong>{clase.location}</strong></div>
						<div className="class-detail-field"><span>Horario</span><strong>{clase.schedule}</strong></div>
						<div className="class-detail-field"><span>Estaciones asignadas</span><strong>{clase._count.stations}</strong></div>
						<div className="class-detail-field"><span>Fecha de creación</span><strong>{formatDate(clase.createdAt)}</strong></div>
						<div className="class-detail-field"><span>Última actualización</span><strong>{formatDate(clase.updatedAt)}</strong></div>
					</section>
					{isEditOpen && form && <ClassModal form={form} formError={formError} isEditing onChange={updateField} onClose={() => setIsEditOpen(false)} onSubmit={handleUpdate} />}
					{isDeleteOpen && <ConfirmModal stationName={clase.name} onCancel={() => setIsDeleteOpen(false)} onConfirm={handleDelete} />}
				</>
			)}
		</div>
	);
};

export default DetalleClase;