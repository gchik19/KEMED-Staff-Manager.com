import { Router, Request, Response } from "express";
import { db } from "../db";
import { requireAuth, requireRoles } from "../middleware/auth";

export const router = Router();
router.use(requireAuth);

router.get("/", (req: Request, res: Response): any => {
  const stmt = db.prepare("SELECT * FROM schools ORDER BY name ASC");
  res.json(stmt.all());
});

router.post("/", requireRoles(["SUPER_ADMIN"]), (req: Request, res: Response): any => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "School name is required" });
  
  try {
    const info = db.prepare("INSERT INTO schools (name) VALUES (?)").run(name.toUpperCase());
    res.json({ success: true, id: info.lastInsertRowid });
  } catch (err: any) {
    if (err.message.includes("UNIQUE")) {
      return res.status(400).json({ error: "School already exists" });
    }
    res.status(500).json({ error: "Database error" });
  }
});

router.put("/:id", requireRoles(["SUPER_ADMIN"]), (req: Request, res: Response): any => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "School name is required" });
  
  try {
    db.prepare("UPDATE schools SET name = ? WHERE id = ?").run(name.toUpperCase(), req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    if (err.message.includes("UNIQUE")) {
      return res.status(400).json({ error: "School already exists" });
    }
    res.status(500).json({ error: "Database error" });
  }
});

router.delete("/:id", requireRoles(["SUPER_ADMIN"]), (req: Request, res: Response): any => {
  try {
    db.prepare("DELETE FROM schools WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    if (err.message.includes("FOREIGN KEY")) {
       return res.status(400).json({ error: "Cannot delete school. It has users or staff associated." });
    }
    res.status(500).json({ error: "Database error" });
  }
});
