const router = require("express").Router();
const {
  login,
  createFirstManager,
  createUser,
  activateUser,
} = require("../controllers/authController");
const { auth } = require("../middlewares/authMiddleware");

// Login
router.post("/login", login);

// Création du premier manager
router.post("/create-first-manager", createFirstManager);

// Création de tous les autres comptes
router.post("/create-user", auth, createUser);

// Activer / désactiver un user
router.patch("/activateUser/:id", auth, activateUser);

module.exports = router;
