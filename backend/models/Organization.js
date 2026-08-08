const mongoose = require("mongoose");

const organizationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    admin: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // Operational cost configuration that feeds fare calculations and cost/savings reports.
    fareConfig: {
      baseFare: { type: Number, default: 20.0, min: 0 },
      costPerKm: { type: Number, default: 8.5, min: 0 },
      fuelRateFactor: { type: Number, default: 1.25, min: 0 },
    },
    fuelCostPerLitre: { type: Number, default: 100, min: 0 },
    avgFuelEfficiencyKmpl: { type: Number, default: 15, min: 0 },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Organization = mongoose.models.Organization || mongoose.model("Organization", organizationSchema);

module.exports = Organization;
