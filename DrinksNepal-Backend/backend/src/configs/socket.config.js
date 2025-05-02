import { Server } from "socket.io";
let io;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    path: "/socket.io",
    cors: {
      origin: process.env.FRONTEND_URL,
      methods: ["GET", "POST"],
      allowedHeaders: ["*"],
      credentials: true,
    },
    transports: ["websocket", "polling"],
  });

  return io;
};

export { io };
