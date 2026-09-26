import ThemeProvider from './contexts/ThemeProvider';
import AuthProvider from './contexts/AuthProvider';
import AppContent from './layout/AppContent';
import './App.css';

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
