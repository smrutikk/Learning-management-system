require('dotenv').config();

// Debugging: Log environment variables to verify they are loaded
console.log("MONGO_URI:", process.env.MONGO_URI);
console.log("PORT:", process.env.PORT);


const express = require("express");
const mongoose = require("mongoose");
const chaptersRoutes = require("./routes/chapters");
const moduleRoutes = require("./routes/module");
const userRoutes = require("./routes/user");
const path = require("path");
const routes = require("./routes/ToDoRoute");
const { socketController } = require("./contollers/chatController");

// Express app created
const app = express();
const server = require("http").createServer(app);

// Socket.io and then I added CORS for cross-origin to localhost only
const io = require("socket.io")(server, {
  cors: {
    origin: "*", // specific origin you want to give access to,
  },
});

socketController(io);

const cors = require("cors");
const corsOptions = {
  origin: "*",
  credentials: true, // access-control-allow-credentials:true
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions)); // Use this after the variable declaration

// Middleware
app.use(express.json()); // Post-coming request data checks
app.use((req, res, next) => {
  console.log(req.path, req.method);
  next();
});

app.use("/api/chat", socketController);
app.use("/api/chapters", chaptersRoutes);
app.use("/api/module", moduleRoutes);
app.use("/api/user", userRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(routes);

// Connect to DB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    // Listen for requests
    const PORT = process.env.PORT || 5000;  // Default to 5000 if PORT is not set
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.log(error);
  });
