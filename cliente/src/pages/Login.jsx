import { Link } from 'react-router-dom';

const Login = () => (
	<div className="page-wrap login-page">
		<section className="login-panel" aria-labelledby="login-title">
			<p className="section-kicker">ICMd / Acceso</p>
			<h1 id="login-title">Bienvenido</h1>
			<p className="login-subtitle">Ingresa tus credenciales para continuar.</p>
			<form className="login-form" onSubmit={(event) => event.preventDefault()}>
				<label htmlFor="email">Correo electrónico</label>
				<input id="email" name="email" type="email" autoComplete="username" placeholder="nombre@unitec.edu" />
				<label htmlFor="password">Contraseña</label>
				<input id="password" name="password" type="password" autoComplete="current-password" placeholder="••••••••" />
				<button className="button button-primary login-submit" type="submit">Iniciar sesión <span aria-hidden="true">→</span></button>
			</form>
			<p className="login-return"><Link to="/">Volver al inicio</Link></p>
		</section>
	</div>
);

export default Login;