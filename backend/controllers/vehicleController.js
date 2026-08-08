const mongoose = require("mongoose");
const Vehicle = require("../models/Vehicle");

const addVehicle = async (req, res) => {
  try {
    const { organization, make, model, registrationNumber, seatingCapacity } = req.body;

    if (!organization || !model || !registrationNumber || !seatingCapacity) {
      return res.status(400).json({
        message: "organization, model, registrationNumber and seatingCapacity are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(organization)) {
      return res.status(400).json({ message: "Invalid organization id" });
    }

    const vehicle = await Vehicle.create({
      owner: req.user._id,
      organization,
      make,
      model,
      registrationNumber,
      seatingCapacity,
    });

    res.status(201).json(vehicle);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "A vehicle with this registration number already exists" });
    }
    res.status(500).json({ message: error.message });
  }
};

const getVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ owner: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(vehicles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }
    if (vehicle.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to access this vehicle" });
    }
    res.status(200).json(vehicle);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }
    if (vehicle.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this vehicle" });
    }

    const { make, model, registrationNumber, seatingCapacity, isActive } = req.body;
    if (make !== undefined) vehicle.make = make;
    if (model !== undefined) vehicle.model = model;
    if (registrationNumber !== undefined) vehicle.registrationNumber = registrationNumber;
    if (seatingCapacity !== undefined) vehicle.seatingCapacity = seatingCapacity;
    if (isActive !== undefined) vehicle.isActive = isActive;

    const updated = await vehicle.save();
    res.status(200).json(updated);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "A vehicle with this registration number already exists" });
    }
    res.status(500).json({ message: error.message });
  }
};

const deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }
    if (vehicle.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this vehicle" });
    }

    await vehicle.deleteOne();
    res.status(200).json({ message: "Vehicle deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { addVehicle, getVehicles, getVehicleById, updateVehicle, deleteVehicle };
