import Database from "better-sqlite3";
const db = new Database("kemed.db");
console.log(db.prepare("SELECT * FROM schools").all());
