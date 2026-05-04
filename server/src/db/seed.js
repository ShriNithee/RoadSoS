const Database = require("better-sqlite3");

const contacts = [
  { name: "Apollo Emergency Chennai", type: "hospital", phone: "+91-44-2829-3333", lat: 13.0604, lng: 80.2496, address: "21 Greams Ln, Thousand Lights", city: "Chennai", country: "India" },
  { name: "Fortis Malar Emergency", type: "hospital", phone: "+91-44-4289-2222", lat: 13.0291, lng: 80.2674, address: "52, 1st Main Rd, Gandhi Nagar", city: "Chennai", country: "India" },
  { name: "Chennai City Police Control Room", type: "police", phone: "+91-44-2345-2301", lat: 13.0818, lng: 80.2752, address: "Vepery High Rd", city: "Chennai", country: "India" },
  { name: "GVK EMRI Ambulance Chennai", type: "ambulance", phone: "108", lat: 13.0674, lng: 80.2376, address: "Anna Salai", city: "Chennai", country: "India" },
  { name: "OMR Fast Tow Services", type: "towing", phone: "+91-98400-11223", lat: 12.9136, lng: 80.2279, address: "Rajiv Gandhi Salai", city: "Chennai", country: "India" },
  { name: "Adyar Tyre Puncture Assist", type: "puncture", phone: "+91-98841-44321", lat: 13.0012, lng: 80.2565, address: "Lattice Bridge Rd", city: "Chennai", country: "India" },
  { name: "IOC Fuel Relief T Nagar", type: "fuel", phone: "+91-44-2434-1001", lat: 13.0418, lng: 80.2337, address: "South Usman Rd", city: "Chennai", country: "India" },
  { name: "Mount Road Auto Mechanic Hub", type: "mechanic", phone: "+91-99529-66771", lat: 13.0635, lng: 80.2641, address: "Mount Road", city: "Chennai", country: "India" },
  { name: "Dhaka Medical Emergency Unit", type: "hospital", phone: "+880-2-5516-5000", lat: 23.7272, lng: 90.3955, address: "Bakshibazar", city: "Dhaka", country: "Bangladesh" },
  { name: "Square Hospital Emergency", type: "hospital", phone: "+880-2-8159-457", lat: 23.7512, lng: 90.3832, address: "West Panthapath", city: "Dhaka", country: "Bangladesh" },
  { name: "Dhaka Metropolitan Police HQ", type: "police", phone: "+880-2-5511-0000", lat: 23.7283, lng: 90.4078, address: "36 Shaheed Tajuddin Ahmed Ave", city: "Dhaka", country: "Bangladesh" },
  { name: "National Ambulance Dhaka", type: "ambulance", phone: "999", lat: 23.7465, lng: 90.3760, address: "Tejgaon Link Rd", city: "Dhaka", country: "Bangladesh" },
  { name: "Gulshan Tow & Recovery", type: "towing", phone: "+880-1711-223344", lat: 23.7925, lng: 90.4078, address: "Gulshan Ave", city: "Dhaka", country: "Bangladesh" },
  { name: "Motijheel Tyre Rescue", type: "puncture", phone: "+880-1819-887766", lat: 23.7337, lng: 90.4173, address: "Motijheel C/A", city: "Dhaka", country: "Bangladesh" },
  { name: "Padma Fuel Assist Farmgate", type: "fuel", phone: "+880-2-9132-000", lat: 23.7573, lng: 90.3892, address: "Farmgate", city: "Dhaka", country: "Bangladesh" },
  { name: "National Hospital Colombo ER", type: "hospital", phone: "+94-11-2691-111", lat: 6.9163, lng: 79.8683, address: "Regent St", city: "Colombo", country: "Sri Lanka" },
  { name: "Colombo Police Headquarters", type: "police", phone: "+94-11-2421-111", lat: 6.9350, lng: 79.8487, address: "Olcott Mawatha", city: "Colombo", country: "Sri Lanka" },
  { name: "1990 Suwa Seriya Colombo", type: "ambulance", phone: "1990", lat: 6.9271, lng: 79.8612, address: "Union Pl", city: "Colombo", country: "Sri Lanka" },
  { name: "Baseline Road Tow Service", type: "towing", phone: "+94-77-345-9087", lat: 6.9148, lng: 79.8894, address: "Baseline Rd", city: "Colombo", country: "Sri Lanka" },
  { name: "Borella Quick Mechanic", type: "mechanic", phone: "+94-71-882-1133", lat: 6.9140, lng: 79.8779, address: "Borella", city: "Colombo", country: "Sri Lanka" },
  { name: "Bir Hospital Emergency", type: "hospital", phone: "+977-1-4221-111", lat: 27.7044, lng: 85.3156, address: "Mahaboudha Rd", city: "Kathmandu", country: "Nepal" },
  { name: "Kathmandu Metro Police Office", type: "police", phone: "+977-1-4261-944", lat: 27.7172, lng: 85.3240, address: "Bhrikutimandap", city: "Kathmandu", country: "Nepal" },
  { name: "Nepal Ambulance Service", type: "ambulance", phone: "102", lat: 27.7154, lng: 85.3278, address: "Thamel Marg", city: "Kathmandu", country: "Nepal" },
  { name: "Kalanki Puncture Spot", type: "puncture", phone: "+977-9841-556677", lat: 27.6938, lng: 85.2813, address: "Kalanki", city: "Kathmandu", country: "Nepal" },
  { name: "Koteshwor Fuel Support", type: "fuel", phone: "+977-1-4600-101", lat: 27.6782, lng: 85.3496, address: "Koteshwor Ring Rd", city: "Kathmandu", country: "Nepal" },
  { name: "Bangkok Hospital Emergency", type: "hospital", phone: "+66-2-310-3000", lat: 13.7489, lng: 100.5833, address: "Soi Soonvijai 7", city: "Bangkok", country: "Thailand" },
  { name: "Royal Thai Police HQ", type: "police", phone: "+66-2-252-8111", lat: 13.7447, lng: 100.5419, address: "Rama I Rd", city: "Bangkok", country: "Thailand" },
  { name: "Bangkok EMS Center", type: "ambulance", phone: "1669", lat: 13.7563, lng: 100.5018, address: "Din Daeng", city: "Bangkok", country: "Thailand" },
  { name: "Rama IX Tow Team", type: "towing", phone: "+66-81-234-5566", lat: 13.7584, lng: 100.5702, address: "Rama IX Rd", city: "Bangkok", country: "Thailand" },
  { name: "Sukhumvit Roadside Mechanic", type: "mechanic", phone: "+66-86-778-9900", lat: 13.7306, lng: 100.5697, address: "Sukhumvit 71", city: "Bangkok", country: "Thailand" },
  { name: "Ganga Hospital Coimbatore", type: "hospital", phone: "+91-422-2485-000", lat: 11.0168, lng: 76.9558, address: "Mettupalayam Rd", city: "Coimbatore", country: "India" },
{ name: "Coimbatore Medical College Hospital", type: "hospital", phone: "+91-422-2301-393", lat: 11.0238, lng: 76.9629, address: "Trichy Rd", city: "Coimbatore", country: "India" },
{ name: "PSG Hospital Coimbatore", type: "hospital", phone: "+91-422-4345-000", lat: 11.0270, lng: 76.9850, address: "Peelamedu", city: "Coimbatore", country: "India" },
{ name: "Coimbatore City Police Control", type: "police", phone: "+91-422-2390-100", lat: 11.0168, lng: 76.9558, address: "Avanashi Rd", city: "Coimbatore", country: "India" },
{ name: "Singanallur Police Station", type: "police", phone: "+91-422-2572-100", lat: 11.0021, lng: 77.0231, address: "Singanallur", city: "Coimbatore", country: "India" },
{ name: "GVK EMRI Ambulance Coimbatore", type: "ambulance", phone: "108", lat: 11.0300, lng: 76.9700, address: "Gandhipuram", city: "Coimbatore", country: "India" },
{ name: "Coimbatore Ambulance Network", type: "ambulance", phone: "+91-422-2220-000", lat: 11.0168, lng: 76.9748, address: "Race Course Rd", city: "Coimbatore", country: "India" },
{ name: "RS Puram Towing Service", type: "towing", phone: "+91-98421-11234", lat: 11.0050, lng: 76.9612, address: "RS Puram", city: "Coimbatore", country: "India" },
{ name: "Peelamedu Vehicle Recovery", type: "towing", phone: "+91-97890-22345", lat: 11.0270, lng: 77.0050, address: "Avinashi Rd", city: "Coimbatore", country: "India" },
{ name: "Gandhipuram Puncture Shop", type: "puncture", phone: "+91-97890-44321", lat: 11.0168, lng: 76.9748, address: "Gandhipuram Bus Stand", city: "Coimbatore", country: "India" },
{ name: "Ukkadam Tyre Repair", type: "puncture", phone: "+91-98430-33456", lat: 10.9920, lng: 76.9612, address: "Ukkadam", city: "Coimbatore", country: "India" },
{ name: "BPCL Fuel Station Peelamedu", type: "fuel", phone: "+91-422-2570-001", lat: 11.0270, lng: 77.0050, address: "Avinashi Rd", city: "Coimbatore", country: "India" },
{ name: "Indian Oil Gandhipuram", type: "fuel", phone: "+91-422-2234-002", lat: 11.0200, lng: 76.9700, address: "100 Feet Rd", city: "Coimbatore", country: "India" },
{ name: "Sree Auto Works Coimbatore", type: "mechanic", phone: "+91-98430-55678", lat: 11.0100, lng: 76.9800, address: "Sowripalayam Rd", city: "Coimbatore", country: "India" },
{ name: "Royal Auto Service Peelamedu", type: "mechanic", phone: "+91-97899-77654", lat: 11.0250, lng: 77.0100, address: "Peelamedu", city: "Coimbatore", country: "India" }
];

