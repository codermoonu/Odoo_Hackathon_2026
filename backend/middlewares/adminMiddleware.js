const adminOnly = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Not authorized, admin access required" });
  }
  next();
};

module.exports = adminOnly;
