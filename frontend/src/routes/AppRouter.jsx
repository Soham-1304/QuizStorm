import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

// Pages
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/LoginPage';
import LobbyPage from '../pages/LobbyPage';
import CreateGamePage from '../pages/CreateGamePage';
import GameRoomPage from '../pages/GameRoomPage';
import ResultsPage from '../pages/ResultsPage';
import AdminDashboard from '../pages/AdminDashboard';
import ProfilePage from '../pages/ProfilePage';

/**
 * App Router
 * Configures all application routes
 */
const AppRouter = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />

                {/* Protected routes */}
                <Route element={<ProtectedRoute />}>
                    <Route path="/lobby" element={<LobbyPage />} />
                    <Route path="/create-game" element={<CreateGamePage />} />
                    <Route path="/game/:roomCode" element={<GameRoomPage />} />

                    <Route path="/results/:roomCode" element={<ResultsPage />} />

                    {/* New Features */}
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/profile/:username" element={<ProfilePage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                </Route>

                {/* Catch all - redirect to login */}
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </BrowserRouter>
    );
};

export default AppRouter;
