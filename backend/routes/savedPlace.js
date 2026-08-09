const express = require("express");
const router = express.Router();
const protect = require("../middlewares/userMiddleware");
const {
  getSavedPlaces,
  createSavedPlace,
  updateSavedPlace,
  deleteSavedPlace,
} = require("../controllers/savedPlaceController");

router.use(protect);
router.get("/", getSavedPlaces);
router.post("/", createSavedPlace);
router.put("/:id", updateSavedPlace);
router.delete("/:id", deleteSavedPlace);

module.exports = router;
