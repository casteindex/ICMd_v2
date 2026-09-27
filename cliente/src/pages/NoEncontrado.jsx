import { Link } from 'react-router-dom';

const NoEncontrado = () => (
	<div className="page-wrap not-found-page">
		<section className="not-found-content">
			<p className="section-kicker">Error 404</p>
			<h1>Pagina no encontrada</h1>
			<p className="dashboard-subtitle">La direccion que buscas no existe o ya no esta disponible</p>
			<Link className="button button-primary" to="/">Volver al inicio <span aria-hidden="true"></span></Link>
		</section>
	</div>
);

export default NoEncontrado;