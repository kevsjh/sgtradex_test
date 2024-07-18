import express from 'express';
import { createServer } from 'http';
import { Server, } from 'socket.io';
import { log } from "@repo/logger";
import { expressApp } from './server';
import { initializeSocket } from './socket';




const port = process.env.PORT || 3001;
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
const expressServer = expressApp();
const server = createServer(expressServer);

// const io = new Server(server, {
//   cors: {
//     origin: frontendUrl,
//     methods: ["GET", "POST"]
//   }
// });

// Initialize Socket.IO
initializeSocket(server);

server.listen(port, () => {
  log(`api running on ${port}`);
});



