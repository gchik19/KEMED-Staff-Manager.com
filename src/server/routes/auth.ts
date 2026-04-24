import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { db } from "../db";

export const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "superfakesecret"; // fallback for demo

router.post("/login", (req: Request, res: Response): any => {
  const { staff_id, password } = req.body;
  if (!staff_id || !password) return res.status(400).json({ error: "Missing credentials" });

  const upperStaffId = staff_id.toUpperCase();
  const user = db.prepare("SELECT * FROM users WHERE staff_id = ?").get(upperStaffId) as any;
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const valid = bcrypt.compareSync(password, user.password_hash);
  if (!valid) return res.status(401).json({ error: "Invalid credentials" });

  const token = jwt.sign(
    { id: user.id, role: user.role, school_id: user.school_id, name: user.name, staff_id: user.staff_id },
    JWT_SECRET,
    { expiresIn: "12h" }
  );
  
  // Return user without password_hash
  const { password_hash, ...userSafe } = user;
  res.json({ token, user: userSafe });
});

router.get("/me", (req: Request, res: Response): any => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    res.json({ user: decoded });
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
});
