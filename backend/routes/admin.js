const express = require("express");
const protect = require("../middlewares/userMiddleware");
const adminOnly = require("../middlewares/adminMiddleware");
const {
  createOrganization,
  getOrganization,
  updateOrganization,
  addEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  setEmployeeAccess,
  getEmployeeEngagement,
  getVehicles,
  getVehicleById,
  setVehicleStatus,
} = require("../controllers/adminController");

const router = express.Router();

router.use(protect);

// Any authenticated user without an organization can bootstrap one, becoming its admin.
router.post("/organization", createOrganization);

router.use(adminOnly);

// Organization Configuration
router.get("/organization", getOrganization);
router.put("/organization", updateOrganization);

// Employee Records
router.post("/employees", addEmployee);
router.get("/employees", getEmployees);
router.get("/employees/engagement", getEmployeeEngagement);
router.get("/employees/:id", getEmployeeById);
router.put("/employees/:id", updateEmployee);
router.patch("/employees/:id/access", setEmployeeAccess);

// Vehicle & Driver Oversight
router.get("/vehicles", getVehicles);
router.get("/vehicles/:id", getVehicleById);
router.patch("/vehicles/:id/status", setVehicleStatus);

module.exports = router;
