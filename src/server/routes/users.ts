import { Router, Request, Response } from "express";
import { db } from "../db";
import { requireAuth, requireRoles } from "../middleware/auth";
import bcrypt from "bcryptjs";

export const router = Router();
router.use(requireAuth);

router.get("/schools", (req: Request, res: Response): any => {
  const stmt = db.prepare("SELECT * FROM schools ORDER BY name ASC");
  res.json(stmt.all());
});

router.post("/schools", requireRoles(["SUPER_ADMIN"]), (req: Request, res: Response): any => {
  const { name } = req.body;
  if(!name) return res.status(400).json({error: "Name is required"});
  
  try {
    const info = db.prepare("INSERT INTO schools (name) VALUES (?)").run(name.toUpperCase());
    res.json({ id: info.lastInsertRowid, name: name.toUpperCase() });
  } catch(e) {
    res.status(400).json({error: "School might already exist"});
  }
});

router.get("/", requireRoles(["SUPER_ADMIN"]), (req: Request, res: Response): any => {
  const stmt = db.prepare(`
    SELECT u.id, u.staff_id, u.name, u.role, u.school_id, s.name as school_name 
    FROM users u
    LEFT JOIN schools s ON u.school_id = s.id
  `);
  res.json(stmt.all());
});

router.post("/", requireRoles(["SUPER_ADMIN"]), (req: Request, res: Response): any => {
  const data = req.body;
  try {
    const hash = bcrypt.hashSync(data.password || "123456", 10);
    const stmt = db.prepare(`
       INSERT INTO users (staff_id, name, role, password_hash, school_id)
       VALUES (?, ?, ?, ?, ?)
    `);
    const info = stmt.run(data.staff_id.toUpperCase(), data.name.toUpperCase(), data.role, hash, data.school_id || null);
    res.json({ id: info.lastInsertRowid });
  } catch(e: any) {
    res.status(400).json({error: "Error creating user. Staff ID must be unique."});
  }
});

router.delete("/:id", requireRoles(["SUPER_ADMIN"]), (req: Request, res: Response): any => {
  db.prepare("DELETE FROM users WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});

router.put("/:id/reset-password", requireRoles(["SUPER_ADMIN"]), (req: Request, res: Response): any => {
  const { newPassword } = req.body;
  if (!newPassword || newPassword.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters long." });
  }

  try {
    const hash = bcrypt.hashSync(newPassword, 10);
    const stmt = db.prepare("UPDATE users SET password_hash = ? WHERE id = ?");
    stmt.run(hash, req.params.id);
    res.json({ success: true });
  } catch(e: any) {
    res.status(500).json({ error: "Failed to reset password." });
  }
});
