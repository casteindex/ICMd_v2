import { useState } from 'react';
import AuthContext from './AuthContext';
import { apiFetch } from '../services/api';

const SESSION_KEY = 'icmd-session';
const TOKEN_KEY = 'icmd-token';

const readSession = () => {
	try {
		const session = sessionStorage.getItem(SESSION_KEY);
		return session ? JSON.parse(session) : null;
	} catch {
		return null;
	}
};

const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(readSession);

	const login = async (email, password) => {
		const data = await apiFetch('/auth/login', {
			method: 'POST',
			body: JSON.stringify({ email, password }),
		});
		const nextUser = data.user;

		sessionStorage.setItem(TOKEN_KEY, data.token);
		sessionStorage.setItem(SESSION_KEY, JSON.stringify(nextUser));
		setUser(nextUser);
	};

	const logout = () => {
		sessionStorage.removeItem(TOKEN_KEY);
		sessionStorage.removeItem(SESSION_KEY);
		setUser(null);
	};

	return (
		<AuthContext.Provider value={{ user, isAuthenticated: Boolean(user), login, logout }}>
			{children}
		</AuthContext.Provider>
	);
};

export default AuthProvider;