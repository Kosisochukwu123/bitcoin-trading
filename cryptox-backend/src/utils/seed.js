// src/utils/seed.js
// Run with:  npm run seed
// Shows what the in-memory DB starts with on every boot.

import db from "../config/database.js";

console.log("\n═══════════════════════════════════════");
console.log("  CryptoX Backend — Seed / Demo Data");
console.log("═══════════════════════════════════════\n");

console.log("👤 DEMO USERS");
db.users.forEach(u => {
  console.log(`   ${u.isAdmin ? "⚡" : "👤"} ${u.name}`);
  console.log(`      email:   ${u.email}`);
  console.log(`      id:      ${u.id}`);
  console.log(`      balance: $${u.balance.toLocaleString()}`);
  console.log(`      admin:   ${u.isAdmin}`);
  console.log();
});

console.log("💰 DEMO PASSWORDS (plain-text for testing)");
console.log("   user@demo.com  →  demo123");
console.log("   admin@demo.com →  admin123\n");

console.log("📈 COINS SEEDED:", db.coins.length);
db.coins.forEach(c => console.log(`   ${c.icon}  ${c.id}  $${c.price}`));

console.log("\n✅ DB is in-memory — resets on every server restart.");
console.log("   Swap src/config/database.js for MongoDB/PostgreSQL.\n");
