import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProfile, getHistory, updateProfile } from '../api/userApi';
import { useAuth } from '../context/AuthContext';

/**
 * Profile Page - Doodle Pop Design
 */
const ProfilePage = () => {
    const { username } = useParams();
    const { user: currentUser } = useAuth();
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);
    const [history, setHistory] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({ bio: '', avatar: '' });

    const isOwnProfile = !username || (currentUser && currentUser.username === username);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // If username param exists, fetch that profile. Else fetch current user's full profile including history
                let targetUsername = username || currentUser?.username;
                if (!targetUsername) return;

                // Sanitize: strip leading @ if present (frontend fix)
                if (targetUsername.startsWith('@')) {
                    targetUsername = targetUsername.slice(1);
                }

                const profileData = await getProfile(targetUsername);
                setProfile(profileData);
                setEditForm({ bio: profileData.bio || '', avatar: profileData.avatar || '' });

                if (isOwnProfile) {
                    const historyData = await getHistory();
                    setHistory(historyData);
                }
            } catch (err) {
                console.error('Failed to load profile');
            }
        };
        fetchData();
    }, [username, currentUser, isOwnProfile]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await updateProfile(editForm);
            setProfile({ ...profile, ...editForm });
            setIsEditing(false);
        } catch (err) {
            alert('Failed to update profile');
        }
    };

    if (!profile) return <div className="text-center p-8 font-doodle text-2xl">Loading profile... 🐌</div>;

    return (
        <div className="min-h-screen p-4 md:p-8 max-w-5xl mx-auto">
            <button onClick={() => navigate('/lobby')} className="mb-8 font-bold font-doodle text-xl hover:underline">
                ← Back to Lobby
            </button>

            <div className="grid md:grid-cols-3 gap-8">
                {/* Profile Card */}
                <div className="md:col-span-1">
                    <div className="doodle-card bg-yellow-50 text-center transform -rotate-1 sticky top-4">
                        <div className="w-32 h-32 mx-auto rounded-full border-4 border-black bg-white overflow-hidden mb-4 shadow-[4px_4px_0px_black]">
                            {profile.avatar ? (
                                <img src={profile.avatar} alt="avatar" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-4xl font-bold bg-pink-200">
                                    {profile.username.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>

                        <h1 className="text-3xl font-bold font-doodle mb-2">{profile.username}</h1>
                        <div className="inline-block px-3 py-1 bg-gray-200 rounded-full text-sm font-bold uppercase mb-4">
                            {profile.role}
                        </div>

                        {!isEditing ? (
                            <p className="text-gray-600 font-doodle text-lg italic mb-6">"{profile.bio || 'No bio yet!'}"</p>
                        ) : (
                            <form onSubmit={handleUpdate} className="mb-6 space-y-3">
                                <input
                                    className="doodle-input text-sm"
                                    placeholder="Bio"
                                    value={editForm.bio}
                                    onChange={e => setEditForm({ ...editForm, bio: e.target.value })}
                                />
                                <input
                                    className="doodle-input text-sm"
                                    placeholder="Avatar URL"
                                    value={editForm.avatar}
                                    onChange={e => setEditForm({ ...editForm, avatar: e.target.value })}
                                />
                                <div className="flex gap-2">
                                    <button type="submit" className="flex-1 bg-green-400 text-white font-bold py-1 rounded border-2 border-black">Save</button>
                                    <button type="button" onClick={() => setIsEditing(false)} className="flex-1 bg-gray-300 font-bold py-1 rounded border-2 border-black">Cancel</button>
                                </div>
                            </form>
                        )}

                        {isOwnProfile && !isEditing && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="w-full bg-blue-300 font-bold py-2 rounded border-2 border-black transform hover:-translate-y-1 hover:shadow-md transition-all font-doodle"
                            >
                                Edit Profile ✏️
                            </button>
                        )}
                    </div>
                </div>

                {/* Stats & History */}
                <div className="md:col-span-2 space-y-8">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-green-100 p-4 rounded border-2 border-black text-center transform rotate-1">
                            <span className="block text-3xl font-black">{profile.stats?.wins || 0}</span>
                            <span className="font-doodle font-bold text-gray-600">Wins 🏆</span>
                        </div>
                        <div className="bg-blue-100 p-4 rounded border-2 border-black text-center transform -rotate-1">
                            <span className="block text-3xl font-black">{profile.stats?.gamesPlayed || 0}</span>
                            <span className="font-doodle font-bold text-gray-600">Games 🎮</span>
                        </div>
                        <div className="bg-purple-100 p-4 rounded border-2 border-black text-center transform rotate-1">
                            <span className="block text-3xl font-black">{profile.stats?.totalPoints || 0}</span>
                            <span className="font-doodle font-bold text-gray-600">Points ⭐</span>
                        </div>
                    </div>

                    {/* Match History */}
                    {isOwnProfile && (
                        <div className="doodle-card bg-white min-h-[400px]">
                            <h2 className="text-2xl font-bold font-doodle mb-6 border-b-2 border-gray-200 pb-2">
                                Match History 📜
                            </h2>
                            {history.length > 0 ? (
                                <div className="space-y-4">
                                    {history.map((game, i) => (
                                        <div key={i} className="flex justify-between items-center p-3 border-2 border-gray-100 hover:border-black rounded transition-colors group">
                                            <div>
                                                <div className="font-bold text-gray-800">
                                                    {new Date(game.playedAt).toLocaleDateString()}
                                                </div>
                                                <div className="text-gray-500 text-sm">Room {game.roomCode}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold text-xl text-indigo-600">
                                                    {game.players.find(p => p.userId === currentUser.id)?.score} pts
                                                </div>
                                                {game.winner && game.winner._id === currentUser.id && (
                                                    <span className="text-xs bg-yellow-300 px-2 py-0.5 rounded-full font-bold border border-black">WINNER</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-gray-500 font-doodle py-12">No games played yet. Go play!</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
