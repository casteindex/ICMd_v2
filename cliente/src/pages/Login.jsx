import { useContext, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import AuthContext from '../contexts/AuthContext';

const Login = () => {
	const { isAuthenticated, login } = useContext(AuthContext);
	const location = useLocation();
	const navigate = useNavigate();
	const [error, setError] = useState('');
	const from = location.state?.from?.pathname || '/dashboard';

	if (isAuthenticated) return <Navigate to={from} replace />;

	const handleSubmit = (event) => {
		event.preventDefault();
		const formData = new FormData(event.currentTarget);
		const email = String(formData.get('email')).trim();
		const password = String(formData.get('password'));

		if (!email || password.length < 6) {
			setError('Ingresa un correo válido y una contraseña de al menos 6 caracteres.');
			return;
		}

		setError('');
		login(email);
		navigate(from, { replace: true });
	};

	return (
		<div className="page-wrap login-page">
			<section className="login-panel" aria-labelledby="login-title">
				<p className="section-kicker">ICMd / Acceso</p>
				<h1 id="login-title">Bienvenido</h1>
				<p className="login-subtitle">Ingresa tus credenciales para continuar.</p>
				<form className="login-form" onSubmit={handleSubmit}>
					<label htmlFor="email">Correo electrónico</label>
					<input id="email" name="email" type="email" autoComplete="username" placeholder="nombre@unitec.edu" required />
					<label htmlFor="password">Contraseña</label>
					<input id="password" name="password" type="password" autoComplete="current-password" placeholder="Mínimo 6 caracteres" minLength={6} required />
					{error && <p className="login-error" role="alert">{error}</p>}
					<button className="button button-primary login-submit" type="submit">Iniciar sesión <span aria-hidden="true">→</span></button>
				</form>
				<p className="login-demo-note">Acceso de demostración: cualquier correo y contraseña válida.</p>
				<p className="login-return"><Link to="/">Volver al inicio</Link></p>
			</section>
		</div>
	);
};

export default Login;