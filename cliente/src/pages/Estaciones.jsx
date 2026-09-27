import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { listarClases } from '../services/clasesService';
import { cambiarIgnorada, crearEstacion, listarEstaciones } from '../services/estacionesService';
import StationModal from '../components/StationModal';

const statusLabels = { OK: 'Ok', ADVERTENCIA: 'Advertencia', CRITICO: 'Crítico', SIN_REPORTES: 'Sin reportes' };
const osLabels = { WINDOWS: 'Windows', LINUX: 'Linux', MACOS: 'macOS', CHROMEOS: 'ChromeOS' };

const Estaciones = () => {
    const navigate = useNavigate();
    const [clases, setClases] = useState([]);
    const [estaciones, setEstaciones] = useState([]);
    const [classId, setClassId] = useState(null);
    const [query, setQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [osFilter, setOsFilter] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form, setForm] = useState({ code: '', name: '', location: '', operatingSystem: 'WINDOWS' });
    const [formError, setFormError] = useState('');
    const [reactivatingId, setReactivatingId] = useState(null);
    const [ignoredError, setIgnoredError] = useState('');

    useEffect(() => {
        listarClases({ active: true }).then((activeClasses) => {
            setClases(activeClasses);
            setClassId((currentId) => (
                activeClasses.some((clase) => clase.id === currentId)
                    ? currentId
                    : (activeClasses[0]?.id ?? null)
            ));
        });
    }, []);
    useEffect(() => {
        if (classId === null) {
            setEstaciones([]);
            return;
        }
        listarEstaciones({ classId }).then(setEstaciones);
    }, [classId]);

    const updateField = (event) => {
        setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setFormError('');
    };

    const openCreateModal = () => {
        setForm({ code: '', name: '', location: '', operatingSystem: 'WINDOWS' });
        setFormError('');
        setIsModalOpen(true);
    };

    const handleCreate = async (event) => {
        event.preventDefault();
        try {
            await crearEstacion({ classId, ...form });
            setEstaciones(await listarEstaciones({ classId }));
            setForm({ code: '', name: '', location: '', operatingSystem: 'WINDOWS' });
            closeModal();
        } catch (error) {
            setFormError(error.message);
        }
    };

    const handleReactivate = async (station) => {
        setIgnoredError('');
        setReactivatingId(station.id);

        try {
            await cambiarIgnorada(station.id, false);
            const refreshedStations = await listarEstaciones({ classId });
            setEstaciones(refreshedStations);
        } catch (error) {
            setIgnoredError(error.message);
        } finally {
            setReactivatingId(null);
        }
    };

    const ignoredStations = useMemo(() => estaciones.filter((station) => station.ignored), [estaciones]);

    const filteredStations = useMemo(() => estaciones.filter((station) => {
        if (station.ignored) return false;
        const text = `${station.code} ${station.name} ${station.location}`.toLowerCase();
        const matchesQuery = text.includes(query.toLowerCase());
        const matchesStatus = statusFilter === 'all' || station.status === statusFilter;
        const matchesOs = osFilter === 'all' || station.operatingSystem === osFilter;
        return matchesQuery && matchesStatus && matchesOs;
    }), [estaciones, query, statusFilter, osFilter]);

    const selectedClass = clases.find((clase) => clase.id === classId);

    return (
        <div className="page-wrap dashboard-page stations-page">
            <section className="stations-heading">
                <div>
                    <p className="section-kicker">Infraestructura</p>
                    <h1>Estaciones</h1>
                    <p className="dashboard-subtitle">{selectedClass ? `${selectedClass.code} · ${selectedClass.name}` : 'Selecciona una clase'}</p>
                </div>
                <div className="stations-actions">
                    <button className="button button-primary" type="button" onClick={openCreateModal} disabled={classId === null}>+ Nueva estacion</button>
                </div>
            </section>

            {/*filtrar por estacion,codigo,ubicacion */}
            <section className="station-toolbar station-toolbar-page">
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por codigo, nombre o ubicacion" aria-label="Buscar estaciones" />

                <select value={classId} onChange={(event) => setClassId(Number(event.target.value))} aria-label="Filtrar por clase">
                    {clases.map((clase) => <option value={clase.id} key={clase.id}>{clase.code}</option>)}
                </select>

                <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filtrar por estado">
                    <option value="all">Todos los estados</option>
                    <option value="OK">Ok</option>
                    <option value="ADVERTENCIA">Advertencia</option>
                    <option value="CRITICO">Critico</option>
                    <option value="SIN_REPORTES">Sin reportes</option>
                </select>

                <select value={osFilter} onChange={(event) => setOsFilter(event.target.value)} aria-label="Filtrar por sistema operativo">

                    <option value="all">Todos los SO</option>{Object.entries(osLabels).map(([value, label]) =>
                        <option value={value} key={value}>{label}</option>)}

                </select>
            </section>

            {/*tabla de estaciones */}
            <div className="station-table-wrap station-table-page-wrap">
                <table className="station-table station-admin-table">
                    <thead>
                        <tr>
                            <th>Codigo</th>
                            <th>Nombre</th>
                            <th>Ubicación</th>
                            <th>SO</th>
                            <th>Estado</th>
                            <th>Acciones</th></tr>
                    </thead>
                    <tbody>{filteredStations.map((station) => (
                        <tr key={station.id}>
                            <td>{station.code}</td>
                            <td>
                                <Link className="station-name-link" to={`/estaciones/${station.id}`}>{station.name}
                                </Link>
                            </td>
                            <td>{station.location}</td><td>{osLabels[station.operatingSystem]}</td>
                            <td>
                                <span className={`status-pill status-${station.ignored ? 'ignored' : station.status.toLowerCase()}`}><span />{station.ignored ? 'Ignorada' : statusLabels[station.status]}</span>
                            </td>
                            <td className="station-actions">
                                <button type="button" aria-label={`Ver ${station.code}`} onClick={() => navigate(`/estaciones/${station.id}`)}> ver detalles</button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            <section className="inactive-classes-section" aria-labelledby="ignored-stations-title">
                <div className="section-heading">
                    <div>
                        <p className="section-kicker">Fuera de servicio</p>
                        <h2 id="ignored-stations-title">Estaciones ignoradas</h2>
                    </div>
                    <span className="section-count">{ignoredStations.length} estaciones</span>
                </div>
                {ignoredError && <p className="form-error" role="alert">{ignoredError}</p>}
                {ignoredStations.length === 0 ? <p className="data-message">No hay estaciones ignoradas.</p> : (
                    <div className="station-table-wrap inactive-classes-table-wrap">
                        <table className="station-table inactive-classes-table">
                            <thead><tr><th>Codigo</th><th>Nombre</th><th>Ubicacion</th><th>SO</th><th>Accion</th></tr></thead>
                            <tbody>{ignoredStations.map((station) => (
                                <tr key={station.id}>
                                    <td><Link className="station-name-link" to={`/estaciones/${station.id}`}>{station.code}</Link></td>
                                    <td>{station.name}</td>
                                    <td>{station.location}</td>
                                    <td>{osLabels[station.operatingSystem]}</td>
                                    <td><label className="reactivate-control"><input type="checkbox" checked={reactivatingId === station.id} disabled={reactivatingId !== null} onChange={() => handleReactivate(station)} /> Reactivar</label></td>
                                </tr>
                            ))}</tbody>
                        </table>
                    </div>
                )}
            </section>

			{isModalOpen && <StationModal
				classCode={selectedClass?.code}
				operatingSystems={osLabels}
				form={form}
				formError={formError}
				onChange={updateField}
                onClose={closeModal}
				onSubmit={handleCreate}
			/>}
        </div>
    );
};

export default Estaciones;