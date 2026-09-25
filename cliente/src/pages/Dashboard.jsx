import { Link } from 'react-router-dom';

const Dashboard = () => {
	const today = new Intl.DateTimeFormat('es', {
		weekday: 'long',
		day: 'numeric',
		month: 'long',
	}).format(new Date());

	return (
		<div className="page-wrap dashboard-page">
			<section className="dashboard-heading">
				<div>
					<p className="section-kicker">Centro de control</p>
					<h1>Dashboard</h1>
					<p className="dashboard-subtitle">Una vista clara de tus espacios de trabajo.</p>
				</div>
				<time className="today-label" dateTime={new Date().toISOString().slice(0, 10)}>
					{today}
				</time>
			</section>

			<section className="dashboard-status" aria-label="Estado del espacio">
				<div className="status-indicator"><span /> Espacio listo</div>
				<p>Por ahora están disponibles Inicio y Dashboard.</p>
				<Link className="status-link" to="/">Ir a inicio <span aria-hidden="true">→</span></Link>
			</section>

			
		</div>
	);
};

export default Dashboard;
