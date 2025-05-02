import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { createServer } from "http";
import swaggerUi from "swagger-ui-express";
import connectDB from "./src/configs/db.config.js";
import logger from "./src/configs/logger.config.js";
import { initSocket } from "./src/configs/socket.config.js";
import errorHandler from "./src/middlewares/errorhandler.middleware.js";
import routes from "./src/routes/index.js";
import authService from "./src/services/auth.service.js";
import { swaggerSpecs } from "./src/utils/constants.js";
dotenv.config();

// Initialize Express app
const app = express();
const httpServer = createServer(app);
const io = initSocket(httpServer);

// Track connected clients
const connectedClients = new Map();

// Connect to the database
connectDB().then(() => {
  authService.createAdminUser();
});

// Configure CORS for Express - Add additional options for better security
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Serve Swagger UI
app.use("/api/swagger", swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Middlewares
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

app.use("/images", express.static("public/images"));

// Routes
app.use("/api/auth", routes.authRoutes);
app.use("/api/ping", routes.pingRoutes);
app.use("/api/products", routes.productRoutes);
app.use("/api/address", routes.addressRoutes);
app.use("/api/orders", routes.orderRoutes);
app.use("/api/config", routes.drinksnepalconfigRoutes);
app.use("/api/analytics", routes.analyticsRoutes);

// Health check
app.get("/", (req, res) => {
  res.send("E-commerce Backend is running");
});

io.on("connection", (socket) => {
  const clientId = socket.handshake.query.clientId || socket.id;

  // Check if this client is already connected
  if (connectedClients.has(clientId)) {
    logger.warn(`Duplicate connection attempt from client: ${clientId}`);
    socket.disconnect(true);
    return;
  }

  connectedClients.set(clientId, socket.id);
  logger.info(`Socket connected: ${socket.id} (Client: ${clientId})`);

  socket.on("updateLocation", (data) => {
    const { orderId, latitude, longitude } = data;
    io.emit(`order_location_${orderId}`, {
      latitude,
      longitude,
    });
    logger.info(
      `Location updated for order ${orderId}: ${latitude}, ${longitude}`
    );
  });

  socket.on("error", (error) => {
    logger.error(`Socket error for ${socket.id}: ${error.message}`);
  });

  socket.on("disconnect", () => {
    connectedClients.delete(clientId);
    logger.info(`Socket disconnected: ${socket.id} (Client: ${clientId})`);
  });
});

io.engine.on("connection_error", (err) => {
  logger.error(
    `Socket.IO connection error: ${err.req.url} ${err.code} ${err.message}`
  );
});

io.on("connect_error", (error) => {
  logger.error(`Socket.IO connect error: ${error.message}`);
});

// Error Handler Middleware (should be after all routes)
app.use(errorHandler);

// Start the server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
