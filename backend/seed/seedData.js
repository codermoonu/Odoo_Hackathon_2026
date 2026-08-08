/**
 * Seed script — creates an org, users, vehicles, and rides/trips
 * clustered around South Kolkata so "rides near me" has real matches
 * once a browser shares geolocation in that area.
 *
 * Run: node seed/seedData.js
 * Requires MONGO_URI in backend/.env (same Atlas cluster your team shares)
 */
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const Organization = require("../models/Organization");
const User = require("../models/User");
const Vehicle = require("../models/Vehicle");
const Ride = require("../models/Ride");
const Trip = require("../models/Trip");

const SEED_PASSWORD = "Password123!"; // plaintext used for all seeded logins — see printed table at the end

// Real, walkable-distance-apart South Kolkata locations so seeded users
// are "nearby each other" for geolocation-based matching.
const LOCATIONS = {
  jadavpur:   { address: "Jadavpur, Kolkata, West Bengal, 700032, India", lat: 22.4975, lng: 88.3712 },
  ballygunge: { address: "Ballygunge, Kolkata, West Bengal, 700019, India", lat: 22.5245, lng: 88.3654 },
  gariahat:   { address: "Gariahat, Kolkata, West Bengal, 700029, India", lat: 22.5186, lng: 88.3653 },
  parkCircus: { address: "Park Circus, Kolkata, West Bengal, 700017, India", lat: 22.5411, lng: 88.3714 },
  garia:      { address: "Garia, Kolkata, West Bengal, 700084, India", lat: 22.4600, lng: 88.3931 },
  scienceCity:{ address: "Science City, Kolkata, West Bengal, 700046, India", lat: 22.5334, lng: 88.3936 },
  saltLake:   { address: "Salt Lake, Kolkata, West Bengal, 700091, India", lat: 22.5726, lng: 88.4082 },
  rajarhat:   { address: "Rajarhat, Kolkata, West Bengal, 700135, India", lat: 22.6014, lng: 88.4692 },
};

function haversineKm(a, b) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return +(R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s))).toFixed(2);
}

// Straight-line GeoJSON stub, broken into several intermediate points —
// good enough for display, and the extra points give LiveTracking's demo
// animation something to step through instead of one big jump. Swap for a
// real OSRM call later if you want the seeded routes to hug actual roads.
function straightLineGeometry(start, dest, steps = 10) {
  const coordinates = [];
  for (let i = 0; i <= steps; i++) {
    const fraction = i / steps;
    coordinates.push([
      start.lng + (dest.lng - start.lng) * fraction,
      start.lat + (dest.lat - start.lat) * fraction,
    ]);
  }
  return { type: "LineString", coordinates };
}

// Interpolate a point partway along a route — used to fake a driver's
// "current" position for IN_PROGRESS trips.
function pointAlongRoute(start, dest, fraction) {
  return {
    lat: start.lat + (dest.lat - start.lat) * fraction,
    lng: start.lng + (dest.lng - start.lng) * fraction,
  };
}

async function hashed(pw) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(pw, salt);
}

