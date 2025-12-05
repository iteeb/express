const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware"); // 👈 LIGNE À VÉRIFIER/AJOUTER

// Middleware pour vérifier que c'est un manager
const isManager = (req, res, next) => {
    // ... (code existant pour isManager)
    if (req.user.role !== "manager") return res.status(403).json({ error: "Accès refusé" });
    next();
};

// --- ROUTE PUBLIQUE POUR L'INSCRIPTION (Ajoutée précédemment) ---
// L'URL d'accès sera : POST /users/register
router.post("/register", userController.createUser);


// Créer un utilisateur (manager seulement)
// Cette route utilise désormais le middleware qui est bien importé.
router.post("/create", authMiddleware, isManager, userController.createUser); // 👈 Ligne 22

// Activer/Désactiver un utilisateur (manager seulement)
router.patch("/status/:id", authMiddleware, isManager, userController.updateStatus);

module.exports = router;