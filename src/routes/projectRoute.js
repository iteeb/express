const express = require("express");
const router = express.Router();
const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
} = require("../controllers/projectController");
const { auth } = require("../middlewares/authMiddleware");

// créer un projet
router.post("/addProject",auth, createProject);

// get tt les projets
router.get("/getProjects", auth, getProjects);

// get un projet par id
router.get("/:id", auth, getProjectById);

// update projet
router.put("/update/:id", auth, updateProject);

// delete projet
router.delete("/delete/:id", auth, deleteProject);

module.exports = router;
 