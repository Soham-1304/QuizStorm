import { useNavigate, useParams } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { useAuth } from '../context/AuthContext';
import { sortLeaderboard, getUserRank } from '../utils/helpers';
import Confetti from 'react-confetti';

/**
 * Results Page - Doodle Pop Design
 */
const ResultsPage = () => {
    const { roomCode } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { winner, leaderboard, resetGame } = useGame();

    const sortedLeaderboard = sortLeaderboard(leaderboard);
    const userRank = getUserRank(leaderboard, user?.id);

    const handleBackToLobby = () => {
        resetGame();
        navigate('/lobby');
    };

    return (
        <div className="min-h-screen bg-dots-pattern flex items-center justify-center p-4">
            <Confetti
                width={window.innerWidth}
                height={window.innerHeight}
                recycle={true}
                numberOfPieces={200}
                className="fixed inset-0 pointer-events-none z-0"
            />

            <div className="bg-white max-w-4xl w-full border-4 border-black shadow-[12px_12px_0px_rgba(0,0,0,1)] relative z-10 transform -rotate-1 overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="bg-yellow-400 border-b-4 border-black p-4 text-center transform rotate-1">
                    <h1 className="font-doodle font-bold text-3xl md:text-4xl text-black">
                        GAME OVER!
                    </h1>
                </div>

                <div className="p-4 md:p-6 overflow-y-auto flex-grow custom-scrollbar">

                    {/* Title */}
                    <div className="text-center mb-6">
                        <h2 className="text-4xl md:text-5xl font-bold font-doodle text-blue-600 mb-2 drop-shadow-sm">
                            The Results
                        </h2>
                        <div className="inline-block bg-black text-white font-doodle font-bold text-lg px-4 py-1 rounded-sm transform -rotate-2">
                            Room Code: <span className="underline decoration-wavy decoration-yellow-400">{roomCode}</span>
                        </div>
                    </div>

                    {/* Winner Spotlight */}
                    {winner && (
                        <div className="flex flex-col items-center justify-center mb-8 animate-bounce-slow">
                            <span className="text-5xl mb-2 filter drop-shadow-lg">🏆</span>
                            <div className="bg-yellow-100 border-2 border-black px-8 py-3 rounded-xl shadow-[4px_4px_0px_black] text-center transform rotate-1">
                                <div className="text-gray-500 font-doodle text-sm uppercase tracking-widest mb-1">Winner</div>
                                <div className="text-2xl md:text-3xl font-bold text-black">{winner.username}</div>
                                <div className="text-yellow-600 font-bold font-mono text-lg">{winner.score} pts</div>
                            </div>
                        </div>
                    )}    <div className="grid md:grid-cols-2 gap-8 mb-12">
                        {/* Leaderboard List */}
                        <div className="bg-gray-50 p-4 border-2 border-dashed border-gray-400 rounded">
                            <h3 className="font-doodle font-bold text-xl mb-4 border-b-2 border-gray-300 pb-2">Full Standings</h3>
                            <div className="space-y-3">
                                {sortedLeaderboard.map((player, index) => (
                                    <div key={player.userId} className="flex justify-between items-center font-doodle text-lg border-b border-gray-200 pb-1">
                                        <span className={`${index === 0 ? 'text-2xl' : ''}`}>
                                            {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`} {player.username}
                                        </span>
                                        <span className="font-bold">{player.score}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* User Stats Card */}
                        <div className="bg-blue-50 p-6 border-2 border-black transform rotate-2 flex flex-col justify-center items-center shadow-[6px_6px_0px_rgba(0,0,0,0.1)]">
                            <h3 className="font-doodle font-bold text-xl mb-4">Your Performance</h3>
                            <div className="text-6xl font-black text-blue-500 mb-2">
                                #{userRank}
                            </div>
                            <p className="font-doodle text-gray-600">Rank</p>

                            <div className="mt-6 w-full pt-6 border-t-2 border-blue-200 text-center">
                                <p className="text-4xl font-bold font-doodle">
                                    {sortedLeaderboard.find(p => p.userId === user?.id)?.score || 0}
                                </p>
                                <span className="text-sm font-bold uppercase tracking-wide text-gray-500">Points Earned</span>
                            </div>
                        </div>
                    </div>

                    <div className="text-center">
                        <button
                            onClick={handleBackToLobby}
                            className="doodle-button bg-pink-400 text-white hover:bg-pink-500 text-2xl py-4 px-12 transform -rotate-1 hover:rotate-1"
                        >
                            Back to Lobby 🏠
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ResultsPage;
