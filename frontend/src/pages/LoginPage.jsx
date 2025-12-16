import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Login/Register Page - Doodle Pop Theme
 */
const LoginPage = () => {
    const navigate = useNavigate();
    const { login, register, isAuthenticated } = useAuth();

    // Check auth on mount
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            let result;
            if (isLogin) {
                result = await login(formData.email, formData.password);
            } else {
                if (!formData.username) {
                    setError('Username is required');
                    setLoading(false);
                    return;
                }
                result = await register(formData.username, formData.email, formData.password);
            }

            if (result.success) {
                navigate('/');
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setError('');
        setFormData({ username: '', email: '', password: '' });
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md doodle-card bg-yellow-50 transform rotate-1">
                {/* Paper Tape Effect */}
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-32 h-8 bg-gray-200 opacity-80 rotate-2 z-10" style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}></div>

                <div className="text-center mb-8 mt-4">
                    <h1 className="text-4xl font-bold font-doodle mb-2">
                        {isLogin ? 'Welcome Back!' : 'Join the Chaos!'}
                    </h1>
                    <p className="text-gray-600 font-doodle text-xl">
                        {isLogin ? 'Ready to quiz?' : 'Create your doodle persona'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                        <div>
                            <label className="block text-lg font-bold mb-1 font-doodle">Username</label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                className="doodle-input"
                                placeholder="@cool_cat"
                                required={!isLogin}
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-lg font-bold mb-1 font-doodle">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="doodle-input"
                            placeholder="you@example.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-lg font-bold mb-1 font-doodle">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="doodle-input"
                            placeholder="shhh... secret"
                            required
                        />
                    </div>

                    {error && (
                        <div className="bg-red-100 border-2 border-red-500 text-red-700 p-3 rounded font-bold transform -rotate-1">
                            ⚠️ {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full doodle-button bg-blue-400 text-white border-gray-900 mt-6 hover:bg-blue-500"
                    >
                        {loading ? 'Thinking...' : (isLogin ? 'Log In' : 'Sign Up')}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <button
                        onClick={toggleMode}
                        className="font-doodle text-xl text-indigo-600 hover:text-indigo-800 underline decoration-wavy"
                    >
                        {isLogin ? 'Need an account? Sign Up!' : 'Have an account? Log In!'}
                    </button>
                </div>
            </div>

            <Link to="/" className="absolute top-4 left-4 font-doodle text-xl font-bold hover:underline">
                ← Back to Home
            </Link>
        </div>
    );
};

export default LoginPage;
