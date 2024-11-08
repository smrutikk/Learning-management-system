require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const chaptersRoutes = require("./routes/chapters");
const moduleRoutes = require("./routes/module");
const userRoutes = require("./routes/user");
const path = require("path");
const routes = require("./routes/ToDoRoute");
const {
  socketController
} = require("./controllers/chatController");
mongoose.set('strictQuery', true);

// Express app created
const app = express();
const server = require("http").createServer(app);

// Socket.io with CORS settings
const io = require("socket.io")(server, {
  cors: {
    origin: "*" // You can specify specific origins here
  }
});
socketController(io);
const cors = require("cors");
const corsOptions = {
  origin: "*",
  credentials: true,
  // access-control-allow-credentials:true
  optionSuccessStatus: 200
};
app.use(cors(corsOptions)); // Apply CORS options

// Middleware
app.use(express.json());
app.use((req, res, next) => {
  console.log(req.path, req.method);
  next();
});

// Routes
app.use("/api/chat", socketController);
app.use("/api/chapters", chaptersRoutes);
app.use("/api/module", moduleRoutes);
app.use("/api/user", userRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(routes);

// Connect to the database and start the server
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  const port = process.env.PORT || 3000;
  server.listen(port, () => {
    console.log(`Server is running and listening on port ${port}`);
  });
}).catch(error => {
  console.log("Database connection error:", error);
});