// Exported function — called by database.js on startup
function seedIfEmpty(db) {
  const { count } = db.prepare("SELECT COUNT(*) as count FROM emergency_contacts").get();
  if (count > 0) {
    console.log(`DB already has ${count} contacts, skipping seed.`);
    return;
  }

  const insert = db.prepare(`
    INSERT INTO emergency_contacts (name, type, phone, lat, lng, address, city, country, verified, available)
    VALUES (@name, @type, @phone, @lat, @lng, @address, @city, @country, @verified, @available)
  `);

  const insertMany = db.transaction((rows) => {
    for (const row of rows) {
      insert.run({ ...row, verified: row.verified ?? 1, available: row.available ?? 1 });
    }
  });

  insertMany(contacts);
  console.log(`Seeded ${contacts.length} emergency contacts.`);
}

// Allow manual run: node src/db/seed.js
if (require.main === module) {
  const path = require("path");
  const Database = require("better-sqlite3");
  const fs = require("fs");
  const dbPath = path.resolve(__dirname, "../../roadsos.db");
  const schemaPath = path.resolve(__dirname, "./schema.sql");
  const db = new Database(dbPath);
  db.exec(fs.readFileSync(schemaPath, "utf8"));
  db.prepare("DELETE FROM emergency_contacts").run();
  const insert = db.prepare(`
    INSERT INTO emergency_contacts (name, type, phone, lat, lng, address, city, country, verified, available)
    VALUES (@name, @type, @phone, @lat, @lng, @address, @city, @country, @verified, @available)
  `);
  const insertMany = db.transaction((rows) => {
    for (const row of rows) {
      insert.run({ ...row, verified: 1, available: 1 });
    }
  });
  insertMany(contacts);
  console.log(`Manually seeded ${contacts.length} contacts.`);
}

module.exports = { seedIfEmpty };