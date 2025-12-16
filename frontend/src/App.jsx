import { AuthProvider } from './context/AuthContext';
import { GameProvider } from './context/GameContext';
import AppRouter from './routes/AppRouter';
import './index.css';

/**
 * Main App Component
 * Wraps application with context providers and router
 */
function App() {
  return (
    <AuthProvider>
      <GameProvider>
        <AppRouter />
      </GameProvider>
    </AuthProvider>
  );
}

export default App;
