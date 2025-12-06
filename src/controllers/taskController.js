const Task = require("../models/task");
const Project = require("../models/Project");

// Créer une tâche
const createTask = async (req, res) => {
  try {
    const { title, description, status, deadline, project, assignedTo } = req.body;

    if (!title || !project) {
      return res.status(400).json({ message: "Le titre et le projet sont obligatoires." });
    }

    // nchoufou projet existe ou non
    const projectExists = await Project.findById(project);
    if (!projectExists) {
      return res.status(404).json({ message: "Projet introuvable." });
    }

    // nchoufou est ce que manager hwa l aamal affectation 
    let assignedUser = null;
    if (assignedTo) {
      if (req.user.role !== "manager") {
        return res.status(403).json({ message: "Seul le manager peut assigner une tâche." });
      }
      assignedUser = assignedTo;
    }

    const task = await Task.create({
      title,
      description,
      status,
      deadline,
      project,
      assignedTo: assignedUser,
    });

    return res.status(201).json({ success: true, task });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

// Récupérer toutes les tâches
const getTasks = async (req, res) => {
  try {
    let tasks;

    if (req.user.role === "manager") {
      tasks = await Task.find().populate("project", "name").populate("assignedTo", "name login");
    } else {
      // Les users ma ycoufou ken les taches mteehom baaed ma aamal manager assignedTo
      tasks = await Task.find({
        $or: [{ assignedTo: req.user.id }, { assignedTo: null }],
      }).populate("project", "name").populate("assignedTo", "name login");
    }

    return res.status(200).json({ success: true, tasks });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

// Récupérer une tâche par id
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("project", "name")
      .populate("assignedTo", "name login");

    if (!task) return res.status(404).json({ message: "Tâche introuvable" });

    // Vérifier l'autorisation
    if (req.user.role !== "manager" && task.assignedTo?.toString() !== req.user.id) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    return res.status(200).json({ success: true, task });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

// Mettre à jour une tâche
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Tâche introuvable" });

    // Vérifier autorisation pour assignation
    if (req.body.assignedTo && req.user.role !== "manager") {
      return res.status(403).json({ message: "Seul le manager peut assigner une tâche." });
    }

    // Les users ne peuvent pas modifier les tâches des autres
    if (req.user.role !== "manager" && task.assignedTo?.toString() !== req.user.id) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    return res.status(200).json({ success: true, task: updatedTask });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

// Supprimer une tâche
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Tâche introuvable" });

    //  le manager ou le propriétaire ynajmou yaamlou supprimer kahaw !
    if (req.user.role !== "manager" && task.assignedTo?.toString() !== req.user.id) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    await Task.findByIdAndDelete(req.params.id);
    return res.status(200).json({ success: true, message: "Tâche supprimée" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};


// Récupérer toutes les tâches avec tri et recherche (version alternative)
const getTasksWithFilter = async (req, res) => {
  try {
    const { 
      title, 
      status, 
      project, 
      assignedTo, 
      sort = "createdAt", 
      order = "desc" 
    } = req.query;

    // Construire le filtre de base
    let filter = {};
    
    // Recherche par titre (insensible à la casse)
    if (title) {
      filter.title = { $regex: title, $options: "i" };
    }
    
    // Filtre par statut
    if (status) {
      filter.status = status;
    }
    
    // Filtre par projet
    if (project) {
      filter.project = project;
    }
    
    // Filtre par utilisateur assigné
    if (assignedTo) {
      filter.assignedTo = assignedTo;
    }
    
    // Pour les non-managers, ils ne peuvent voir que leurs tâches
    if (req.user.role !== "manager") {
      // S'ils spécifient un assignedTo différent d'eux-mêmes, erreur
      if (assignedTo && assignedTo !== req.user.id) {
        return res.status(403).json({ 
          success: false, 
          message: "Accès non autorisé" 
        });
      }
      // Sinon, on filtre par défaut leurs tâches
      else if (!assignedTo) {
        filter.assignedTo = req.user.id;
      }
    }

    // Exécuter la requête avec tri
    const sortOrder = order === "asc" ? 1 : -1;
    const tasks = await Task.find(filter)
      .populate("project", "name")
      .populate("assignedTo", "name login")
      .sort({ [sort]: sortOrder });

    return res.status(200).json({ 
      success: true, 
      count: tasks.length,
      tasks 
    });
  } catch (error) {
    console.error("Erreur dans getTasksWithFilter:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Erreur serveur" 
    });
  }
};

module.exports = { createTask, getTasks, getTaskById, updateTask, deleteTask, getTasksWithFilter };
