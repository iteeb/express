const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ msg: "Token manquant" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // id et role
    next();
  } catch (err) {
    res.status(401).json({ msg: "Token invalide" });
  }
};

// Vérifie si l'utilisateur est manager
const onlyManager = (req, res, next) => {
  if (!req.user || req.user.role !== "manager")
    return res.status(403).json({ msg: "Accès réservé au manager" });
  next();
};

module.exports = { auth, onlyManager };
