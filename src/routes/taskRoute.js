const express = require("express");
const router = express.Router();
const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
} = require("../controllers/taskController");

// Créer une tâche
router.post("/addTask", createTask);

// Récupérer toutes les tâches
router.get("/getTasks", getTasks);

// Récupérer une tâche par id
router.get("/:id", getTaskById);

// Mettre à jour une tâche
router.put("/update/:id", updateTask);

// Supprimer une tâche
router.delete("/delete/:id", deleteTask);

module.exports = router;
