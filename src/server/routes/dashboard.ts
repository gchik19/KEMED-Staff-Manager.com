import { Router, Request, Response } from "express";
import { db } from "../db";
import { requireAuth, requireRoles } from "../middleware/auth";

export const router = Router();
router.use(requireAuth);
// Only admins and super admins can view dashboard
router.use(requireRoles(["SUPER_ADMIN", "ADMIN"]));

router.get("/", (req: Request, res: Response): any => {
  try {
    const totalTeachers = db.prepare("SELECT COUNT(*) as c FROM staff_records").get() as any;
    
    const bySchool = db.prepare(`
      SELECT sch.name as school, COUNT(s.id) as count 
      FROM staff_records s 
      JOIN schools sch ON s.school_id = sch.id 
      GROUP BY sch.id
    `).all();
    
    const byLevel = db.prepare(`
      SELECT level_taught as level, COUNT(*) as count 
      FROM staff_records 
      WHERE level_taught IS NOT NULL
      GROUP BY level_taught
    `).all();
    
    const bySubject = db.prepare(`
      SELECT subject_taught as subject, COUNT(*) as count 
      FROM staff_records 
      WHERE subject_taught IS NOT NULL
      GROUP BY subject_taught
      ORDER BY count DESC LIMIT 10
    `).all();

    const byQualification = db.prepare(`
      SELECT highest_qualification as qualification, COUNT(*) as count 
      FROM staff_records 
      WHERE highest_qualification IS NOT NULL
      GROUP BY highest_qualification
      ORDER BY count DESC
    `).all();

    const ageDistributionQuery = db.prepare(`
      SELECT 
        SUM(CASE WHEN age < 30 THEN 1 ELSE 0 END) as 'Under 30',
        SUM(CASE WHEN age BETWEEN 30 AND 39 THEN 1 ELSE 0 END) as '30-39',
        SUM(CASE WHEN age BETWEEN 40 AND 49 THEN 1 ELSE 0 END) as '40-49',
        SUM(CASE WHEN age BETWEEN 50 AND 59 THEN 1 ELSE 0 END) as '50-59',
        SUM(CASE WHEN age >= 60 THEN 1 ELSE 0 END) as '60+'
      FROM staff_records
    `).get();
    
    const ageDistribution = [
       { group: "Under 30", count: (ageDistributionQuery as any)['Under 30'] || 0 },
       { group: "30-39", count: (ageDistributionQuery as any)['30-39'] || 0 },
       { group: "40-49", count: (ageDistributionQuery as any)['40-49'] || 0 },
       { group: "50-59", count: (ageDistributionQuery as any)['50-59'] || 0 },
       { group: "60+", count: (ageDistributionQuery as any)['60+'] || 0 },
    ];

    const retiringSoon = db.prepare(`
      SELECT full_name, years_to_retirement, sch.name as school_name 
      FROM staff_records s
      LEFT JOIN schools sch ON s.school_id = sch.id
      WHERE years_to_retirement <= 5
      ORDER BY years_to_retirement ASC
    `).all();

    res.json({
      totalTeachers: totalTeachers.c,
      bySchool,
      byLevel,
      bySubject,
      byQualification,
      ageDistribution,
      retiringSoon
    });
  } catch (err) {
    res.status(500).json({ error: "Dashboard analytics error" });
  }
});
