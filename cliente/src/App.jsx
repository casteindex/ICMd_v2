import ThemeProvider from './contexts/ThemeProvider';
import AppContent from './layout/AppContent';

const App = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};

export default App;
