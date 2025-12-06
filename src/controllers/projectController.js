const Project = require("../models/Project");

//  creation projet
const createProject = async (req, res) => {
  try {
    const { name, description, status } = req.body;

    // nchoufou ken esm lprojet deja mawjoud wla nn
    if (!name) {
      return res.status(400).json({ message: "Le nom est Obligatoire!" });
    }

    // na3mlou création lel projet
    const project = await Project.create({
      name,
      description,
      status, 
      owner: req.user.id, 
    });

    return res.status(201).json({
      success: true,
      project,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Erreur de serveur" });
  }
};

//  get projets
const getProjects = async (req, res) => {
  try {
    // ken el role du user connecté(eli f token) = manager yjib les projets
    if (req.user.role === "manager") {
      const projects = await Project.find().populate("owner", "name login"); // na3mlou populate lel owner besh yarf chkon el user o yaffichi name w login bark
      return res.status(200).json({ success: true, projects });
    }

    // ken user normal → yjib ken mte3ou
    const projects = await Project.find({ owner: req.user.id }).populate(
      "owner",
      "name login"
    );

    return res.status(200).json({ success: true, projects });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Erreur " });
  }
};

//get project by id
const getProjectById = async (req, res) => {
  try {
    const projectId = req.params.id;

    const project = await Project.findById(projectId).populate(
      "owner",
      "name login"
    );

    // ken lprojet msh mawjod
    if (!project) {
      return res.status(404).json({
        message: "Projet introuvable",
      });
    }

    // kn el owner o el manager bark ynajmou yshofo el projet
    if (
      req.user.role !== "manager" &&
      project.owner._id.toString() !== req.user.id
    ) {
      return res.status(403).json({
        message: "Vous n'avez pas l'autorisation d'accéder à ce projet.",
      });
    }

    return res.status(200).json({
      success: true,
      project,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Erreur",
    });
  }
};

//  update projet
const updateProject = async (req, res) => {
  try {
    const projectId = req.params.id;

    // nlawjou aal projet bil id eli jey mel params
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: "Projet n'existe pas" });
    }

    // ken el user msh manager wala el mahosh el owner maynajmch yaamel update
    if (
      req.user.role !== "manager" &&
      project.owner.toString() !== req.user.id
    ) {
      return res.status(403).json({
        message: "Vous n'avez pas l'autorisation d'accéder à ce projet.",
      });
    }

    // update lel projet
    const updated = await Project.findByIdAndUpdate(projectId, req.body, {
      new: true,
    });

    return res.status(200).json({ success: true, project: updated });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Erreur" });
  }
};

// Récupérer tous les projets avec tri et recherche
const getProjectsWithFilters = async (req, res) => {
  try {
    const { 
      name, 
      status, 
      owner, 
      description,
      sort = "createdAt", 
      order = "desc" 
    } = req.query;

    //filtre 
    let filter = {};
    
    // Recherche par nom 
    if (name) {
      filter.name = { $regex: name, $options: "i" };
    }
    
    // Recherche par description 
    if (description) {
      filter.description = { $regex: description, $options: "i" };
    }
    
    // Filtre par statut
    if (status) {
      filter.status = status;
    }
    
    // Filtre par propriétaire
    if (owner) {
      filter.owner = owner;
    }
    
    // les users ynajmou ychoufou ken les projets mteehom kahaw (mch mtaa l users kol)
    if (req.user.role !== "manager") {
      // si owner different bch ykharej erreur
      if (owner && owner !== req.user.id) {
        return res.status(403).json({ 
          success: false, 
          message: "Vous ne pouvez voir que vos propres projets" 
        });
      }
      // Sinon, on filtre par défaut leurs projets
      else if (!owner) {
        filter.owner = req.user.id;
      }
    }

    // Exécuter la requête avec tri
    const sortOrder = order === "asc" ? 1 : -1;
    const projects = await Project.find(filter)
      .populate("owner", "name login")
      .sort({ [sort]: sortOrder });

    return res.status(200).json({ 
      success: true, 
      count: projects.length,
      projects 
    });
  } catch (error) {
    console.error("Erreur dans getProjectsWithFilters:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Erreur serveur" 
    });
  }
};

//  delete project
const deleteProject = async (req, res) => {
  try {
    const projectId = req.params.id;

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: "Projet n'existe pas" });
    }

    // ken el owner wala el manager ynjm yfasakh
    if (
      req.user.role !== "manager" &&
      project.owner.toString() !== req.user.id
    ) {
      return res.status(403).json({
        message: "Vous n'avez pas l'autorisation d'e supprimer ce projet.",
      });
    }

    await Project.findByIdAndDelete(projectId);

    return res
      .status(200)
      .json({ success: true, message: "le projet a été supprimé avec succés" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Erreur" });
  }
};





module.exports = {
  createProject,
  getProjects,
  getProjectsWithFilters ,
  getProjectById,
  updateProject,
  deleteProject,
};
