import { useGame } from '../../context/GameContext';

const HostDashboard = () => {
    const {
        skipTimer,
        timeRemaining,
        currentQuestion,
        players,
        answersCount,
        totalPlayers,
        answerLocked,
        isIntermission
    } = useGame();

    // Determine button text and state
    let buttonText = "⏭️ End Question";
    let buttonSubtext = "Force reveal answers";
    let isNextPhase = false;

    if (answerLocked && !isIntermission) {
        buttonText = "📊 Show Leaderboard";
        buttonSubtext = "Move to standings";
        isNextPhase = true;
    } else if (isIntermission) {
        buttonText = "➡️ Next Question";
        buttonSubtext = "Start next round";
        isNextPhase = true;
    }

    // Use totalPlayers from socket or list length fallback
    const displayTotalPlayers = totalPlayers || players.length;

    return (
        <div className="doodle-card bg-purple-100 transform rotate-1 mb-8 p-10">
            <h2 className="text-4xl font-bold font-doodle mb-8 text-center">🧠 Host Control Center</h2>

            <div className="grid grid-cols-3 gap-8">
                {/* Timer Box */}
                <div className="text-center bg-white p-6 rounded-xl border-4 border-black transform -rotate-1 shadow-lg">
                    <p className="font-bold text-gray-500 uppercase text-lg tracking-widest mb-2">Time</p>
                    <p className={`text-7xl font-black ${timeRemaining < 5 && currentQuestion.timeLimit > 0 ? 'text-red-500 animate-pulse' : 'text-black'}`}>
                        {currentQuestion.timeLimit === 0 ? '∞' : timeRemaining}
                    </p>
                </div>

                {/* Answer Count Box */}
                <div className="text-center bg-white p-6 rounded-xl border-4 border-black transform rotate-1 shadow-lg">
                    <p className="font-bold text-gray-500 uppercase text-lg tracking-widest mb-2">Answers</p>
                    <p className="text-7xl font-black text-blue-600">
                        {answersCount}<span className="text-4xl text-gray-400">/{displayTotalPlayers}</span>
                    </p>
                </div>

                {/* Control Button */}
                <div className="flex flex-col justify-center space-y-2">
                    <button
                        onClick={skipTimer}
                        className={`doodle-button w-full py-6 text-2xl shadow-[6px_6px_0px_black] hover:shadow-[8px_8px_0px_black] transition-all transform hover:-translate-y-1 ${isNextPhase ? 'bg-green-400 hover:bg-green-500 text-black' : 'bg-red-400 hover:bg-red-500 text-white'
                            }`}
                    >
                        {buttonText}
                    </button>
                    <p className="text-center text-sm font-bold mt-2 text-gray-500">
                        {buttonSubtext}
                    </p>
                </div>
            </div>

            <div className="mt-12">
                <h3 className="font-bold font-doodle text-2xl mb-4">Live Question:</h3>
                <p className="bg-white p-6 rounded-xl border-4 border-black font-doodle text-2xl shadow-md">
                    {currentQuestion.questionText}
                </p>
            </div>
        </div>
    );
};

export default HostDashboard;
