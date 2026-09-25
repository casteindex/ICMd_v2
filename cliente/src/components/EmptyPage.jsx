import { Link } from 'react-router-dom';

const EmptyPage = ({
	eyebrow = 'Área de trabajo',
	title,
	subtitle,
	emptyTitle = 'Aún no hay información',
	emptyDescription = 'El contenido de esta sección aparecerá aquí cuando esté disponible.',
	backTo = '/dashboard',
	backLabel = 'Volver al dashboard',
}) => (
	<div className="page-wrap dashboard-page">
		<section className="dashboard-heading">
			<div>
				<p className="section-kicker">{eyebrow}</p>
				<h1>{title}</h1>
				<p className="dashboard-subtitle">{subtitle}</p>
			</div>
		</section>

		<section className="dashboard-status" aria-label={`Estado de ${title}`}>
			<div className="status-indicator"><span /> Área preparada</div>
			<p>Esta sección ya está lista para incorporar contenido.</p>
			<Link className="status-link" to={backTo}>{backLabel} <span aria-hidden="true">→</span></Link>
		</section>

		<section className="empty-page-state" aria-label={emptyTitle}>
			<div className="empty-page-mark" aria-hidden="true"><span /><span /><span /></div>
			<h2>{emptyTitle}</h2>
			<p>{emptyDescription}</p>
		</section>
	</div>
);

export default EmptyPage;