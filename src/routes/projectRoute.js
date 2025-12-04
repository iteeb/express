const express = require("express");
const router = express.Router();
const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
} = require("../controllers/projectController");

// créer un projet
router.post("/addProject", createProject);

// get tt les projets
router.get("/getProjects", getProjects);

// get un projet par id
router.get("/:id", getProjectById);

// update projet
router.put("/update/:id", updateProject);

// delete projet
router.delete("/delete/:id", deleteProject);

module.exports = router;
