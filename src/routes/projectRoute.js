const express = require("express");
const router = express.Router();
const {
  createProject,
  getProjects,
  getProjectsWithFilters,
  getProjectById,
  updateProject,
  deleteProject,
} = require("../controllers/projectController");


// = POUR TESTER getProjectsWithFilters
const fakeManager = (req, res, next) => {
  req.user = {
    id: "507f1f77bcf86cd799439011",  // ID fake 
    role: "manager"                  //un manager
  };
  next();
};
// créer un projet
router.post("/addProject", createProject);

// get tt les projets
router.get("/getProjects", getProjects);

// Get projets avec filtres
router.get("/getProjects/filters" ,fakeManager, getProjectsWithFilters);
// get un projet par id
router.get("/:id", getProjectById);

// update projet
router.put("/update/:id", updateProject);

// delete projet
router.delete("/delete/:id", deleteProject);

module.exports = router;
