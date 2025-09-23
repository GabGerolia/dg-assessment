const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const projectRoutes = require("./routes/projectRoutes");
const columnRoutes = require("./routes/columnRoutes");
const taskRoutes = require("./routes/taskRoutes");
const logRoutes = require("./routes/logRoutes");

const app = express();

app.use(express.json());
app.use(cors({ origin: ["https://dg-assessment.vercel.app", "http://localhost:5173"] }));

// routes
app.use("/api", authRoutes);
app.use("/api", projectRoutes);
app.use("/", columnRoutes); 
app.use("/", taskRoutes);
app.use("/api", logRoutes);

app.listen(8080, () => {
  console.log("Server started on port 8080");
});
