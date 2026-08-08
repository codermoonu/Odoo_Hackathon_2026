  const bcrypt = require("bcryptjs");
  const Organization = require("../models/Organization");
  const User = require("../models/User");
  const Vehicle = require("../models/Vehicle");

  // ---------------------------------------------------------------------------
  // Organization Configuration
  // ---------------------------------------------------------------------------

  // Bootstraps a new organization and promotes the calling user to its admin.
  const createOrganization = async (req, res) => {
    try {
      if (req.user.organization) {
        return res.status(400).json({ message: "You already belong to an organization" });
      }

      const { name, fareConfig, fuelCostPerLitre, avgFuelEfficiencyKmpl } = req.body;
      if (!name) {
        return res.status(400).json({ message: "Organization name is required" });
      }

      const organization = await Organization.create({
        name,
        admin: req.user._id,
        fareConfig,
        fuelCostPerLitre,
        avgFuelEfficiencyKmpl,
      });

      req.user.role = "admin";
      req.user.organization = organization._id;
      req.user.isActive = true;
      await req.user.save();

      res.status(201).json(organization);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  const getOrganization = async (req, res) => {
    try {
      const organization = await Organization.findById(req.user.organization);
      if (!organization) {
        return res.status(404).json({ message: "Organization not found" });
      }
      res.status(200).json(organization);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  // Maintains fuel cost, travel cost and other operational settings that feed
  // fare calculations and cost/savings reports.
  const updateOrganization = async (req, res) => {
    try {
      const organization = await Organization.findById(req.user.organization);
      if (!organization) {
        return res.status(404).json({ message: "Organization not found" });
      }

      const { name, fareConfig, fuelCostPerLitre, avgFuelEfficiencyKmpl, isActive } = req.body;
      if (name !== undefined) organization.name = name;
      if (fuelCostPerLitre !== undefined) organization.fuelCostPerLitre = fuelCostPerLitre;
      if (avgFuelEfficiencyKmpl !== undefined) organization.avgFuelEfficiencyKmpl = avgFuelEfficiencyKmpl;
      if (isActive !== undefined) organization.isActive = isActive;
      if (fareConfig !== undefined) {
        if (fareConfig.baseFare !== undefined) organization.fareConfig.baseFare = fareConfig.baseFare;
        if (fareConfig.costPerKm !== undefined) organization.fareConfig.costPerKm = fareConfig.costPerKm;
        if (fareConfig.fuelRateFactor !== undefined) organization.fareConfig.fuelRateFactor = fareConfig.fuelRateFactor;
      }

      const updated = await organization.save();
      res.status(200).json(updated);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  // ---------------------------------------------------------------------------
  // Employee Records
  // ---------------------------------------------------------------------------

  const addEmployee = async (req, res) => {
    try {
      const { name, email, password, employeeId, gender, phone, vehicle } = req.body;
      if (!name || !email || !password) {
        return res.status(400).json({ message: "Name, email and password are required" });
      }

      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(409).json({ message: "User already exists with this email" });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const employee = await User.create({
        name,
        email,
        password: hashedPassword,
        employeeId,
        gender,
        phone,
        role: "employee",
        organization: req.user.organization,
        isActive: true,
      });

      // Vehicle registration alongside the employee is optional — an admin
      // may just be onboarding a rider who won't drive.
      let createdVehicle = null;
      let vehicleError = null;
      if (vehicle && vehicle.model && vehicle.registrationNumber && vehicle.seatingCapacity) {
        try {
          createdVehicle = await Vehicle.create({
            owner: employee._id,
            organization: req.user.organization,
            make: vehicle.make,
            model: vehicle.model,
            registrationNumber: vehicle.registrationNumber,
            seatingCapacity: vehicle.seatingCapacity,
          });
        } catch (vErr) {
          vehicleError =
            vErr.code === 11000
              ? "A vehicle with this registration number already exists"
              : vErr.message;
        }
      }

      res.status(201).json({
        id: employee._id,
        name: employee.name,
        email: employee.email,
        employeeId: employee.employeeId,
        gender: employee.gender,
        phone: employee.phone,
        isActive: employee.isActive,
        createdAt: employee.createdAt,
        vehicle: createdVehicle,
        vehicleError,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  const getEmployees = async (req, res) => {
    try {
      const employees = await User.find({ organization: req.user.organization, role: "employee" })
        .select("-password")
        .sort({ createdAt: -1 });
      res.status(200).json(employees);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  const getEmployeeById = async (req, res) => {
    try {
      const employee = await User.findById(req.params.id).select("-password");
      if (!employee || employee.organization?.toString() !== req.user.organization.toString()) {
        return res.status(404).json({ message: "Employee not found" });
      }
      res.status(200).json(employee);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  const updateEmployee = async (req, res) => {
    try {
      const employee = await User.findById(req.params.id);
      if (!employee || employee.organization?.toString() !== req.user.organization.toString()) {
        return res.status(404).json({ message: "Employee not found" });
      }

      const { name, employeeId, gender, phone } = req.body;
      if (name !== undefined) employee.name = name;
      if (employeeId !== undefined) employee.employeeId = employeeId;
      if (gender !== undefined) employee.gender = gender;
      if (phone !== undefined) employee.phone = phone;

      const updated = await employee.save();
      res.status(200).json({
        id: updated._id,
        name: updated.name,
        email: updated.email,
        employeeId: updated.employeeId,
        gender: updated.gender,
        phone: updated.phone,
        isActive: updated.isActive,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  // Provisions/revokes an employee's access to the platform (does not delete the record).
  const setEmployeeAccess = async (req, res) => {
    try {
      const { isActive } = req.body;
      if (typeof isActive !== "boolean") {
        return res.status(400).json({ message: "isActive (boolean) is required" });
      }

      const employee = await User.findById(req.params.id);
      if (!employee || employee.organization?.toString() !== req.user.organization.toString()) {
        return res.status(404).json({ message: "Employee not found" });
      }
      if (employee._id.toString() === req.user._id.toString()) {
        return res.status(400).json({ message: "You cannot change your own access" });
      }

      employee.isActive = isActive;
      await employee.save();

      res.status(200).json({
        id: employee._id,
        isActive: employee.isActive,
        message: isActive ? "Employee access granted" : "Employee access revoked",
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  // Org-wide usage/engagement summary: login activity and account status.
  const getEmployeeEngagement = async (req, res) => {
    try {
      const employees = await User.find({ organization: req.user.organization, role: "employee" })
        .select("name email employeeId isActive lastLoginAt createdAt")
        .lean();

      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const vehicleCounts = await Vehicle.aggregate([
        { $match: { organization: req.user.organization } },
        { $group: { _id: "$owner", count: { $sum: 1 } } },
      ]);
      const vehicleCountByOwner = new Map(vehicleCounts.map((v) => [v._id.toString(), v.count]));

      const employeeEngagement = employees.map((employee) => ({
        id: employee._id,
        name: employee.name,
        email: employee.email,
        employeeId: employee.employeeId,
        isActive: employee.isActive,
        memberSince: employee.createdAt,
        lastLoginAt: employee.lastLoginAt || null,
        activeInLast7Days: !!(employee.lastLoginAt && employee.lastLoginAt >= sevenDaysAgo),
        vehiclesRegistered: vehicleCountByOwner.get(employee._id.toString()) || 0,
      }));

      res.status(200).json({
        totalEmployees: employeeEngagement.length,
        activeAccess: employeeEngagement.filter((e) => e.isActive).length,
        revokedAccess: employeeEngagement.filter((e) => !e.isActive).length,
        activeInLast7Days: employeeEngagement.filter((e) => e.activeInLast7Days).length,
        neverLoggedIn: employeeEngagement.filter((e) => !e.lastLoginAt).length,
        employees: employeeEngagement,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  // ---------------------------------------------------------------------------
  // Vehicle & Driver Oversight
  // ---------------------------------------------------------------------------

  const getVehicles = async (req, res) => {
    try {
      const vehicles = await Vehicle.find({ organization: req.user.organization })
        .populate("owner", "name email employeeId phone")
        .sort({ createdAt: -1 });
      res.status(200).json(vehicles);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  const getVehicleById = async (req, res) => {
    try {
      const vehicle = await Vehicle.findById(req.params.id).populate("owner", "name email employeeId phone");
      if (!vehicle || vehicle.organization?.toString() !== req.user.organization.toString()) {
        return res.status(404).json({ message: "Vehicle not found" });
      }
      res.status(200).json(vehicle);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  // Oversight only: suspend/reinstate a vehicle's registration. Vehicle details
  // remain owned and edited by the employee, not the admin.
  const setVehicleStatus = async (req, res) => {
    try {
      const { isActive } = req.body;
      if (typeof isActive !== "boolean") {
        return res.status(400).json({ message: "isActive (boolean) is required" });
      }

      const vehicle = await Vehicle.findById(req.params.id);
      if (!vehicle || vehicle.organization?.toString() !== req.user.organization.toString()) {
        return res.status(404).json({ message: "Vehicle not found" });
      }

      vehicle.isActive = isActive;
      await vehicle.save();

      res.status(200).json({
        id: vehicle._id,
        isActive: vehicle.isActive,
        message: isActive ? "Vehicle reinstated" : "Vehicle suspended",
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  module.exports = {
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
  };
