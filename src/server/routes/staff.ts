import { Router, Request, Response } from "express";
import { db } from "../db";
import { requireAuth, requireRoles } from "../middleware/auth";

export const router = Router();

router.use(requireAuth);

router.get("/", (req: Request, res: Response): any => {
  const user = (req as any).user;
  
  let stmt;
  if (user.role === "HEAD_TEACHER") {
    stmt = db.prepare(`
      SELECT s.*, sch.name as school_name 
      FROM staff_records s 
      LEFT JOIN schools sch ON s.school_id = sch.id 
      WHERE s.school_id = ?
      ORDER BY s.created_at DESC
    `);
    res.json(stmt.all(user.school_id));
  } else {
    // SUPER_ADMIN or ADMIN see everything
    stmt = db.prepare(`
      SELECT s.*, sch.name as school_name 
      FROM staff_records s 
      LEFT JOIN schools sch ON s.school_id = sch.id 
      ORDER BY s.created_at DESC
    `);
    res.json(stmt.all());
  }
});

router.post("/", (req: Request, res: Response): any => {
  const user = (req as any).user;
  if (user.role === "ADMIN") {
    return res.status(403).json({ error: "Admins cannot add records." });
  }

  const data = req.body;
  // Preprocess data
  for (const key of Object.keys(data)) {
    if (data[key] === "") {
       data[key] = null;
    } else if (typeof data[key] === "string" && key !== "password") {
       data[key] = data[key].toUpperCase();
    }
  }

  const school_id = user.role === "HEAD_TEACHER" ? user.school_id : (data.school_id || null);

  try {
    const stmt = db.prepare(`
      INSERT INTO staff_records (
        staff_id, first_name, surname, other_names, full_name,
        job_grade, highest_qualification, qualification_institution,
        level_taught, class_taught, subject_taught, additional_responsibility,
        dob, age, years_to_retirement, ssnit_number, ghana_card_number,
        management_unit, payroll_active, at_post_or_leave, leave_type,
        bank_name, account_number, telephone, school_id, created_by
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
    `);
    
    // Auto calculatons
    const fullName = [data.first_name, data.other_names, data.surname].filter(Boolean).join(" ");
    
    const params = [
      data.staff_id, data.first_name, data.surname, data.other_names, fullName,
      data.job_grade, data.highest_qualification, data.qualification_institution,
      data.level_taught, data.class_taught, data.subject_taught, data.additional_responsibility,
      data.dob, data.age, data.years_to_retirement, data.ssnit_number, data.ghana_card_number,
      data.management_unit, data.payroll_active ? 1 : 0, data.at_post_or_leave, data.leave_type,
      data.bank_name, data.account_number, data.telephone, school_id, user.id
    ].map(v => v === undefined ? null : v);

    const info = stmt.run(...params);

    res.json({ success: true, id: info.lastInsertRowid });
  } catch (err: any) {
    console.error("DB POST error:", err);
    if (err.message.includes("UNIQUE")) {
       return res.status(400).json({ error: "Staff ID already exists." });
    }
    res.status(500).json({ error: "Database error: " + err.message });
  }
});

router.put("/:id", (req: Request, res: Response): any => {
  const user = (req as any).user;
  if (user.role === "ADMIN") {
    return res.status(403).json({ error: "Admins cannot edit records." });
  }

  const data = req.body;
  const id = req.params.id;

  // Verify ownership for HEAD_TEACHER
  if (user.role === "HEAD_TEACHER") {
     const existing = db.prepare("SELECT school_id FROM staff_records WHERE id = ?").get(id) as any;
     if (!existing || existing.school_id !== user.school_id) {
        return res.status(403).json({ error: "Forbidden" });
     }
  }

  // Preprocess data
  for (const key of Object.keys(data)) {
    if (data[key] === "") {
       data[key] = null;
    } else if (typeof data[key] === "string" && key !== "password") {
       data[key] = data[key].toUpperCase();
    }
  }

  const fullName = [data.first_name, data.other_names, data.surname].filter(Boolean).join(" ");
  const school_id = user.role === "HEAD_TEACHER" ? user.school_id : (data.school_id || null);

  try {
    const stmt = db.prepare(`
      UPDATE staff_records SET
        staff_id=?, first_name=?, surname=?, other_names=?, full_name=?,
        job_grade=?, highest_qualification=?, qualification_institution=?,
        level_taught=?, class_taught=?, subject_taught=?, additional_responsibility=?,
        dob=?, age=?, years_to_retirement=?, ssnit_number=?, ghana_card_number=?,
        management_unit=?, payroll_active=?, at_post_or_leave=?, leave_type=?,
        bank_name=?, account_number=?, telephone=?, school_id=?, updated_at=CURRENT_TIMESTAMP
      WHERE id=?
    `);

    const params = [
      data.staff_id, data.first_name, data.surname, data.other_names, fullName,
      data.job_grade, data.highest_qualification, data.qualification_institution,
      data.level_taught, data.class_taught, data.subject_taught, data.additional_responsibility,
      data.dob, data.age, data.years_to_retirement, data.ssnit_number, data.ghana_card_number,
      data.management_unit, data.payroll_active ? 1 : 0, data.at_post_or_leave, data.leave_type,
      data.bank_name, data.account_number, data.telephone, school_id, id
    ].map(v => v === undefined ? null : v);

    stmt.run(...params);

    res.json({ success: true });
  } catch (err: any) {
    console.error("DB PUT error:", err);
    if (err.message.includes("UNIQUE")) {
       return res.status(400).json({ error: "Staff ID already exists." });
    }
    res.status(500).json({ error: "Database error: " + err.message });
  }
});

router.delete("/:id", requireRoles(["SUPER_ADMIN"]), (req: Request, res: Response): any => {
   const stmt = db.prepare("DELETE FROM staff_records WHERE id = ?");
   stmt.run(req.params.id);
   res.json({ success: true });
});
