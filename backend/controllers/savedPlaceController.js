const SavedPlace = require("../models/SavedPlace");

const getSavedPlaces = async (req, res) => {
  try {
    const places = await SavedPlace.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(places);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createSavedPlace = async (req, res) => {
  try {
    const { name, address, lat, lng, kind } = req.body;
    if (!name || !address || lat == null || lng == null) {
      return res.status(400).json({ message: "name, address, lat and lng are required" });
    }
    const place = await SavedPlace.create({ user: req.user._id, name, address, lat, lng, kind });
    res.status(201).json(place);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateSavedPlace = async (req, res) => {
  try {
    const place = await SavedPlace.findOne({ _id: req.params.id, user: req.user._id });
    if (!place) {
      return res.status(404).json({ message: "Saved place not found" });
    }

    const { name, address, lat, lng, kind } = req.body;
    if (name !== undefined) place.name = name;
    if (address !== undefined) place.address = address;
    if (lat !== undefined) place.lat = lat;
    if (lng !== undefined) place.lng = lng;
    if (kind !== undefined) place.kind = kind;

    const updated = await place.save();
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteSavedPlace = async (req, res) => {
  try {
    const place = await SavedPlace.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!place) {
      return res.status(404).json({ message: "Saved place not found" });
    }
    res.status(200).json({ message: "Saved place removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getSavedPlaces, createSavedPlace, updateSavedPlace, deleteSavedPlace };
