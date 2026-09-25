import { Link } from 'react-router-dom';

const Home = () => (
	<div className="page-wrap home-page">
		<section className="home-intro" aria-labelledby="home-title">
			<div className="eyebrow"><span className="eyebrow-dot" /> Plataforma de gestión académica</div>
			<h1 id="home-title">Laboratorios,<br /><span>bajo control.</span></h1>
			<p className="home-lead">
				Administra clases, estaciones de trabajo y prácticas desde un solo lugar.
			</p>
			<div className="home-actions">
				<Link className="button button-primary" to="/dashboard">
					Ir al dashboard <span aria-hidden="true">→</span>
				</Link>
			</div>
			<div className="home-note">
				<span className="note-line" />
				<span>ICMd <span className="muted-separator">/</span> Infraestructura de laboratorio</span>
			</div>
		</section>
	</div>
);

export default Home;
