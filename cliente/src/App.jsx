import ThemeProvider from './contexts/ThemeProvider';
import AppContent from './layout/AppContent';
import './App.css';

const App = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};

export default App;
