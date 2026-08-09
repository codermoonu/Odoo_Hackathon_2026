const mongoose = require("mongoose");

const savedPlaceSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    kind: { type: String, enum: ["home", "work", "other"], default: "other" },
  },
  { timestamps: true }
);

savedPlaceSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.models.SavedPlace || mongoose.model("SavedPlace", savedPlaceSchema);
