import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { listarClases } from '../services/clasesService';
import { actualizarEstacionSimulada, crearEstacionSimulada, eliminarEstacionSimulada, listarEstaciones } from '../services/estacionesService';
import StationModal from '../components/StationModal';
import StationDetailsModal from '../components/StationDetailsModal';
import ConfirmModal from '../components/ConfirmModal';

const statusLabels = { OK: 'Ok', INTERNET: 'Advertencia', IA: 'Crítico' };
const osLabels = { WINDOWS: 'Windows', LINUX: 'Linux', MACOS: 'macOS', CHROMEOS: 'ChromeOS' };

const Estaciones = () => {
    const [clases, setClases] = useState([]);
    const [estaciones, setEstaciones] = useState([]);
    const [classId, setClassId] = useState(1);
    const [query, setQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [osFilter, setOsFilter] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form, setForm] = useState({ code: '', name: '', location: '', operatingSystem: 'WINDOWS' });
    const [formError, setFormError] = useState('');
    const [selectedStation, setSelectedStation] = useState(null);
    const [modalMode, setModalMode] = useState(null);

    useEffect(() => { listarClases({ active: true }).then(setClases); }, []);
    useEffect(() => { listarEstaciones({ classId }).then(setEstaciones); }, [classId]);

    const updateField = (event) => {
        setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setFormError('');
    };

    const openCreateModal = () => {
        setSelectedStation(null);
        setForm({ code: '', name: '', location: '', operatingSystem: 'WINDOWS' });
        setFormError('');
        setIsModalOpen(true);
    };

    const openEditModal = (station) => {
        setSelectedStation(station);
        setForm({ code: station.code, name: station.name, location: station.location, operatingSystem: station.operatingSystem });
        setFormError('');
        setIsModalOpen(true);
    };

    const handleCreate = async (event) => {
        event.preventDefault();
        try {
            if (selectedStation) {
                await actualizarEstacionSimulada(selectedStation.id, form);
            } else {
                await crearEstacionSimulada({ classId, ...form });
            }
            setEstaciones(await listarEstaciones({ classId }));
            setForm({ code: '', name: '', location: '', operatingSystem: 'WINDOWS' });
            setSelectedStation(null);
            closeModal();
        } catch (error) {
            setFormError(error.message);
        }
    };

    const closeSecondaryModal = () => {
        setSelectedStation(null);
        setModalMode(null);
    };

    const confirmDelete = async () => {
        await eliminarEstacionSimulada(selectedStation.id);
        setEstaciones(await listarEstaciones({ classId }));
        closeSecondaryModal();
    };

    const filteredStations = useMemo(() => estaciones.filter((station) => {
        const text = `${station.code} ${station.name} ${station.location}`.toLowerCase();
        const matchesQuery = text.includes(query.toLowerCase());
        const matchesStatus = statusFilter === 'all' || (station.ignored ? 'ignored' : station.status) === statusFilter;
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
                    <button className="button button-primary" type="button" onClick={openCreateModal}>+ Nueva estacion</button>
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
                    <option value="INTERNET">Advertencia</option>
                    <option value="IA">Critico</option><option value="ignored">Ignorada</option>
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
                                {/*los icons de los botones ahora son emojis */}
                                <button type="button" aria-label={`Ver ${station.code}`} onClick={() => { setSelectedStation(station); setModalMode('details'); }}>👁️</button>
                                <button type="button" aria-label={`Editar ${station.code}`} onClick={() => openEditModal(station)}>✏️</button>
                                <button type="button" aria-label={`Eliminar ${station.code}`} onClick={() => { setSelectedStation(station); setModalMode('delete'); }}>❌</button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

			{isModalOpen && <StationModal
				classCode={selectedClass?.code}
				operatingSystems={osLabels}
				form={form}
				formError={formError}
                isEditing={Boolean(selectedStation)}
				onChange={updateField}
                onClose={() => { closeModal(); setSelectedStation(null); }}
				onSubmit={handleCreate}
			/>}
            {modalMode === 'details' && selectedStation && <StationDetailsModal station={selectedStation} operatingSystems={osLabels} onClose={closeSecondaryModal} />}
            {modalMode === 'delete' && selectedStation && <ConfirmModal stationName={selectedStation.name} onCancel={closeSecondaryModal} onConfirm={confirmDelete} />}
        </div>
    );
};

export default Estaciones;