/**
 * Seed script — creates an org, ~330 users (with vehicles for the drivers
 * among them), and 500 trips/rides clustered around South Kolkata so
 * "rides near me" has real matches once a browser shares geolocation in
 * that area.
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
const Booking = require("../models/Booking");

const SEED_PASSWORD = "Password123!"; // plaintext used for all seeded logins — see printed table at the end

const TOTAL_EMPLOYEES = 330; // + 1 admin
const TOTAL_TRIPS = 500;

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
const LOCATION_KEYS = Object.keys(LOCATIONS);

// Same 5 model keys ReportsDashboard.jsx's VEHICLE_EFFICIENCY_KMPL lookup
// recognizes (by substring match on the free-text "vehicle" label) — keeping
// to this set means the seeded fleet actually varies the fuel-efficiency chart.
const VEHICLE_MODELS = [
  { make: "Maruti Suzuki", model: "Swift", seats: 4 },
  { make: "Hyundai", model: "i20", seats: 4 },
  { make: "Tata", model: "Nexon", seats: 5 },
  { make: "Honda", model: "City", seats: 4 },
  { make: "Toyota", model: "Innova", seats: 6 },
];

const FIRST_NAMES = [
  "Rohan", "Priya", "Sourav", "Meera", "Arjun", "Ishita", "Ananya", "Kunal", "Neha", "Vikram",
  "Sneha", "Aditya", "Pooja", "Rahul", "Divya", "Karan", "Simran", "Aman", "Riya", "Manish",
  "Anjali", "Siddharth", "Tanvi", "Rajesh", "Kavita", "Nikhil", "Shreya", "Varun", "Pallavi", "Abhishek",
  "Swati", "Gaurav", "Nidhi", "Ravi", "Sunita", "Deepak", "Anita", "Vikas", "Preeti", "Sanjay",
  "Ritu", "Ajay", "Komal", "Vivek", "Payal", "Suresh", "Meenal", "Harsh", "Ankita", "Rakesh",
];
const LAST_NAMES = [
  "Das", "Bose", "Ghosh", "Iyer", "Mukherjee", "Roy", "Sen", "Chatterjee", "Banerjee", "Chakraborty",
  "Dutta", "Sarkar", "Mitra", "Nair", "Reddy", "Gupta", "Sharma", "Verma", "Kapoor", "Malhotra",
  "Chopra", "Bhattacharya", "Pal", "Dey", "Saha", "Bhowmik", "Ganguly", "Sinha", "Kundu", "Basu",
  "Mishra", "Rao", "Menon", "Pillai", "Iyengar", "Trivedi", "Joshi", "Agarwal", "Bhatia", "Khanna",
];

const TRAVEL_TIMES = ["06:45 AM", "07:15 AM", "07:30 AM", "08:00 AM", "08:30 AM", "09:15 AM", "06:00 PM", "06:45 PM", "07:15 PM", "08:00 PM"];

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function randFloat(min, max) {
  return Math.random() * (max - min) + min;
}
function pick(arr) {
  return arr[randInt(0, arr.length - 1)];
}
function pickTwoDistinctKeys(arr) {
  const a = pick(arr);
  let b = pick(arr);
  while (b === a) b = pick(arr);
  return [a, b];
}
function shuffle(arr) {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = randInt(0, i);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function generateUniqueName(usedNames) {
  for (let attempt = 0; attempt < 50; attempt++) {
    const name = `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
    if (!usedNames.has(name)) {
      usedNames.add(name);
      return name;
    }
  }
  let suffix = 2;
  let name;
  do {
    name = `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)} ${suffix++}`;
  } while (usedNames.has(name));
  usedNames.add(name);
  return name;
}

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
// good enough for display, and the extra points give the live-tracking demo
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

// 500 trips split across every status the app needs to demo: a handful
// "live" right now, most of them open/bookable, some already full, some
// cancelled, and a large completed slice spread over the last 6 months so
// the admin Reports page's month-by-month charts have real variety.
function buildTripPlan() {
  const plan = [];
  for (let i = 0; i < 15; i++) plan.push({ status: "IN_PROGRESS", dayOffset: 0, progress: randFloat(0.15, 0.85) });
  for (let i = 0; i < 220; i++) plan.push({ status: "PUBLISHED", dayOffset: randInt(0, 6) });
  for (let i = 0; i < 30; i++) plan.push({ status: "PUBLISHED", dayOffset: randInt(0, 6), seatsOverride: 0 });
  for (let i = 0; i < 35; i++) plan.push({ status: "CANCELLED", dayOffset: randInt(0, 6) });
  for (let i = 0; i < 200; i++) plan.push({ status: "COMPLETED", dayOffset: -randInt(1, 180), progress: 1 });
  return shuffle(plan);
}

async function main() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI not set — check backend/.env");
  }
  const now = new Date();
  await mongoose.connect(process.env.MONGO_URI);
  console.log("[seed] connected to MongoDB");

  // Only this script's own previous run should ever be wiped. Ride has no
  // "SEED-" marker of its own, so scope its wipe (and the Bookings pointing
  // at those rides) to the seed org specifically — an unscoped
  // Ride.deleteMany({}) would also destroy real rides published by real
  // users during manual testing, which is not this script's data to touch.
  const existingOrg = await Organization.findOne({ name: "Wayflow Demo Org" });
  const staleRideIds = existingOrg ? await Ride.find({ organization: existingOrg._id }).distinct("_id") : [];

  await Promise.all([
    Trip.deleteMany({ trip_id: { $regex: /^SEED-/ } }),
    staleRideIds.length ? Ride.deleteMany({ _id: { $in: staleRideIds } }) : Promise.resolve(),
    staleRideIds.length ? Booking.deleteMany({ ride: { $in: staleRideIds } }) : Promise.resolve(),
    Vehicle.deleteMany({ registrationNumber: { $regex: /^WB-SEED-/ } }),
    User.deleteMany({ email: { $regex: /@wayflow-seed\.com$/ } }),
  ]);
  if (existingOrg) await Organization.deleteOne({ _id: existingOrg._id });
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

  // 2. Employee users — clustered around South Kolkata. The first 6 are the
  // original hand-picked cast (kept for anyone with those logins memorized);
  // the rest are generated to reach TOTAL_EMPLOYEES. isActive/lastLoginAt
  // vary so the admin dashboard's engagement charts have something to show.
  const namedSeeds = [
    { name: "Rohan Das", location: LOCATIONS.jadavpur, isDriver: true, phone: 9830012345, isActive: true, loginDaysAgo: 1 },
    { name: "Priya Bose", location: LOCATIONS.ballygunge, isDriver: true, phone: 9830012346, isActive: true, loginDaysAgo: 3 },
    { name: "Sourav Ghosh", location: LOCATIONS.gariahat, isDriver: true, phone: 9830012347, isActive: true, loginDaysAgo: 20 },
    { name: "Meera Iyer", location: LOCATIONS.jadavpur, isDriver: false, phone: 9830012348, isActive: true, loginDaysAgo: null },
    { name: "Arjun Mukherjee", location: LOCATIONS.garia, isDriver: true, phone: 9830012349, isActive: false, loginDaysAgo: 15 },
    { name: "Ishita Roy", location: LOCATIONS.ballygunge, isDriver: false, phone: 9830012350, isActive: true, loginDaysAgo: 2 },
  ];

  const usedNames = new Set(namedSeeds.map((s) => s.name));
  const employeeSeeds = [...namedSeeds];
  let phoneCounter = 9800000000;
  while (employeeSeeds.length < TOTAL_EMPLOYEES) {
    employeeSeeds.push({
      name: generateUniqueName(usedNames),
      location: LOCATIONS[pick(LOCATION_KEYS)],
      isDriver: Math.random() < 0.4,
      phone: phoneCounter++,
      isActive: Math.random() < 0.9,
      loginDaysAgo: Math.random() < 0.15 ? null : randInt(0, 60),
    });
  }

  const pw = await hashed(SEED_PASSWORD);
  const userDocs = employeeSeeds.map((seed, i) => {
    const joinedDaysAgo = i < namedSeeds.length ? randInt(0, 20) : randInt(0, 200);
    const createdAt = new Date(now.getTime() - joinedDaysAgo * 24 * 60 * 60 * 1000);
    const lastLoginAt = seed.loginDaysAgo == null ? undefined : new Date(now.getTime() - seed.loginDaysAgo * 24 * 60 * 60 * 1000);
    return {
      name: seed.name,
      email: `${seed.name.toLowerCase().replace(/\s+/g, ".")}@wayflow-seed.com`,
      password: pw,
      role: "employee",
      organization: org._id,
      employeeId: `EMP-${String(i + 2).padStart(4, "0")}`,
      phone: seed.phone,
      isActive: seed.isActive,
      lastLoginAt,
      createdAt,
      updatedAt: createdAt,
    };
  });
  const insertedUsers = await User.insertMany(userDocs, { timestamps: false });
  const users = insertedUsers.map((user, i) => ({ user, ...employeeSeeds[i] }));
  console.log(`[seed] created ${users.length + 1} users (1 admin + ${users.length} employees)`);

  // 3. Vehicles — one per driver.
  const drivers = users.filter((u) => u.isDriver);
  const vehicleDocs = drivers.map((d, i) => {
    const v = VEHICLE_MODELS[i % VEHICLE_MODELS.length];
    return {
      owner: d.user._id,
      organization: org._id,
      make: v.make,
      model: v.model,
      registrationNumber: `WB-SEED-${String(i + 1).padStart(3, "0")}`,
      seatingCapacity: v.seats,
      // Keep this in sync with the owner's access — a revoked employee's
      // vehicle is suspended too, so the fleet meter has a real red slice.
      isActive: d.isActive !== false,
    };
  });
  const insertedVehicles = await Vehicle.insertMany(vehicleDocs);
  const vehicles = insertedVehicles.map((vehicle, i) => ({ vehicle, driver: drivers[i] }));
  console.log(`[seed] created ${vehicles.length} vehicles`);

  // 4. Rides + Trips — same route data written to both collections, one
  // random driver + route per plan entry.
  const RIDE_STATUS = {
    PUBLISHED: "Published",
    IN_PROGRESS: "InProgress",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
  };

  const tripPlan = buildTripPlan();
  const tripDocs = [];
  const rideDocs = [];

  for (let i = 0; i < tripPlan.length; i++) {
    const plan = tripPlan[i];
    const { vehicle, driver } = pick(vehicles);
    const [startKey, destKey] = pickTwoDistinctKeys(LOCATION_KEYS);
    const start = LOCATIONS[startKey];
    const dest = LOCATIONS[destKey];
    const distanceKm = haversineKm(start, dest);
    const durationMins = Math.round((distanceKm / 30) * 60); // assume ~30km/h city avg
    const farePerSeat = Math.round(20 + distanceKm * 8.5); // matches config/maps.js FARE_CONFIG

    const travelDate = new Date(now);
    travelDate.setDate(now.getDate() + plan.dayOffset);

    const currentLocation =
      plan.progress === undefined ? { lat: start.lat, lng: start.lng } : pointAlongRoute(start, dest, plan.progress);

    const availableSeats = plan.seatsOverride ?? Math.max(vehicle.seatingCapacity - randInt(1, 2), 1);

    tripDocs.push({
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
      // Explicit createdAt (insertMany below skips the automatic timestamp)
      // so completed trips actually land in the month they claim to.
      createdAt: travelDate,
      updatedAt: travelDate,
    });

    rideDocs.push({
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
      travelTime: pick(TRAVEL_TIMES),
      availableSeats,
      farePerSeat,
      status: availableSeats === 0 ? "FullyBooked" : RIDE_STATUS[plan.status],
      createdAt: travelDate,
      updatedAt: travelDate,
    });
  }

  const insertedTrips = await Trip.insertMany(tripDocs, { timestamps: false });
  const insertedRides = await Ride.insertMany(rideDocs, { timestamps: false });

  console.log(
    `[seed] created ${insertedTrips.length} trips (${tripDocs.filter((t) => t.status === "IN_PROGRESS").length} IN_PROGRESS, ${tripDocs.filter((t) => t.status === "PUBLISHED").length} PUBLISHED, ${tripDocs.filter((t) => t.status === "COMPLETED").length} COMPLETED, ${tripDocs.filter((t) => t.status === "CANCELLED").length} CANCELLED) and ${insertedRides.length} rides`
  );

  console.log("\n=== Seeded login credentials (all use the same password) ===");
  console.log(`Password: ${SEED_PASSWORD}\n`);
  console.log(`${admin.email}  (admin)`);
  namedSeeds.forEach((s, i) => console.log(`${users[i].user.email}  (${s.isDriver ? "driver" : "rider"})`));
  console.log(`...+ ${users.length - namedSeeds.length} more @wayflow-seed.com accounts (${drivers.length} drivers, ${users.length - drivers.length} riders total)`);
  console.log("================================================================\n");

  await mongoose.disconnect();
  console.log("[seed] done, disconnected");
}

main().catch((err) => {
  console.error("[seed] failed:", err);
  process.exit(1);
});
