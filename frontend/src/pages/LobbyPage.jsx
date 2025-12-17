import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useGame } from '../context/GameContext';
import PlayerList from '../components/lobby/PlayerList';

/**
 * Lobby Page - Doodle Pop Theme
 */
const LobbyPage = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const {
        roomCode,
        isHost,
        gameStatus,
        joinRoom,
        startGame,
        players,
        socket,
        resetGame,
        quiz,
        settings
    } = useGame();

    // const [formRoomCode, setFormRoomCode] = useState(''); // Unused now
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (gameStatus === 'live' && roomCode) {
            navigate(`/game/${roomCode}`);
        }
    }, [gameStatus, roomCode, navigate]);

    // Clear error on socket error
    useEffect(() => {
        if (socket) {
            const errorHandler = (err) => {
                setError(err.message || 'An error occurred');
                setLoading(false);
            };
            socket.on('error', errorHandler);
            return () => socket.off('error', errorHandler);
        }
    }, [socket]);

    // Handlers removed as they are no longer used in the simplified view.
    // ResetGame is used in the Room view 'Leave' button.

    // If waiting in a room
    if (roomCode) {
        return (
            <div className="min-h-screen p-4 flex flex-col items-center">
                <div className="w-full max-w-6xl">
                    <div className="flex justify-between items-center mb-8 md:mb-12">
                        <h1 className="text-3xl md:text-5xl font-bold font-doodle transform -rotate-2">Lobby 🛋️</h1>
                        <button onClick={() => { resetGame(); navigate('/'); }} className="px-4 md:px-6 py-2 border-2 border-gray-800 rounded-full font-bold hover:bg-red-100 text-base md:text-lg transition-colors">
                            Leave
                        </button>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-6 md:gap-12">
                        {/* Room Info Card */}
                        <div className="doodle-card bg-yellow-100 transform rotate-1 flex flex-col justify-between min-h-[400px] md:min-h-[500px]">
                            <div className="text-center mb-4 md:mb-6">
                                <p className="text-lg md:text-2xl font-bold font-doodle mb-3 md:mb-4">Room Code</p>
                                <div className="text-4xl md:text-7xl font-black tracking-widest bg-white border-4 border-dashed border-gray-400 p-4 md:p-8 rounded-2xl transform -rotate-1 select-all shadow-sm">
                                    {roomCode}
                                </div>
                                <p className="mt-4 md:mt-8 text-sm md:text-lg font-bold text-gray-500 uppercase tracking-widest animate-pulse">
                                    {isHost ? 'Waiting for you to start...' : 'Waiting for host to start...'}
                                </p>
                            </div>

                            {/* Quiz Details */}
                            {quiz && (
                                <div className="bg-white p-4 md:p-6 rounded-xl border-2 border-black mb-4 md:mb-6 transform -rotate-1 shadow-md">
                                    <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
                                        <div className="text-3xl md:text-5xl">{quiz.thumbnail}</div>
                                        <div>
                                            <h3 className="text-lg md:text-2xl font-bold font-doodle leading-none">{quiz.title}</h3>
                                            <p className="text-gray-500 text-xs md:text-sm mt-1">{quiz.questionCount} Questions</p>
                                        </div>
                                    </div>

                                    {settings && (
                                        <div className="flex flex-wrap gap-2 mt-2 text-xs md:text-sm font-bold uppercase text-gray-500">
                                            <span className="bg-gray-100 px-2 py-1 rounded">⏱️ {settings.timeLimit === 0 ? 'No Limit' : `${settings.timeLimit}s`}</span>
                                            <span className="bg-gray-100 px-2 py-1 rounded">{settings.isHostPlaying ? '🏃 Host Playing' : '👑 Host Watching'}</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {isHost && (
                                <button
                                    onClick={startGame}
                                    className="w-full doodle-button bg-green-400 text-white hover:bg-green-500 text-xl md:text-3xl py-4 md:py-6 mt-auto transform hover:scale-105 transition-transform"
                                >
                                    Start Game! 🚀
                                </button>
                            )}
                        </div>

                        {/* Player List Card */}
                        <div className="doodle-card bg-blue-50 transform -rotate-1 relative min-h-[400px] md:min-h-[500px] flex flex-col">
                            {/* Tape */}
                            <div className="absolute -top-4 left-1/2 w-32 h-8 bg-pink-300 opacity-80 transform -translate-x-1/2 rotate-2 shadow-sm"></div>

                            <h2 className="text-2xl md:text-3xl font-bold font-doodle mb-4 md:mb-6 text-center mt-4">
                                Players ({players.length})
                            </h2>
                            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                <PlayerList players={players} hostId={isHost ? user.id : null} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Default Fallback: Loading / Redirecting
    // If we land here, it means we don't have a room code yet.
    // We should either be connecting or we came here by mistake.
    // Let's show a loading spinner briefly, then redirect if it persists.

    // Using a simple timeout to redirect if no room is found
    useEffect(() => {
        const timer = setTimeout(() => {
            if (!roomCode && !loading) {
                // navigate('/'); 
                // Commenting out redirect for debugging. 
                // Actually, user wants to NOT see the old lobby.
                // So we should redirect.
                navigate('/');
            }
        }, 1000); // 1 second grace period to connect
        return () => clearTimeout(timer);
    }, [roomCode, loading, navigate]);

    return (
        <div className="min-h-screen p-4 flex flex-col items-center justify-center">
            <div className="text-center animate-pulse">
                <div className="text-6xl mb-4">⌛</div>
                <h2 className="text-3xl font-bold font-doodle">Connecting to Room...</h2>
            </div>
        </div>
    );
};

export default LobbyPage;
