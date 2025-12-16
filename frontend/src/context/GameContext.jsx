import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { initSocket, connectSocket, disconnectSocket, getSocket } from '../socket/socketClient';
import { emitJoinRoom, emitStartGame, emitSubmitAnswer, emitSkipTimer } from '../socket/socketEvents';
import { useAuth } from './AuthContext';
import { GAME_STATUS } from '../utils/constants';

/**
 * Game Context
 * Manages game state and socket connection
 */
const GameContext = createContext(null);

/**
 * Custom hook to use game context
 */
export const useGame = () => {
    const context = useContext(GameContext);
    if (!context) {
        throw new Error('useGame must be used within GameProvider');
    }
    return context;
};

/**
 * Game Provider Component
 */
export const GameProvider = ({ children }) => {
    const { token, user } = useAuth();

    // Game state
    const [roomCode, setRoomCode] = useState(null);
    const [players, setPlayers] = useState([]);
    const [hostId, setHostId] = useState(null);
    const [gameStatus, setGameStatus] = useState(GAME_STATUS.WAITING);

    // Question state
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [timeRemaining, setTimeRemaining] = useState(0);

    // Answer state
    const [selectedOption, setSelectedOption] = useState(null);
    const [answerLocked, setAnswerLocked] = useState(false);
    const [correctOption, setCorrectOption] = useState(null);

    // Leaderboard state
    const [leaderboard, setLeaderboard] = useState([]);
    const [winner, setWinner] = useState(null);

    // Room Metadata
    const [quiz, setQuiz] = useState(null);
    const [settings, setSettings] = useState(null);

    // Intermission state
    const [isIntermission, setIsIntermission] = useState(false);

    // Answer tracking
    const [answersCount, setAnswersCount] = useState(0);
    const [totalPlayers, setTotalPlayers] = useState(0);

    // Socket instance
    const [socket, setSocket] = useState(null);

    /**
     * Initialize socket connection
     */
    const initializeSocket = useCallback(() => {
        if (!token) return;

        const socketInstance = initSocket(token);
        setSocket(socketInstance);
        connectSocket();

        // Socket connection events
        socketInstance.on('connect', () => {
            console.log('✅ Connected to game server');
        });

        socketInstance.on('connect_error', (error) => {
            console.error('❌ Connection error:', error.message);
        });

        socketInstance.on('error', (error) => {
            console.error('❌ Socket error:', error);
        });

        // Game events
        socketInstance.on('player-joined', (data) => {
            console.log('👤 Player joined:', data);
            setPlayers(data.players);
            setTotalPlayers(data.totalPlayers);
        });

        socketInstance.on('game-started', (data) => {
            console.log('🎮 Game started:', data);
            setGameStatus(GAME_STATUS.LIVE);
            setIsIntermission(false);
        });

        socketInstance.on('new-question', (data) => {
            console.log('❓ New question:', data);
            setCurrentQuestion({
                questionText: data.questionText,
                options: data.options,
                questionIndex: data.questionIndex,
                timeLimit: data.timeLimit,
                mediaUrl: data.mediaUrl,
                mediaType: data.mediaType,
            });
            setTimeRemaining(data.timeLimit);
            setSelectedOption(null);
            setAnswerLocked(false);
            setCorrectOption(null);
            setIsIntermission(false); // Hide leaderboard
            setAnswersCount(0); // Reset count
        });

        socketInstance.on('timer-update', (data) => {
            setTimeRemaining(data.timeRemaining);
        });

        socketInstance.on('answer-result', (data) => {
            console.log('✅ Answer result:', data);
            setCorrectOption(data.correctOptionIndex);
            setAnswerLocked(true);
        });

        socketInstance.on('round-ended', (data) => {
            console.log('🛑 Round ended:', data);
            setCorrectOption(data.correctOptionIndex);
            setAnswerLocked(true);
        });

        socketInstance.on('score-update', (data) => {
            console.log('📊 Score update:', data);
            setLeaderboard(data.leaderboard);
            if (data.isIntermission) setIsIntermission(true);
        });

        socketInstance.on('update-answer-count', (data) => {
            setAnswersCount(data.count);
            setTotalPlayers(data.totalPlayers);
        });

        socketInstance.on('game-ended', (data) => {
            console.log('🏁 Game ended:', data);
            setGameStatus(GAME_STATUS.FINISHED);
            setWinner(data.winner);
            setLeaderboard(data.finalLeaderboard);
            setIsIntermission(false);
        });

        return socketInstance;
    }, [token]);

    // Auto-initialize socket when user is authenticated
    useEffect(() => {
        if (token && !socket) {
            initializeSocket();
        }
    }, [token, socket, initializeSocket]);

    /**
     * Join a room
     */
    const joinRoom = useCallback((code) => {
        if (!socket || !user) return;

        setRoomCode(code);
        emitJoinRoom(socket, code, user.id, user.username);
    }, [socket, user]);

    /**
     * Start game (host only)
     */
    const startGame = useCallback(() => {
        if (!socket || !roomCode) return;

        emitStartGame(socket, roomCode);
    }, [socket, roomCode]);

    /**
     * Submit answer
     */
    const submitAnswer = useCallback((optionIndex) => {
        if (!socket || !roomCode || !user || answerLocked) return;

        setSelectedOption(optionIndex);
        emitSubmitAnswer(socket, roomCode, user.id, optionIndex);
    }, [socket, roomCode, user, answerLocked]);

    /**
     * Reset game state
     */
    const resetGame = useCallback(() => {
        setRoomCode(null);
        setPlayers([]);
        setHostId(null);
        setGameStatus(GAME_STATUS.WAITING);
        setCurrentQuestion(null);
        setTimeRemaining(0);
        setSelectedOption(null);
        setAnswerLocked(false);
        setCorrectOption(null);
        setLeaderboard([]);
        setWinner(null);
        setAnswersCount(0);
    }, []);

    // Check if current user is host
    const isHost = useMemo(() => {
        return user && hostId && user.id === hostId;
    }, [user, hostId]);

    /**
     * Skip Timer / Next Stage (Host only)
     */
    const skipTimer = useCallback(() => {
        if (!socket || !roomCode || !user) return;

        // If answers locked (round ended), this acts as 'next stage'
        if (answerLocked || isIntermission) {
            socket.emit('host-next-stage', { roomCode, userId: user.id });
        } else {
            emitSkipTimer(socket, roomCode, user.id);
        }
    }, [socket, roomCode, user, answerLocked, isIntermission]);

    /**
     * Set room info (from REST API)
     */
    const setRoomInfo = useCallback((room) => {
        setRoomCode(room.roomCode);
        setPlayers(room.players);
        setHostId(room.hostId);
        setGameStatus(room.status);
        setQuiz(room.quiz);
        setSettings(room.settings);
    }, []);

    // Check if host is playing
    const isHostPlaying = useMemo(() => {
        return settings?.isHostPlaying ?? true;
    }, [settings]);

    // Check if current user is admin
    const isAdmin = useMemo(() => {
        return user && user.role === 'admin';
    }, [user]);

    // Memoize context value
    const value = useMemo(
        () => ({
            // State
            roomCode,
            players,
            hostId,
            isHost,
            isAdmin,
            gameStatus,
            currentQuestion,
            timeRemaining,
            selectedOption,
            answerLocked,
            correctOption,
            leaderboard,
            winner,
            socket,
            quiz,        // New
            settings,    // New
            isHostPlaying, // New helper
            isIntermission, // New state
            answersCount, // New state
            totalPlayers, // New state

            // Methods
            initializeSocket,
            joinRoom,
            startGame,
            submitAnswer,
            resetGame,
            setRoomInfo,
            skipTimer,   // New
        }),
        [
            roomCode,
            players,
            hostId,
            isHost,
            gameStatus,
            currentQuestion,
            timeRemaining,
            selectedOption,
            answerLocked,
            correctOption,
            leaderboard,
            winner,
            socket,
            quiz,
            settings,
            isHostPlaying,
            isAdmin,
            isIntermission,
            answersCount,
            totalPlayers,
            initializeSocket,
            joinRoom,
            startGame,
            submitAnswer,
            resetGame,
            setRoomInfo,
            skipTimer
        ]
    );

    return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};
