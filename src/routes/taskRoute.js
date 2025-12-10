const express = require("express");
const router = express.Router();
const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getTasksWithFilter,
} = require("../controllers/taskController");
const { auth } = require("../middlewares/authMiddleware");

// Récupérer toutes les tâches avec filtres (FIXE - en premier)
router.get("/getTasksFiltered", getTasksWithFilter);
// Créer une tâche
router.post("/addTask", auth, createTask);

// Récupérer toutes les tâches
router.get("/getTasks", auth, getTasks);

// Récupérer une tâche par id
router.get("/:id", auth, getTaskById);

// Mettre à jour une tâche
router.put("/update/:id", auth, updateTask);

// Supprimer une tâche
router.delete("/delete/:id", auth, deleteTask);

module.exports = router;
