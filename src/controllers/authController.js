// src/controllers/authController.js
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// login
const login = async (req, res) => {
  try {
    const { login, password } = req.body;
    // nlawjo aal user bil login
    const user = await User.findOne({ login });
    if (!user)
      // ken wahda menhom ghalta nraj3ou message d'erreur
      return res.status(400).json({ msg: "Login ou mot de passe incorrect" });
      
    // ken el compte mouch actif
    if (!user.active) return res.status(403).json({ msg: "Compte désactivé" });

    // besh ncreptiw el mdp l moujoud fil db w ncompariwouh m3a eli jey mel front
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch)
      return res.status(400).json({ msg: "Login ou mot de passe incorrect" });

    // ken kol shy shih ncreptiw token JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    res.json({ token, role: user.role });
  } catch (err) {
    res.status(500).json({ msg: "Erreur serveur", err });
  }
};

// creation compte ll manager
const createFirstManager = async (req, res) => {
  try {
    const { name, login, password } = req.body;

    // verifie ken deja manager mawjoud wala nn
    const existing = await User.findOne({ role: "manager" });

    if (existing) return res.status(400).json({ msg: "Manager existe déjà" });

    // kn nn ncreptiw el mdp w namlo el compte
    const hashed = await bcrypt.hash(password, 10);

    const manager = new User({
      name,
      login,
      password: hashed,
      role: "manager",
      active: true,
    });

    await manager.save();
    res.status(201).json({ msg: "Premier manager créé", user: manager });
  } catch (err) {
    res.status(500).json({ msg: "Erreur serveur", err });
  }
};

// creation ll les comptes taa el user par el manager
const createUser = async (req, res) => {
  try {
    // nrecupériw les données men body
    const { name, login, password, role } = req.body;

    // nverifyiwnou ken el user eli bsh yaml compte houwa manager wala nn ml token teo
    if (!req.user || req.user.role !== "manager") {
      return res
        .status(403)
        .json({ msg: "Seul le manager peut créer des comptes" });
    }

    // nverifyiw ken login deja mawjoud wla nn
    const existing = await User.findOne({ login });
    if (existing) return res.status(400).json({ msg: "Login existe déjà" });

    const hashed = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      login,
      password: hashed,
      role: role || "user",
      active: false,
    });

    await user.save();
    res.status(201).json({ msg: "User créé avec succès", user });
  } catch (err) {
    res.status(500).json({ msg: "Erreur serveur", err });
  }
};

// activation / désactivation compte user par el manager
const activateUser = async (req, res) => {
  try {
    const { id } = req.params;

    // nverifyiw ken el user eli bsh yactivi wla ydesactivi houwa manager wla nn via token teo
    if (!req.user || req.user.role !== "manager") {
      return res
        .status(403)
        .json({ msg: "Seul le manager peut activer/désactiver un compte" });
    }

    // nlawjou aal user bil id
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ msg: "Utilisateur introuvable" });
    // nbadlou el status taa active
    user.active = !user.active;
    await user.save();

    res.json({
      msg: `L'utilisateur est maintenant ${
        user.active ? "actif" : "désactivé"
      }`,
      user,
    });
  } catch (err) {
    res.status(500).json({ msg: "Erreur serveur", err });
  }
};

module.exports = { login, createFirstManager, createUser, activateUser };
