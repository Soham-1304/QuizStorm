import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useGame } from '../context/GameContext';

const LandingPage = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { joinRoom, setRoomInfo } = useGame(); // Use joinRoom and setRoomInfo from GameContext

    const [joinCode, setJoinCode] = useState('');
    const [joinError, setJoinError] = useState('');

    const handleCreateRoom = () => {
        navigate('/create-game');
    };

    const handleJoinGame = async (e) => {
        e.preventDefault();
        setJoinError('');
        if (!joinCode.trim()) return;

        try {
            // 1. Call REST API to join and get room details
            // Dynamic import to avoid circular dependency issues if any, or just cleaner modularity
            const { joinRoom: apiJoinRoom } = await import('../api/gameApi');
            const response = await apiJoinRoom(joinCode.trim());
            const roomData = response; // Axios interceptor unwraps data

            // 2. Hydrate GameContext synchronously
            setRoomInfo(roomData);

            // 3. Connect via Socket for real-time updates
            joinRoom(roomData.roomCode); // This sets roomCode in context again (harmless) and emits socket join

            // 4. Navigate to Lobby
            navigate('/lobby');
        } catch (err) {
            console.error(err);
            setJoinError('Failed to join room. Check code or try again.');
            // Optionally show error in UI
            alert('Failed to join room: ' + (err.message || 'Unknown error'));
        }
    };

    const handleLogout = () => {
        logout();
    };

    // Authenticated Dashboard View
    if (user) {
        return (
            <div className="min-h-screen p-6 md:p-12 flex flex-col items-center relative overflow-hidden">
                {/* Background Decor (Vibrant blobs - Adjusted for "Tacky" but softer look) */}
                <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float"></div>
                <div className="absolute top-[30%] right-[-10%] w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" style={{ animationDelay: '2s' }}></div>
                <div className="absolute bottom-[-10%] left-[30%] w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" style={{ animationDelay: '4s' }}></div>

                {/* User Header - Moved UP via margin adjustment */}
                <div className="w-full max-w-6xl flex justify-between items-center mb-12 mt-4 z-10">
                    <Link to="/profile" className="flex items-center gap-6 group cursor-pointer">
                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-gray-900 bg-white flex items-center justify-center font-bold text-3xl overflow-hidden shadow-[4px_4px_0px_black] transform -rotate-2 group-hover:rotate-2 group-hover:scale-105 transition-all">
                            {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : user.username?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p className="text-base font-bold text-gray-500 uppercase tracking-widest mb-1 group-hover:text-blue-500 transition-colors">Welcome back,</p>
                            <h2 className="text-4xl md:text-5xl font-bold font-doodle group-hover:underline decoration-wavy decoration-2 decoration-blue-500 underline-offset-4 transition-all">{user.username}</h2>
                        </div>
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="px-6 py-2 rounded-lg border-2 border-black font-bold text-black font-doodle text-xl bg-white shadow-[4px_4px_0px_black] hover:bg-red-50 hover:text-red-600 hover:shadow-[2px_2px_0px_black] hover:translate-x-[2px] hover:translate-y-[2px] transition-all transform rotate-1"
                    >
                        Logout ✌️
                    </button>
                </div>

                {/* Dashboard Cards - Centered higher up */}
                <div className="w-full max-w-5xl z-10 flex-1 flex flex-col justify-start mt-8">
                    <div className="text-center mb-12">
                        <h1 className="text-6xl md:text-7xl font-bold font-doodle mb-4 transform -rotate-1 relative inline-block text-gray-900">
                            <span className="relative z-10">Ready to Rumble?</span>
                            <span className="absolute -top-8 -right-12 text-6xl animate-bounce" style={{ animationDuration: '3s' }}>⚡</span>
                        </h1>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-start">
                        {/* Host Card */}
                        <div
                            onClick={handleCreateRoom}
                            className="doodle-card bg-green-50 transform rotate-1 hover:rotate-2 hover:-translate-y-2 transition-all cursor-pointer group min-h-[320px] flex flex-col justify-between border-3"
                        >
                            <div>
                                <div className="flex justify-between items-start mb-6">
                                    <h3 className="text-4xl font-bold font-doodle">Host a Game</h3>
                                    <div className="text-5xl transform group-hover:scale-125 transition-transform duration-300">👑</div>
                                </div>
                                <p className="font-doodle text-2xl mb-8 text-gray-600 leading-relaxed">Create a room, pick a quiz, and challenge your friends.</p>
                            </div>
                            <button className="doodle-button bg-green-400 w-full text-gray-900 text-2xl py-4 shadow-[6px_6px_0px_black] group-hover:shadow-[8px_8px_0px_black]">
                                Create Room
                            </button>
                        </div>

                        {/* Join Card */}
                        <div className="doodle-card bg-purple-50 transform -rotate-1 hover:-rotate-2 hover:-translate-y-2 transition-all min-h-[320px] flex flex-col justify-between border-3">
                            <div>
                                <div className="flex justify-between items-start mb-6">
                                    <h3 className="text-4xl font-bold font-doodle">Join a Game</h3>
                                    <div className="text-5xl">🎮</div>
                                </div>
                                <p className="font-doodle text-2xl mb-6 text-gray-600 leading-relaxed">Got a code? Enter it below to jump in.</p>
                            </div>

                            <form onSubmit={handleJoinGame} className="space-y-4">
                                <input
                                    type="text"
                                    className="doodle-input text-center text-3xl uppercase tracking-widest bg-white h-16 border-2 focus:border-purple-500"
                                    placeholder="CODE"
                                    maxLength={6}
                                    value={joinCode}
                                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                                />
                                <button type="submit" className="doodle-button bg-purple-400 w-full text-gray-900 text-2xl py-4 shadow-[6px_6px_0px_black] hover:shadow-[8px_8px_0px_black]">
                                    Join Room
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Public Landing View
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Decor (Subtle & Tacky) */}
            <div className="absolute top-[-10%] left-[-5%] w-[800px] h-[800px] bg-gradient-to-br from-yellow-100 to-transparent rounded-full opacity-60 mix-blend-multiply filter blur-[80px] animate-float"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-gradient-to-tr from-purple-100 to-transparent rounded-full opacity-60 mix-blend-multiply filter blur-[60px] animate-float" style={{ animationDelay: '3s' }}></div>

            <div className="text-center z-10 max-w-5xl mt-[-50px]">
                <h1 className="text-8xl md:text-[9rem] font-bold text-gray-900 mb-8 drop-shadow-sm tracking-tighter transform -rotate-2 hover:rotate-0 transition-transform duration-500 cursor-default">
                    Quiz
                    <span className="text-indigo-600 inline-block transform rotate-3">Storm</span>
                    <span className="text-orange-500 text-7xl align-top ml-4 absolute top-2 right-[-60px] animate-bounce">⚡</span>
                </h1>

                <p className="text-3xl md:text-4xl text-gray-800 font-medium mb-16 max-w-3xl mx-auto leading-relaxed font-doodle transform rotate-1">
                    The most <span className="bg-pink-200 px-2 transform -rotate-2 inline-block shadow-sm">chaotic</span> and <span className="bg-blue-200 px-2 transform rotate-2 inline-block shadow-sm">fun</span> trivia game for you and your friends!
                </p>

                <div className="flex flex-col md:flex-row gap-8 justify-center items-center">
                    <Link
                        to="/login"
                        className="doodle-button bg-yellow-400 text-gray-900 border-black hover:bg-yellow-300 rotate-2 text-3xl px-12 py-5 shadow-[8px_8px_0px_black] hover:shadow-[10px_10px_0px_black]"
                    >
                        Play Now 🚀
                    </Link>
                    <a
                        href="#features"
                        className="doodle-button bg-white text-gray-900 border-black -rotate-2 hover:bg-gray-50 text-3xl px-10 py-5 shadow-[8px_8px_0px_black] hover:shadow-[10px_10px_0px_black]"
                    >
                        Learn More 🧐
                    </a>
                </div>
            </div>

            {/* Feature Squiggles (Moved down slightly) */}
            <div className="mt-32 grid md:grid-cols-3 gap-10 max-w-7xl w-full z-10 px-8">
                <div className="doodle-card bg-pink-50 transform rotate-1 hover:rotate-0 transition-transform border-3 shadow-[6px_6px_0px_rgba(0,0,0,0.1)]">
                    <div className="text-6xl mb-6">🏆</div>
                    <h3 className="text-3xl font-bold mb-3 font-doodle">Compete</h3>
                    <p className="text-xl font-doodle text-gray-600">Battle your friends in real-time and climb the leaderboard!</p>
                </div>
                <div className="doodle-card bg-blue-50 transform -rotate-1 hover:rotate-0 transition-transform border-3 shadow-[6px_6px_0px_rgba(0,0,0,0.1)]">
                    <div className="text-6xl mb-6">⏱️</div>
                    <h3 className="text-3xl font-bold mb-3 font-doodle">Race</h3>
                    <p className="text-xl font-doodle text-gray-600">Answer fast! The clock is ticking and slower answers get fewer points.</p>
                </div>
                <div className="doodle-card bg-green-50 transform rotate-2 hover:rotate-0 transition-transform border-3 shadow-[6px_6px_0px_rgba(0,0,0,0.1)]">
                    <div className="text-6xl mb-6">🎨</div>
                    <h3 className="text-3xl font-bold mb-3 font-doodle">Create</h3>
                    <p className="text-xl font-doodle text-gray-600">Host your own rooms and challenge anyone with a code.</p>
                </div>
            </div>

            <footer className="absolute bottom-6 text-gray-400 font-doodle text-xl">
                Made with ❤️ & ☕ around the world
            </footer>
        </div>
    );
};

export default LandingPage;
