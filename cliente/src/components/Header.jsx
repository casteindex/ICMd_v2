import { NavLink } from 'react-router-dom';
import { useContext } from 'react';
import ThemeContext from '../contexts/ThemeContext';
import AuthContext from '../contexts/AuthContext';

const navigation = [
	{ to: '/', label: 'Home' },
	{ to: '/dashboard', label: 'Dashboard' },
	{ to: '/clases', label: 'Clases' },
	{ to: '/estaciones', label: 'Estaciones' },
	{ to: '/simulador', label: 'Simulador' },
];

const Header = () => {
	const { theme, toggleTheme } = useContext(ThemeContext);
	const { isAuthenticated, user, logout } = useContext(AuthContext);

	return (
		<header className="site-header">
			<div className="header-inner">
				<NavLink className="brand" to="/" aria-label="ICMd, inicio">
					<span>ICMd</span>
				</NavLink>

				<nav className="main-nav" aria-label="Navegacion principal">
					{navigation.filter(({ to }) => to === '/' || isAuthenticated).map(({ to, label }) => (
						<NavLink
							key={to}
							className={({ isActive }) => `nav-link${isActive ? ' is-active' : ''}`}
							to={to}
						>
							{label}
						</NavLink>
					))}
				</nav>

				<div className="header-actions">
					{isAuthenticated ? (
						<>
							<span className="header-user">{user.name}</span>
							<button className="header-logout" type="button" onClick={logout}>Log out</button>
						</>
					) : (
						<NavLink className="header-login" to="/login">Log in</NavLink>
					)}
					<button
						className="theme-toggle"
						type="button"
						onClick={toggleTheme}
						aria-label={`Cambiar a tema ${theme === 'claro' ? 'oscuro' : 'claro'}`}
						title={`Cambiar a tema ${theme === 'claro' ? 'oscuro' : 'claro'}`}
					>
						<span aria-hidden="true">{theme === 'claro' ? '◐' : '☼'}</span>
					</button>
				</div>
			</div>
		</header>
	);
};

export default Header;
