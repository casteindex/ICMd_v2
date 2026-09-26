import { useState } from 'react';
import AuthContext from './AuthContext';

const SESSION_KEY = 'icmd-demo-session';

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

	const login = (email) => {
		const nextUser = { email, name: email.split('@')[0] };
		sessionStorage.setItem(SESSION_KEY, JSON.stringify(nextUser));
		setUser(nextUser);
	};

	const logout = () => {
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