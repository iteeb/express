const express = require("express");
const app = express();
require("dotenv").config();
const PORT = process.env.PORT;
const cors = require("cors");
const cookieParser = require("cookie-parser");
const User = require("./models/user");
const projectRoutes = require("./routes/projectRoute");
const taskRoutes = require("./routes/taskRoute");
const mongoose = require("mongoose");

app.use(
  cors({
    origin: ["http://localhost:4200"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);

app.use(express.json());
// Celui-là permet à Express de lire les données envoyées depuis un formulaire HTML classique.
app.use(express.urlencoded({ extended: true }));
// Ce middleware permet à Express de lire les cookies envoyés par le navigateur.
app.use(cookieParser());


 // FAKE manager temporaire pur tester l 
app.use((req, res, next) => {
  req.user = {
    id: "507f1f77bcf86cd799439011",  
    role: "manager",              
  };
  next();
});


// Routes
app.use("/projects", projectRoutes);
app.use("/tasks", taskRoutes);
 
// CONNEXION MongoDB
const connect = async () => {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/M1ISIDS");
    console.log("✅ MongoDB database connected");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err);
    process.exit(1);
  }
};
connect();
app.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
});