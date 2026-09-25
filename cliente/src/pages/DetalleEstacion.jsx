import { useParams } from 'react-router-dom';
import EmptyPage from '../components/EmptyPage';

const DetalleEstacion = () => {
	const { id } = useParams();

	return (
		<EmptyPage
			eyebrow="Estaciones / Detalle"
			title="Detalle de estación"
			subtitle={`Vista de la estación ${id}.`}
			emptyTitle="Sin información de estación"
			emptyDescription="El sistema operativo, ubicación y estado de la estación se mostrarán aquí."
			backTo="/estaciones"
			backLabel="Volver a estaciones"
		/>
	);
};

export default DetalleEstacion;