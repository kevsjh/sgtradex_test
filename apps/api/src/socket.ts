import { Server, ServerOptions } from 'socket.io';
import type { Server as HttpServer } from 'http';

let io: Server;

export function initializeSocket(httpServer: HttpServer): Server {
    const options: Partial<ServerOptions> = {
        cors: {
            origin: process.env.FRONTEND_URL || "http://localhost:3000",
            methods: ["GET", "POST"]
        }
    };

    io = new Server(httpServer, options);

    io.on('connection', (socket) => {
        console.log('A user connected');

        socket.on('disconnect', () => {
            console.log('User disconnected');
        });
    });

    return io;
}

export function getIO(): Server {
    if (!io) {
        throw new Error('Socket.IO has not been initialized. Please call initializeSocket first.');
    }
    return io;
}