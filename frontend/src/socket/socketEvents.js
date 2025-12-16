export const emitJoinRoom = (socket, roomCode, userId, username) => {
    socket.emit('join-room', { roomCode, userId, username });
};

export const emitStartGame = (socket, roomCode) => {
    socket.emit('start-game', { roomCode });
};

export const emitSubmitAnswer = (socket, roomCode, userId, selectedOptionIndex) => {
    socket.emit('submit-answer', { roomCode, userId, selectedOptionIndex });
};

export const emitSkipTimer = (socket, roomCode, userId) => {
    socket.emit('skip-timer', { roomCode, userId });
};
