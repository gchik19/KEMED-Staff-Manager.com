import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";

const dbPath = path.join(process.cwd(), "kemed.db");
export const db = new Database(dbPath);

export function setupDb() {
  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS schools (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      staff_id TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      school_id INTEGER,
      FOREIGN KEY (school_id) REFERENCES schools (id)
    );

    CREATE TABLE IF NOT EXISTS staff_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      staff_id TEXT UNIQUE NOT NULL,
      first_name TEXT NOT NULL,
      surname TEXT NOT NULL,
      other_names TEXT,
      full_name TEXT NOT NULL,
      job_grade TEXT,
      highest_qualification TEXT,
      qualification_institution TEXT,
      level_taught TEXT,
      class_taught TEXT,
      subject_taught TEXT,
      additional_responsibility TEXT,
      dob TEXT NOT NULL,
      age INTEGER,
      years_to_retirement INTEGER,
      ssnit_number TEXT,
      ghana_card_number TEXT,
      management_unit TEXT,
      payroll_active BOOLEAN,
      at_post_or_leave TEXT,
      leave_type TEXT,
      bank_name TEXT,
      account_number TEXT,
      telephone TEXT,
      school_id INTEGER,
      created_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (school_id) REFERENCES schools (id),
      FOREIGN KEY (created_by) REFERENCES users (id)
    );
  `);

  // Seed default Super Admin if not exists
  const superAdmin = db.prepare("SELECT * FROM users WHERE role = 'SUPER_ADMIN'").get();
  if (!superAdmin) {
    const passwordHash = bcrypt.hashSync("admin123", 10);
    db.prepare(`
      INSERT INTO users (staff_id, name, role, password_hash)
      VALUES (?, ?, ?, ?)
    `).run("ADMIN-001", "SYSTEM ADMIN", "SUPER_ADMIN", passwordHash);
    console.log("Seeded Super Admin user.");
  }
}
