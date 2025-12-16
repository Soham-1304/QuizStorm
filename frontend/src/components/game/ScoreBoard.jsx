import { sortLeaderboard } from '../../utils/helpers';

/**
 * ScoreBoard - Doodle Pop Design
 */
const ScoreBoard = ({ leaderboard, currentUserId }) => {
    const sortedLeaderboard = sortLeaderboard(leaderboard);

    return (
        <div className="bg-yellow-50 p-4 border-2 border-gray-800 rounded-sm transform rotate-1 shadow-[5px_5px_0px_rgba(0,0,0,0.2)] relative">
            {/* Notebook Holes */}
            <div className="absolute top-0 left-4 w-4 h-4 bg-gray-800 rounded-full -mt-2"></div>
            <div className="absolute top-0 right-4 w-4 h-4 bg-gray-800 rounded-full -mt-2"></div>

            {/* Tape */}
            <div className="absolute -top-3 left-1/2 w-20 h-6 bg-pink-300 opacity-80 transform -translate-x-1/2 -rotate-2 shadow-sm"></div>

            <h3 className="text-xl font-bold font-doodle text-gray-800 mb-4 text-center border-b-2 border-gray-800 pb-2 border-dashed">
                🏆 Standings
            </h3>

            <div className="space-y-3">
                {sortedLeaderboard.map((player, index) => (
                    <div
                        key={player.userId}
                        className={`flex items-center justify-between p-2 border-b border-gray-300 font-doodle text-lg ${player.userId === currentUserId ? 'bg-yellow-200 -mx-2 px-4 rounded transform -rotate-1 shadow-sm' : ''
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <span className={`font-bold ${index < 3 ? 'text-2xl' : 'text-gray-500'}`}>
                                {index === 0 ? '👑' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                            </span>
                            <span className="font-bold truncate max-w-[120px]">
                                {player.username}
                                {player.userId === currentUserId && ' (Me)'}
                            </span>
                        </div>
                        <span className="font-black text-indigo-600">
                            {player.score}
                        </span>
                    </div>
                ))}

                {sortedLeaderboard.length === 0 && (
                    <p className="text-center text-gray-500 font-doodle">Waiting for scores...</p>
                )}
            </div>
        </div>
    );
};

export default ScoreBoard;
