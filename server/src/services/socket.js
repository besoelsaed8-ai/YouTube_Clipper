/**
 * Socket.io Service
 * Real-time progress updates for video processing
 * Clients connect and receive live updates on their job progress
 */

const { Server } = require('socket.io');

let io = null;

/**
 * Initialize Socket.io server
 * @param {http.Server} httpServer - HTTP server instance
 * @returns {Server} Socket.io server
 */
function initSocket(httpServer) {
    io = new Server(httpServer, {
        cors: {
            origin: process.env.CLIENT_URL || '*',
            methods: ['GET', 'POST'],
        },
        pingTimeout: 60000,
        pingInterval: 25000,
    });

    io.on('connection', (socket) => {
        console.log(`[Socket] Client connected: ${socket.id}`);

        // Join a room for their specific job
        socket.on('join-job', (jobId) => {
            socket.join(`job:${jobId}`);
            console.log(`[Socket] ${socket.id} joined job:${jobId}`);
        });

        // Leave job room
        socket.on('leave-job', (jobId) => {
            socket.leave(`job:${jobId}`);
        });

        socket.on('disconnect', () => {
            console.log(`[Socket] Client disconnected: ${socket.id}`);
        });
    });

    console.log('[Socket] Socket.io initialized');
    return io;
}

/**
 * Emit progress update to a specific job
 * @param {string} jobId - Job ID
 * @param {Object} progress - { stage, percent, message }
 */
function emitProgress(jobId, progress) {
    if (!io) return;

    io.to(`job:${jobId}`).emit('progress', {
        jobId,
        ...progress,
        timestamp: Date.now(),
    });
}

/**
 * Emit job completed event
 */
function emitCompleted(jobId, result) {
    if (!io) return;

    io.to(`job:${jobId}`).emit('completed', {
        jobId,
        ...result,
        timestamp: Date.now(),
    });
}

/**
 * Emit job failed event
 */
function emitFailed(jobId, error) {
    if (!io) return;

    io.to(`job:${jobId}`).emit('failed', {
        jobId,
        error: error.message || 'Unknown error',
        timestamp: Date.now(),
    });
}

/**
 * Emit to all connected clients
 */
function emitBroadcast(event, data) {
    if (!io) return;

    io.emit(event, {
        ...data,
        timestamp: Date.now(),
    });
}

/**
 * Get connected client count
 */
function getClientCount() {
    return io ? io.engine.clientsCount : 0;
}

/**
 * Get Socket.io server instance
 */
function getIO() {
    return io;
}

module.exports = {
    initSocket,
    emitProgress,
    emitCompleted,
    emitFailed,
    emitBroadcast,
    getClientCount,
    getIO,
};
