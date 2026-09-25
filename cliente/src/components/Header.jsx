import { NavLink } from 'react-router-dom';
import { useContext } from 'react';
import ThemeContext from '../contexts/ThemeContext';

const navigation = [
	{ to: '/', label: 'Home' },
	{ to: '/dashboard', label: 'Dashboard' },
	{ to: '/clases', label: 'Clases' },
	{ to: '/estaciones', label: 'Estaciones' },
	{ to: '/simulador', label: 'Simulador' },
];

const Header = () => {
	const { theme, toggleTheme } = useContext(ThemeContext);

	return (
		<header className="site-header">
			<div className="header-inner">
				<NavLink className="brand" to="/" aria-label="ICMd, inicio">
					<span>ICMd II</span>
				</NavLink>

				<nav className="main-nav" aria-label="Navegación principal">
					{navigation.map(({ to, label }) => (
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
					<NavLink className="header-login" to="/login">Log in / Sign Up</NavLink>
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
