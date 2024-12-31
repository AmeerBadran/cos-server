const { verify } = require("jsonwebtoken");
const verifyAdminToken = (req, res, next) => {
  const token = req.headers["authorization"];

  if (!token) {
    return res.status(403).json({ message: "No token provided." });
  }

  const accessToken = token.split(" ")[1];

  verify(accessToken, process.env.JWT_ACCESS_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Failed to authenticate token." });
    }

    req.userId = decoded.id;

    if (decoded.role === "admin" || decoded.role === "doctor") {
      next();
    } else {
      return res
        .status(403)
        .json({ message: "You do not have the necessary permissions." });
    }
  });
};

module.exports = verifyAdminToken;
