// Run with: npm run seed
// Populates departments, doctors, staff accounts, and beds so the site has
// real data to show, including working logins for every role.
// Safe to run more than once — it clears and re-inserts each time.

require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Department = require("./models/Department");
const Doctor = require("./models/Doctor");
const Nurse = require("./models/Nurse");
const User = require("./models/User");
const Bed = require("./models/Bed");

const departments = [
  { name: "Cardiology", icon: "❤️" },
  { name: "Neurology", icon: "🧠" },
  { name: "Orthopedics", icon: "🦴" },
  { name: "Pediatrics", icon: "🧒" },
  { name: "Radiology", icon: "🩻" },
  { name: "Emergency Care", icon: "🚑" },
];

const doctors = [
  { name: "Dr. Imran Qureshi", specialty: "Cardiologist", department: "Cardiology", experienceYears: 12, rating: 4.9, reviewCount: 138 },
  { name: "Dr. Ayesha Malik", specialty: "Cardiologist", department: "Cardiology", experienceYears: 9, rating: 4.8, reviewCount: 96 },
  { name: "Dr. Farhan Siddiqui", specialty: "Neurologist", department: "Neurology", experienceYears: 14, rating: 4.9, reviewCount: 121 },
  { name: "Dr. Sana Raza", specialty: "Neurologist", department: "Neurology", experienceYears: 8, rating: 4.7, reviewCount: 74 },
  { name: "Dr. Bilal Ahmed", specialty: "Orthopedic Surgeon", department: "Orthopedics", experienceYears: 15, rating: 4.9, reviewCount: 156 },
  { name: "Dr. Hina Yousuf", specialty: "Pediatrician", department: "Pediatrics", experienceYears: 10, rating: 4.8, reviewCount: 112 },
  { name: "Dr. Omar Farooq", specialty: "Radiologist", department: "Radiology", experienceYears: 11, rating: 4.7, reviewCount: 89 },
  { name: "Dr. Nadia Iqbal", specialty: "Emergency Medicine", department: "Emergency Care", experienceYears: 13, rating: 4.9, reviewCount: 143 },
];

const DEMO_PASSWORD = "Passw0rd!";

function initialsOf(name) {
  return name.replace("Dr. ", "").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}
function emailOf(name) {
  return name.replace("Dr. ", "").toLowerCase().replace(/[^a-z]+/g, ".") + "@healthcareplus.demo";
}

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB — seeding...");

  await Department.deleteMany({});
  await Department.insertMany(departments);
  console.log(`Inserted ${departments.length} departments`);

  // Wipe staff/demo accounts + profiles from a previous seed run (keeps real patient signups intact)
  await User.deleteMany({ email: { $regex: "@healthcareplus\\.demo$" } });
  await Doctor.deleteMany({});
  await Nurse.deleteMany({});
  await Bed.deleteMany({});

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  // --- Admin ---
  await User.create({
    name: "Sara Admin", email: "admin@healthcareplus.demo", passwordHash, role: "admin",
  });

  // --- Doctors: one User (login) + one Doctor (profile) each ---
  for (const d of doctors) {
    const email = emailOf(d.name);
    const user = await User.create({ name: d.name, email, passwordHash, role: "doctor" });
    await Doctor.create({
      ...d, user: user._id, email, initials: initialsOf(d.name),
    });
  }
  console.log(`Inserted ${doctors.length} doctors (with logins)`);

  // --- Nurses ---
  const nurseSeed = [
    { name: "Nurse Aliya Baig", department: "Emergency Care", shift: "morning" },
    { name: "Nurse Farah Nasir", department: "Pediatrics", shift: "evening" },
  ];
  for (const n of nurseSeed) {
    const email = n.name.toLowerCase().replace(/[^a-z]+/g, ".") + "@healthcareplus.demo";
    const user = await User.create({ name: n.name, email, passwordHash, role: "nurse" });
    await Nurse.create({ user: user._id, name: n.name, department: n.department, shift: n.shift });
  }
  console.log(`Inserted ${nurseSeed.length} nurses (with logins)`);

  // --- Receptionist ---
  await User.create({
    name: "Zara Reception", email: "reception@healthcareplus.demo", passwordHash, role: "receptionist",
  });

  // --- Beds ---
  const wards = [
    { ward: "General Ward", count: 10, department: "General" },
    { ward: "ICU", count: 4, department: "Emergency Care" },
    { ward: "Pediatric Ward", count: 6, department: "Pediatrics" },
  ];
  let bedDocs = [];
  for (const w of wards) {
    for (let i = 1; i <= w.count; i++) {
      bedDocs.push({ ward: w.ward, bedNumber: String(i).padStart(2, "0"), department: w.department });
    }
  }
  // occupy a few beds so "available beds" isn't just the full count
  bedDocs = bedDocs.map((b, i) => (i % 4 === 0 ? { ...b, status: "occupied" } : b));
  await Bed.insertMany(bedDocs);
  console.log(`Inserted ${bedDocs.length} beds`);

  console.log("\nDemo logins (password for all: " + DEMO_PASSWORD + "):");
  console.log("  Admin:        admin@healthcareplus.demo");
  console.log("  Doctor:       " + emailOf(doctors[0].name));
  console.log("  Nurse:        aliya.baig@healthcareplus.demo");
  console.log("  Receptionist: reception@healthcareplus.demo");
  console.log("  (Patients register themselves from the site.)");

  console.log("\nSeeding complete.");
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
