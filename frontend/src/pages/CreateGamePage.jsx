import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllQuizzes } from '../api/quizApi';
import { createRoom } from '../api/gameApi';
import { useGame } from '../context/GameContext';

const CreateGamePage = () => {
    const navigate = useNavigate();
    const { joinRoom, setRoomInfo } = useGame();

    const [step, setStep] = useState(1);
    const [quizzes, setQuizzes] = useState([]);
    const [selectedQuiz, setSelectedQuiz] = useState(null);
    const [settings, setSettings] = useState({
        timeLimit: 20,
        isHostPlaying: true
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchQuizzes = async () => {
            try {
                const res = await getAllQuizzes();
                setQuizzes(res);
            } catch (err) {
                console.error(err);
            }
        };
        fetchQuizzes();
    }, []);

    const handleCreate = async () => {
        if (!selectedQuiz) return;
        setLoading(true);
        try {
            const response = await createRoom({
                quizId: selectedQuiz._id,
                settings
            });
            const newRoom = response; // Axios interceptor already unwraps response.data

            // Hydrate GameContext immediately with known room data
            setRoomInfo(newRoom);

            // Join the room via socket (for verified subscription)
            joinRoom(newRoom.roomCode);

            // Navigate to lobby
            // We use a small timeout to allow socket join to initiate (optional but safe)
            setTimeout(() => navigate('/lobby'), 100);
        } catch (err) {
            console.error(err);
            alert('Failed to create room');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen p-4 flex flex-col items-center justify-center bg-paper">
            <div className="w-full max-w-5xl">
                <h1 className="text-5xl font-bold font-doodle text-center mb-8 transform -rotate-1">
                    Setup Your Game 🛠️
                </h1>

                {/* Stepper */}
                <div className="flex justify-center mb-8 gap-4">
                    <div className={`px-4 py-2 border-2 border-black rounded-full font-bold ${step === 1 ? 'bg-yellow-300 shadow-[4px_4px_0px_black]' : 'bg-white opacity-50'}`}>
                        1. Choose Map 🗺️
                    </div>
                    <div className={`px-4 py-2 border-2 border-black rounded-full font-bold ${step === 2 ? 'bg-green-300 shadow-[4px_4px_0px_black]' : 'bg-white opacity-50'}`}>
                        2. Settings ⚙️
                    </div>
                </div>

                <div className="min-h-[400px]">
                    {step === 1 && (
                        <div className="grid md:grid-cols-3 gap-6">


                            {/* Fetched Quizzes */}
                            {quizzes.map(quiz => (
                                <div
                                    key={quiz._id}
                                    onClick={() => setSelectedQuiz(quiz)}
                                    className={`doodle-card cursor-pointer transform hover:-translate-y-2 transition-all ${selectedQuiz?._id === quiz._id ? 'bg-blue-200 border-4 scale-105 shadow-[8px_8px_0px_black]' : 'bg-white hover:bg-blue-50'}`}
                                >
                                    <div className="text-6xl mb-4">{quiz.thumbnail || '📝'}</div>
                                    <h3 className="text-2xl font-bold font-doodle mb-2">{quiz.title}</h3>
                                    <p className="text-gray-600 mb-2">{quiz.description}</p>
                                    <span className="inline-block px-2 py-1 bg-gray-200 rounded text-xs font-bold uppercase">
                                        {quiz.difficulty} • {quiz.questionCount} Qs
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

                    {step === 2 && (
                        <div className="max-w-2xl mx-auto doodle-card bg-white rotate-1">
                            <h2 className="text-3xl font-bold font-doodle mb-8 text-center">Game Rules</h2>

                            <div className="space-y-8">
                                {/* Timer Setting */}
                                <div>
                                    <label className="block text-xl font-bold font-doodle mb-4">⏱️ Time Limit</label>
                                    <div className="flex gap-4 justify-center">
                                        {[10, 20, 30, 0].map(val => (
                                            <button
                                                key={val}
                                                onClick={() => setSettings({ ...settings, timeLimit: val })}
                                                className={`px-6 py-3 border-2 border-black rounded-lg font-bold text-lg transition-all ${settings.timeLimit === val
                                                    ? 'bg-yellow-400 shadow-[4px_4px_0px_black] transform -translate-y-1'
                                                    : 'bg-white hover:bg-gray-100'
                                                    }`}
                                            >
                                                {val === 0 ? '∞ None' : `${val}s`}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Host Mode Setting */}
                                <div>
                                    <label className="block text-xl font-bold font-doodle mb-4">🎮 Your Role</label>
                                    <div className="grid grid-cols-2 gap-6">
                                        <button
                                            onClick={() => setSettings({ ...settings, isHostPlaying: true })}
                                            className={`p-6 border-2 border-black rounded-xl text-left transition-all ${settings.isHostPlaying
                                                ? 'bg-green-300 shadow-[4px_4px_0px_black] transform -translate-y-1'
                                                : 'bg-white hover:bg-gray-100 opacity-60'
                                                }`}
                                        >
                                            <div className="text-4xl mb-2">🏃‍♂️</div>
                                            <div className="font-bold text-xl">Player</div>
                                            <div className="text-sm">I want to answer questions too!</div>
                                        </button>

                                        <button
                                            onClick={() => setSettings({ ...settings, isHostPlaying: false })}
                                            className={`p-6 border-2 border-black rounded-xl text-left transition-all ${!settings.isHostPlaying
                                                ? 'bg-purple-300 shadow-[4px_4px_0px_black] transform -translate-y-1'
                                                : 'bg-white hover:bg-gray-100 opacity-60'
                                                }`}
                                        >
                                            <div className="text-4xl mb-2">👑</div>
                                            <div className="font-bold text-xl">Host Only</div>
                                            <div className="text-sm">I'll just watch and control the game.</div>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Controls */}
                <div className="flex justify-between mt-12 max-w-4xl mx-auto w-full">
                    {step === 1 ? (
                        <button onClick={() => navigate('/')} className="font-bold font-doodle text-xl underline">
                            Cancel
                        </button>
                    ) : (
                        <button onClick={() => setStep(1)} className="font-bold font-doodle text-xl underline">
                            ← Back
                        </button>
                    )}

                    {step === 1 ? (
                        <button
                            onClick={() => setStep(2)}
                            className="doodle-button bg-blue-400 text-white"
                        >
                            Next: Settings →
                        </button>
                    ) : (
                        <button
                            onClick={handleCreate}
                            disabled={loading}
                            className="doodle-button bg-green-400 text-white text-2xl px-12 transform rotate-1"
                        >
                            {loading ? 'Creating...' : 'Launch Game! 🚀'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CreateGamePage;
