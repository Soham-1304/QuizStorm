import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { useAuth } from '../context/AuthContext';
import QuestionCard from '../components/game/QuestionCard';
import Timer from '../components/game/Timer';
import ScoreBoard from '../components/game/ScoreBoard';
import HostDashboard from '../components/game/HostDashboard';

/**
 * Game Room Page - Doodle Pop Theme
 */
const GameRoomPage = () => {
    const { roomCode: urlRoomCode } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const {
        roomCode,
        currentQuestion,
        timeRemaining,
        selectedOption,
        answerLocked,
        correctOption,
        leaderboard,
        gameStatus,
        submitAnswer,
        isHost,
        isHostPlaying,
        isIntermission,
    } = useGame();

    useEffect(() => {
        if (gameStatus === 'finished' && roomCode) {
            navigate(`/results/${roomCode}`);
        }
    }, [gameStatus, roomCode, navigate]);

    useEffect(() => {
        if (!roomCode && !urlRoomCode) {
            navigate('/lobby');
        }
    }, [roomCode, urlRoomCode, navigate]);

    // Warn user before leaving/refreshing during active game
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            // Only show warning if in active game (not waiting or finished)
            if (roomCode && gameStatus !== 'finished' && gameStatus !== 'waiting') {
                e.preventDefault();
                // Modern browsers require returnValue to be set
                e.returnValue = 'You are currently in a game room. Leaving will remove you from the room. Are you sure?';
                return e.returnValue;
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [roomCode, gameStatus]);

    const handleOptionSelect = (optionIndex) => {
        if (!answerLocked) {
            submitAnswer(optionIndex);
        }
    };

    if (!currentQuestion) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-pattern">
                <div className="text-center">
                    <div className="text-6xl animate-bounce mb-4">🎲</div>
                    <p className="font-doodle text-2xl text-gray-800 font-bold">Waiting for the next round...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 flex flex-col relative overflow-hidden bg-pattern">
            {/* Decorative Background Elements */}
            <div className="absolute top-10 left-10 text-9xl opacity-10 font-doodle transform -rotate-12 pointer-events-none">?</div>
            <div className="absolute bottom-10 right-10 text-9xl opacity-10 font-doodle transform rotate-12 pointer-events-none">!</div>

            {/* Intermission / Leaderboard Screen */}
            {isIntermission && (
                <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-4 animate-in fade-in duration-300">
                    {/* Host View: Controls + Leaderboard */}
                    {isHost && !isHostPlaying ? (
                        <div className="w-full max-w-5xl flex flex-col gap-6 h-full overflow-y-auto pt-10">
                            {/* Re-render Host Dashboard for Controls */}
                            <HostDashboard />

                            <div className="bg-white p-8 rounded-3xl border-4 border-black shadow-[8px_8px_0px_white] w-full transform -rotate-1">
                                <h2 className="text-4xl font-bold font-doodle text-center mb-6">🏆 Intermission Standings</h2>
                                <ScoreBoard
                                    leaderboard={leaderboard}
                                    currentUserId={user?.id}
                                />
                            </div>
                        </div>
                    ) : (
                        /* Player View: Leaderboard Only */
                        <div className="bg-white p-8 rounded-3xl border-4 border-black shadow-[8px_8px_0px_white] max-w-2xl w-full transform -rotate-1">
                            <h2 className="text-4xl font-bold font-doodle text-center mb-6">🏆 Intermission Standings</h2>
                            <ScoreBoard
                                leaderboard={leaderboard}
                                currentUserId={user?.id}
                            />
                            <div className="mt-6 text-center text-white font-bold animate-pulse text-xl">
                                Next question coming up...
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Header Info - Absolutely Positioned */}
            <div className="absolute top-2 md:top-6 left-2 md:left-6 z-20">
                <div className="bg-white border-2 border-black px-3 py-1 md:px-6 md:py-3 rounded-full transform -rotate-2 shadow-[4px_4px_0px_black]">
                    <span className="font-doodle font-bold text-sm md:text-2xl">Room: {roomCode}</span>
                </div>
            </div>

            <div className="absolute top-2 md:top-6 right-2 md:right-6 z-20">
                <div className="bg-white border-2 border-black px-3 py-1 md:px-6 md:py-3 rounded-full transform rotate-2 shadow-[4px_4px_0px_black]">
                    <span className="font-doodle font-bold text-sm md:text-2xl">
                        Q {(currentQuestion.questionIndex || 0) + 1}
                    </span>
                </div>
            </div>

            <div className="max-w-6xl mx-auto w-full relative z-10 flex flex-col items-center justify-start pt-16 md:pt-20 flex-grow">
                {/* Main Game Area */}
                <div className="w-full max-w-5xl">
                    {/* Timer Centered (Hide for Host-Only) */}
                    {(!isHost || isHostPlaying) && (
                        <div className="flex justify-center mb-4 md:-mb-10 relative z-20">
                            <div className="bg-white rounded-full p-1 md:p-2 border-2 md:border-4 border-black shadow-[2px_2px_0px_black] md:shadow-[4px_4px_0px_black] transform transition-transform hover:scale-110 scale-75 md:scale-90">
                                <Timer
                                    timeRemaining={timeRemaining}
                                    totalTime={currentQuestion.timeLimit}
                                />
                            </div>
                        </div>
                    )}

                    {/* Question Card */}
                    <div className="transform rotate-0 transition-all duration-300">
                        {isHost && !isHostPlaying ? (
                            <HostDashboard />
                        ) : (
                            <QuestionCard
                                questionText={currentQuestion.questionText}
                                options={currentQuestion.options}
                                selectedOption={selectedOption}
                                correctOption={correctOption}
                                onSelectOption={handleOptionSelect}
                                disabled={selectedOption !== null || answerLocked || (isHost && !isHostPlaying)}
                                mediaUrl={currentQuestion.mediaUrl}
                                mediaType={currentQuestion.mediaType}
                            />
                        )}
                    </div>

                    {/* Feedback Badge (Floating) */}
                    {answerLocked && (
                        <div className={`mt-4 md:mt-8 mx-auto max-w-md p-3 md:p-4 border-2 md:border-4 border-black rounded-xl text-center font-bold text-xl md:text-3xl font-doodle transform rotate-1 shadow-[4px_4px_0px_black] md:shadow-[6px_6px_0px_black] animate-bounce ${correctOption !== null
                            ? (selectedOption === correctOption ? 'bg-green-400 text-white' : 'bg-red-400 text-white')
                            : 'bg-yellow-300'
                            }`}>
                            {correctOption === null ? 'Answer Locked! 🔒' :
                                selectedOption === null ? "Time's Up! ⏰" :
                                    selectedOption === correctOption ? 'Nailed it! 🎉' : 'Oops! 🤦‍♂️'}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GameRoomPage;
