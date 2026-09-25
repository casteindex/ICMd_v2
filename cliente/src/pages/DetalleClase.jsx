import { useParams } from 'react-router-dom';
import EmptyPage from '../components/EmptyPage';

const DetalleClase = () => {
	const { id } = useParams();

	return (
		<EmptyPage
			eyebrow="Clases / Detalle"
			title="Detalle de clase"
			subtitle={`Vista de la clase ${id}.`}
			emptyTitle="Sin información de clase"
			emptyDescription="Los datos del grupo, horario, espacio y estaciones asociadas se mostrarán aquí."
			backTo="/clases"
			backLabel="Volver a clases"
		/>
	);
};

export default DetalleClase;