async function main() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI not set — check backend/.env");
  }
  await mongoose.connect(process.env.MONGO_URI);
  console.log("[seed] connected to MongoDB");

  // Wipe only the collections this script owns — safe to re-run
  await Promise.all([
    Trip.deleteMany({ trip_id: { $regex: /^SEED-/ } }),
    Ride.deleteMany({}),
    Vehicle.deleteMany({ registrationNumber: { $regex: /^WB-SEED-/ } }),
    User.deleteMany({ email: { $regex: /@wayflow-seed\.com$/ } }),
    Organization.deleteMany({ name: "Wayflow Demo Org" }),
  ]);
  console.log("[seed] cleared previous seed data");

  // 1. Admin user first (Organization requires an existing admin ref)
  const adminPassword = await hashed(SEED_PASSWORD);
  const admin = await User.create({
    name: "Ananya Sen",
    email: "ananya.admin@wayflow-seed.com",
    password: adminPassword,
    role: "admin",
    employeeId: "EMP-0001",
    isActive: true,
  });

  const org = await Organization.create({
    name: "Wayflow Demo Org",
    admin: admin._id,
  });

  admin.organization = org._id;
  await admin.save();

  // 2. Employee users — clustered around South Kolkata, each near
  //    at least one other user so "nearby" search has real hits.
  const employeeSeeds = [
    { name: "Rohan Das", location: LOCATIONS.jadavpur, isDriver: true },
    { name: "Priya Bose", location: LOCATIONS.ballygunge, isDriver: true },
    { name: "Sourav Ghosh", location: LOCATIONS.gariahat, isDriver: true },
    { name: "Meera Iyer", location: LOCATIONS.jadavpur, isDriver: false },
    { name: "Arjun Mukherjee", location: LOCATIONS.garia, isDriver: true },
    { name: "Ishita Roy", location: LOCATIONS.ballygunge, isDriver: false },
  ];

  const pw = await hashed(SEED_PASSWORD);
  const users = [];
  for (let i = 0; i < employeeSeeds.length; i++) {
    const seed = employeeSeeds[i];
    const user = await User.create({
      name: seed.name,
      email: `${seed.name.toLowerCase().replace(/\s+/g, ".")}@wayflow-seed.com`,
      password: pw,
      role: "employee",
      organization: org._id,
      employeeId: `EMP-${String(i + 2).padStart(4, "0")}`,
      isActive: true,
    });
    users.push({ user, ...seed });
  }
  console.log(`[seed] created ${users.length + 1} users (1 admin + ${users.length} employees)`);

  // 3. Vehicles for driver users
  const vehicleModels = [
    { make: "Maruti Suzuki", model: "Swift", seats: 4 },
    { make: "Hyundai", model: "i20", seats: 4 },
    { make: "Tata", model: "Nexon", seats: 5 },
    { make: "Honda", model: "City", seats: 4 },
  ];

  const vehicles = [];
  const drivers = users.filter((u) => u.isDriver);
  for (let i = 0; i < drivers.length; i++) {
    const v = vehicleModels[i % vehicleModels.length];
    const vehicle = await Vehicle.create({
      owner: drivers[i].user._id,
      organization: org._id,
      make: v.make,
      model: v.model,
      registrationNumber: `WB-SEED-${String(i + 1).padStart(3, "0")}`,
      seatingCapacity: v.seats,
      isActive: true,
    });
    vehicles.push({ vehicle, driver: drivers[i] });
  }
  console.log(`[seed] created ${vehicles.length} vehicles`);

  // 4. Rides + Trips — same route data written to both collections.
  //    An explicit list (not a generic loop) so each trip's purpose in
  //    testing is obvious: which ones are "live" for Live Tracking, which
  //    are payable in Find a Ride, and which cover the other My Trips states.
  const now = new Date();

  // Trip status -> Ride status (Ride's enum spells these differently).
  const RIDE_STATUS = {
    PUBLISHED: "Published",
    STARTED: "InProgress",
    IN_PROGRESS: "InProgress",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
  };

  const tripPlan = [
    // Two live trips, happening right now — join their rooms from
    // LiveTracking.jsx and they already have a current_location partway
    // along the route, so the map isn't empty even before any real/demo
    // socket update arrives.
    { start: "jadavpur", dest: "scienceCity", driverIndex: 0, status: "IN_PROGRESS", dayOffset: 0, progress: 0.4 },
    { start: "ballygunge", dest: "saltLake", driverIndex: 1, status: "IN_PROGRESS", dayOffset: 0, progress: 0.65 },

    // Bookable now — the bread-and-butter Find a Ride / Available Rides /
    // Payment test cases.
    { start: "gariahat", dest: "rajarhat", driverIndex: 2, status: "PUBLISHED", dayOffset: 0 },
    { start: "garia", dest: "parkCircus", driverIndex: 3, status: "PUBLISHED", dayOffset: 0 },
    { start: "jadavpur", dest: "ballygunge", driverIndex: 0, status: "PUBLISHED", dayOffset: 1 },
    { start: "saltLake", dest: "scienceCity", driverIndex: 1, status: "PUBLISHED", dayOffset: 1 },

    // Full — exercises the disabled "Full" button state on Available Rides.
    { start: "scienceCity", dest: "saltLake", driverIndex: 2, status: "PUBLISHED", dayOffset: 2, seatsOverride: 0 },

    // Already finished — shows up in My Trips history for its driver.
    { start: "parkCircus", dest: "gariahat", driverIndex: 3, status: "COMPLETED", dayOffset: -1, progress: 1 },

    // Cancelled — the other My Trips status worth being able to see.
    { start: "rajarhat", dest: "garia", driverIndex: 0, status: "CANCELLED", dayOffset: 1 },
  ];

  const tripDocs = [];
  const rideDocs = [];

  for (let i = 0; i < tripPlan.length; i++) {
    const plan = tripPlan[i];
    const { vehicle, driver } = vehicles[plan.driverIndex];
    const start = LOCATIONS[plan.start];
    const dest = LOCATIONS[plan.dest];
    const distanceKm = haversineKm(start, dest);
    const durationMins = Math.round((distanceKm / 30) * 60); // assume ~30km/h city avg
    const farePerSeat = Math.round(20 + distanceKm * 8.5); // matches config/maps.js FARE_CONFIG

    const travelDate = new Date(now);
    travelDate.setDate(now.getDate() + plan.dayOffset);

    const currentLocation =
      plan.progress === undefined
        ? { lat: start.lat, lng: start.lng }
        : pointAlongRoute(start, dest, plan.progress);

    const availableSeats = plan.seatsOverride ?? vehicle.seatingCapacity - 1;

    // Trip (what FindRide/AvailableRides/Payment/LiveTracking actually read)
    const trip = await Trip.create({
      trip_id: `SEED-TRIP-${String(i + 1).padStart(3, "0")}`,
      driver: driver.user._id,
      driver_name: driver.user.name,
      vehicle: `${vehicle.make} ${vehicle.model}`,
      start_address: start.address,
      start_coords: { lat: start.lat, lng: start.lng },
      dest_address: dest.address,
      dest_coords: { lat: dest.lat, lng: dest.lng },
      route_geometry: straightLineGeometry(start, dest),
      distance_km: distanceKm,
      duration_mins: durationMins,
      fare_per_seat: farePerSeat,
      available_seats: availableSeats,
      status: plan.status,
      current_location: currentLocation,
    });
    // Mongoose only auto-sets createdAt if not supplied — override it after
    // creation so it matches travelDate exactly (create() with an explicit
    // createdAt in the doc body is unreliable across mongoose versions).
    await Trip.updateOne(
      { _id: trip._id },
      { $set: { createdAt: travelDate } },
      { timestamps: false }
    );
    trip.createdAt = travelDate;
    tripDocs.push(trip);

    // Ride (what the legacy rideController.js / bookRide flow reads) — same travelDate
    const ride = await Ride.create({
      driver: driver.user._id,
      organization: org._id,
      vehicle: vehicle._id,
      pickupLocation: start.address,
      pickupLat: start.lat,
      pickupLng: start.lng,
      destination: dest.address,
      destinationLat: dest.lat,
      destinationLng: dest.lng,
      travelDate,
      travelTime: "08:30 AM",
      availableSeats,
      farePerSeat,
      status: availableSeats === 0 ? "FullyBooked" : RIDE_STATUS[plan.status],
    });
    rideDocs.push(ride);
  }

  console.log(
    `[seed] created ${tripDocs.length} trips (${tripDocs.filter((t) => t.status === "IN_PROGRESS").length} IN_PROGRESS, ${tripDocs.filter((t) => t.status === "PUBLISHED").length} PUBLISHED, ${tripDocs.filter((t) => t.status === "COMPLETED").length} COMPLETED, ${tripDocs.filter((t) => t.status === "CANCELLED").length} CANCELLED) and ${rideDocs.length} rides`
  );

  console.log("\n=== Seeded login credentials (all use the same password) ===");
  console.log(`Password: ${SEED_PASSWORD}\n`);
  console.log(`${admin.email}  (admin)`);
  users.forEach((u) => console.log(`${u.user.email}  (${u.isDriver ? "driver" : "rider"})`));
  console.log("================================================================\n");

  await mongoose.disconnect();
  console.log("[seed] done, disconnected");
}

main().catch((err) => {
  console.error("[seed] failed:", err);
  process.exit(1);
});