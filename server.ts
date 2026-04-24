import express from "express";
import cors from "cors";
import path from "path";
import { createServer as createViteServer } from "vite";
import { setupDb } from "./src/server/db";
import { router as authRouter } from "./src/server/routes/auth";
import { router as staffRouter } from "./src/server/routes/staff";
import { router as dashboardRouter } from "./src/server/routes/dashboard";
import { router as usersRouter } from "./src/server/routes/users";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialize DB
  setupDb();

  app.use(cors());
  app.use(express.json());

  // API Routes
  app.use("/api/auth", authRouter);
  app.use("/api/staff", staffRouter);
  app.use("/api/dashboard", dashboardRouter);
  app.use("/api/users", usersRouter);

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(console.error);
