/**
 * Adds demo employees — each with their own vehicle — into a specific
 * admin's own organization — unlike seedData.js, which populates a wholly
 * separate "Wayflow Demo Org" that your real admin account never belongs
 * to, so its data never showed up on your actual admin dashboard.
 *
 * Run: node seed/seedAdminOrg.js [adminEmail] [count]
 *   adminEmail — defaults to singhabhinav2205@gmail.com
 *   count      — how many employees/vehicles to add, defaults to 40 (30-50
 *                range). Split deterministically so at least 30 are active
 *                and at least 5 are inactive/revoked, for both employees
 *                and their vehicles.
 *
 * Safe to re-run: only ever touches records it created itself (marked by
 * the @wayflow-org-seed.com email domain and AB-ORG- registration prefix,
 * both additionally scoped to this specific organization id), so it never
 * touches your real employees/vehicles or another org's data.
 */
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("../models/User");
const Vehicle = require("../models/Vehicle");

const SEED_PASSWORD = "Password123!";
const EMAIL_DOMAIN = "wayflow-org-seed.com";
const REG_PREFIX = "AB-ORG-";

const FIRST_NAMES = [
  "Rohan", "Priya", "Sourav", "Meera", "Arjun", "Ishita", "Ananya", "Kunal", "Neha", "Vikram",
  "Sneha", "Aditya", "Pooja", "Rahul", "Divya", "Karan", "Simran", "Aman", "Riya", "Manish",
  "Anjali", "Siddharth", "Tanvi", "Rajesh", "Kavita", "Nikhil", "Shreya", "Varun", "Pallavi", "Abhishek",
];
const LAST_NAMES = [
  "Das", "Bose", "Ghosh", "Iyer", "Mukherjee", "Roy", "Sen", "Chatterjee", "Banerjee", "Chakraborty",
  "Dutta", "Sarkar", "Mitra", "Nair", "Reddy", "Gupta", "Sharma", "Verma", "Kapoor", "Malhotra",
];
const VEHICLE_MODELS = [
  { make: "Maruti Suzuki", model: "Swift", seats: 4 },
  { make: "Hyundai", model: "i20", seats: 4 },
  { make: "Tata", model: "Nexon", seats: 5 },
  { make: "Honda", model: "City", seats: 4 },
  { make: "Toyota", model: "Innova", seats: 6 },
];

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function pick(arr) {
  return arr[randInt(0, arr.length - 1)];
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

async function hashed(pw) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(pw, salt);
}

async function main() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI not set — check backend/.env");
  }
  const adminEmail = (process.argv[2] || "singhabhinav2205@gmail.com").toLowerCase();
  const count = Math.max(30, Math.min(50, parseInt(process.argv[3], 10) || 40));
  const now = new Date();

  await mongoose.connect(process.env.MONGO_URI);
  console.log("[seed-org] connected to MongoDB");

  const admin = await User.findOne({ email: adminEmail, role: "admin" });
  if (!admin) {
    throw new Error(`No admin account found for ${adminEmail}`);
  }
  if (!admin.organization) {
    throw new Error(`${adminEmail} doesn't belong to an organization yet — create one from the admin panel first.`);
  }
  const orgId = admin.organization;
  console.log(`[seed-org] target: ${adminEmail}'s organization (${orgId})`);

  // Only ever touch this org's own previously-seeded records — never a
  // blanket wipe, so nothing outside what this script created is at risk.
  await Promise.all([
    User.deleteMany({ organization: orgId, email: { $regex: new RegExp(`@${EMAIL_DOMAIN}$`) } }),
    Vehicle.deleteMany({ organization: orgId, registrationNumber: { $regex: new RegExp(`^${REG_PREFIX}`) } }),
  ]);

  // Deterministic active/inactive split (not a probability threshold) so the
  // dashboard always shows at least MIN_ACTIVE active and MIN_INACTIVE
  // revoked accounts, never "probably enough". Every employee also owns a
  // vehicle, so the Vehicle Fleet split mirrors these same two numbers.
  const MIN_ACTIVE = 30;
  const MIN_INACTIVE = 5;
  const inactiveTarget = Math.max(MIN_INACTIVE, Math.round(count * 0.2));
  const activeTarget = count - inactiveTarget;
  if (activeTarget < MIN_ACTIVE) {
    throw new Error(`count=${count} is too low to guarantee >=${MIN_ACTIVE} active with >=${MIN_INACTIVE} inactive — raise count.`);
  }
  const activeFlags = shuffle([...Array(activeTarget).fill(true), ...Array(inactiveTarget).fill(false)]);

  const usedNames = new Set();
  const employeeSeeds = [];
  let phoneCounter = 9810000000;
  while (employeeSeeds.length < count) {
    const isActive = activeFlags[employeeSeeds.length];
    employeeSeeds.push({
      name: generateUniqueName(usedNames),
      isDriver: true,
      phone: phoneCounter++,
      isActive,
      loginDaysAgo: !isActive ? randInt(20, 90) : Math.random() < 0.2 ? null : randInt(0, 45),
    });
  }

  const pw = await hashed(SEED_PASSWORD);
  const userDocs = employeeSeeds.map((seed, i) => {
    const joinedDaysAgo = randInt(0, 120);
    const createdAt = new Date(now.getTime() - joinedDaysAgo * 24 * 60 * 60 * 1000);
    const lastLoginAt = seed.loginDaysAgo == null ? undefined : new Date(now.getTime() - seed.loginDaysAgo * 24 * 60 * 60 * 1000);
    return {
      name: seed.name,
      email: `${seed.name.toLowerCase().replace(/\s+/g, ".")}@${EMAIL_DOMAIN}`,
      password: pw,
      role: "employee",
      organization: orgId,
      employeeId: `EMP-ORG-${String(i + 1).padStart(3, "0")}`,
      phone: seed.phone,
      isActive: seed.isActive,
      lastLoginAt,
      createdAt,
      updatedAt: createdAt,
    };
  });
  const insertedUsers = await User.insertMany(userDocs, { timestamps: false });
  const users = insertedUsers.map((user, i) => ({ user, ...employeeSeeds[i] }));
  console.log(`[seed-org] added ${users.length} employees`);

  const drivers = users.filter((u) => u.isDriver);
  const vehicleDocs = drivers.map((d, i) => {
    const v = VEHICLE_MODELS[i % VEHICLE_MODELS.length];
    return {
      owner: d.user._id,
      organization: orgId,
      make: v.make,
      model: v.model,
      registrationNumber: `${REG_PREFIX}${String(i + 1).padStart(3, "0")}`,
      seatingCapacity: v.seats,
      isActive: d.isActive !== false,
    };
  });
  const insertedVehicles = vehicleDocs.length ? await Vehicle.insertMany(vehicleDocs) : [];
  console.log(`[seed-org] added ${insertedVehicles.length} vehicles (${drivers.length} employees marked as drivers)`);

  console.log("\n=== Added logins (all use the same password) ===");
  console.log(`Password: ${SEED_PASSWORD}`);
  console.log(`Sample: ${users[0].user.email}, ${users[1].user.email}, ${users[2].user.email} ... (+${users.length - 3} more)`);
  console.log("===================================================\n");
  console.log(`[seed-org] refresh the admin dashboard at /admin — Total Employees should now read ${users.length}.`);

  await mongoose.disconnect();
  console.log("[seed-org] done, disconnected");
}

main().catch((err) => {
  console.error("[seed-org] failed:", err.message);
  process.exit(1);
});
