const socketIo = require('socket.io');

let io;
// Map to store connected users: { userId: socketId }
const connectedUsers = new Map();

module.exports = {
    init: (server) => {
        io = socketIo(server, {
            cors: {
                origin: '*', // Should be restricted in production
                methods: ['GET', 'POST', 'PUT', 'DELETE']
            }
        });

        io.on('connection', (socket) => {
            console.log('New client connected:', socket.id);

            // Expect frontend to emit 'register' with their user ID upon connecting
            socket.on('register', (userId) => {
                if (userId) {
                    connectedUsers.set(userId, socket.id);
                    console.log(`User ${userId} registered with socket ${socket.id}`);
                }
            });

            socket.on('disconnect', () => {
                console.log('Client disconnected:', socket.id);
                // Remove the user from the map when they disconnect
                for (let [userId, mappedSocketId] of connectedUsers.entries()) {
                    if (mappedSocketId === socket.id) {
                        connectedUsers.delete(userId);
                        break;
                    }
                }
            });
        });

        return io;
    },
    getIo: () => {
        if (!io) {
            throw new Error('Socket.io not initialized!');
        }
        return io;
    },
    // Helper to send real-time notification to a specific user
    sendNotificationToUser: (userId, notificationData) => {
        const socketId = connectedUsers.get(userId.toString());
        if (socketId && io) {
            io.to(socketId).emit('newNotification', notificationData);
        }
    }
};
