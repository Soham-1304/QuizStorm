/**
 * Player List - Doodle Pop Design
 */
const PlayerList = ({ players, hostId }) => {
    if (!players || players.length === 0) {
        return (
            <div className="text-center py-8 text-gray-400 font-doodle text-xl">
                <div className="text-4xl mb-2 animate-bounce">👀</div>
                <p>Looking for players...</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {players.map((player, index) => (
                <div
                    key={player.userId}
                    className="flex items-center justify-between p-4 md:p-5 bg-white border-2 border-gray-800 rounded-xl shadow-[4px_4px_0px_rgba(0,0,0,0.1)]"
                    style={{ animationDelay: `${index * 0.1}s` }}
                >
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full border-2 border-black flex items-center justify-center text-white font-bold font-doodle text-xl ${['bg-blue-400', 'bg-pink-400', 'bg-yellow-400', 'bg-green-400'][index % 4]
                            }`}>
                            {player.username.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-bold text-gray-800 font-doodle text-xl md:text-2xl">{player.username}</span>
                    </div>
                    {player.userId === hostId && (
                        <span className="px-3 py-1 bg-yellow-300 text-black border-2 border-black text-sm font-bold uppercase rounded-full transform rotate-3 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                            Host
                        </span>
                    )}
                </div>
            ))}
        </div>
    );
};

export default PlayerList;
