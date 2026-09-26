import { useContext } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import AuthContext from '../contexts/AuthContext';

const ProtectedRoute = () => {
	const { isAuthenticated } = useContext(AuthContext);
	const location = useLocation();

	if (!isAuthenticated) {
		return <Navigate to="/login" replace state={{ from: location }} />;
	}

	return <Outlet />;
};

export default ProtectedRoute;