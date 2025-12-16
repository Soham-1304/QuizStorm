import { useState, useEffect } from 'react';
import { getStats, getQuestions, addQuestion, deleteQuestion } from '../api/adminApi';

/**
 * Admin Dashboard - Doodle Pop Theme
 */
const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [newQuestion, setNewQuestion] = useState({
        questionText: '',
        options: ['', '', '', ''],
        correctOptionIndex: 0,
        timeLimit: 20
    });
    const [activeTab, setActiveTab] = useState('stats');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadStats();
        loadQuestions();
    }, []);

    const loadStats = async () => {
        try {
            const res = await getStats();
            setStats(res);
        } catch (err) {
            console.error('Failed to load stats');
        }
    };

    const loadQuestions = async () => {
        try {
            const res = await getQuestions();
            setQuestions(res);
        } catch (err) {
            console.error('Failed to load questions');
        }
    };

    const handleAddQuestion = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await addQuestion(newQuestion);
            setNewQuestion({
                questionText: '',
                options: ['', '', '', ''],
                correctOptionIndex: 0,
                timeLimit: 20
            });
            loadQuestions();
            alert('Question added! 🎉');
        } catch (err) {
            alert('Failed to add question');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteQuestion = async (id) => {
        if (!window.confirm('Are you sure?')) return;
        try {
            await deleteQuestion(id);
            loadQuestions();
        } catch (err) {
            alert('Failed to delete');
        }
    };

    return (
        <div className="min-h-screen p-8 bg-paper">
            <h1 className="text-5xl font-bold font-doodle mb-8 transform -rotate-2">
                👮 Admin HQ
            </h1>

            {/* Tabs */}
            <div className="flex gap-4 mb-8 font-doodle font-bold text-xl">
                <button
                    onClick={() => setActiveTab('stats')}
                    className={`px-6 py-2 rounded-full border-2 border-black transition-all ${activeTab === 'stats' ? 'bg-yellow-300 shadow-[4px_4px_0px_black] -translate-y-1' : 'bg-white hover:bg-gray-100'}`}
                >
                    Stats 📊
                </button>
                <button
                    onClick={() => setActiveTab('questions')}
                    className={`px-6 py-2 rounded-full border-2 border-black transition-all ${activeTab === 'questions' ? 'bg-blue-300 shadow-[4px_4px_0px_black] -translate-y-1' : 'bg-white hover:bg-gray-100'}`}
                >
                    Questions ❓
                </button>
            </div>

            {/* Stats Tab */}
            {activeTab === 'stats' && stats && (
                <div className="grid md:grid-cols-4 gap-6">
                    <div className="doodle-card bg-green-100 transform rotate-1">
                        <h3 className="font-bold text-xl mb-2">Total Users</h3>
                        <p className="text-5xl font-black">{stats.totalUsers}</p>
                    </div>
                    <div className="doodle-card bg-pink-100 transform -rotate-1">
                        <h3 className="font-bold text-xl mb-2">Total Games</h3>
                        <p className="text-5xl font-black">{stats.totalGames}</p>
                    </div>
                    <div className="doodle-card bg-purple-100 transform rotate-2">
                        <h3 className="font-bold text-xl mb-2">Active Rooms</h3>
                        <p className="text-5xl font-black">{stats.activeRooms}</p>
                    </div>
                    <div className="doodle-card bg-orange-100 transform -rotate-2">
                        <h3 className="font-bold text-xl mb-2">Questions</h3>
                        <p className="text-5xl font-black">{stats.totalQuestions}</p>
                    </div>
                </div>
            )}

            {/* Questions Tab */}
            {activeTab === 'questions' && (
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Add Question Form */}
                    <div className="doodle-card bg-white">
                        <h2 className="text-2xl font-bold font-doodle mb-4">Add New Question</h2>
                        <form onSubmit={handleAddQuestion} className="space-y-4">
                            <div>
                                <label className="block font-bold">Question Text</label>
                                <input
                                    className="doodle-input"
                                    value={newQuestion.questionText}
                                    onChange={e => setNewQuestion({ ...newQuestion, questionText: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                {newQuestion.options.map((opt, i) => (
                                    <div key={i}>
                                        <label className="block font-bold">Option {i + 1}</label>
                                        <input
                                            className="doodle-input text-sm p-2"
                                            value={opt}
                                            onChange={e => {
                                                const newOpts = [...newQuestion.options];
                                                newOpts[i] = e.target.value;
                                                setNewQuestion({ ...newQuestion, options: newOpts });
                                            }}
                                            required
                                        />
                                    </div>
                                ))}
                            </div>
                            <div>
                                <label className="block font-bold">Correct Option (0-3)</label>
                                <select
                                    className="doodle-input"
                                    value={newQuestion.correctOptionIndex}
                                    onChange={e => setNewQuestion({ ...newQuestion, correctOptionIndex: parseInt(e.target.value) })}
                                >
                                    {[0, 1, 2, 3].map(i => <option key={i} value={i}>Option {i + 1}</option>)}
                                </select>
                            </div>
                            <button className="doodle-button bg-green-400 w-full" disabled={loading}>
                                Add Question ➕
                            </button>
                        </form>
                    </div>

                    {/* Question List */}
                    <div className="doodle-card bg-gray-50 h-[600px] overflow-y-auto">
                        <h2 className="text-2xl font-bold font-doodle mb-4">Question Bank ({questions.length})</h2>
                        <div className="space-y-4">
                            {questions.map(q => (
                                <div key={q._id} className="bg-white p-4 border-2 border-gray-200 rounded text-sm relative group">
                                    <p className="font-bold mb-2">{q.questionText}</p>
                                    <ul className="list-disc pl-4 text-gray-600">
                                        {q.options.map((opt, i) => (
                                            <li key={i} className={i === q.correctOptionIndex ? 'text-green-600 font-bold' : ''}>
                                                {opt}
                                            </li>
                                        ))}
                                    </ul>
                                    <button
                                        onClick={() => handleDeleteQuestion(q._id)}
                                        className="absolute top-2 right-2 text-red-500 font-bold opacity-0 group-hover:opacity-100"
                                    >
                                        Delete 🗑️
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
