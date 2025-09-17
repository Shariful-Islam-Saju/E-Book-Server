// app/routes/index.ts
import { Router } from "express";
import { authRouter } from "@app/modules/auth/auth.route";
import { fileRouter } from "@app/modules/file/file.route";
import { leadRouter } from "@app/modules/lead/lead.route";
import { reviewRouter } from "@app/modules/review/review.route";

const router = Router();

interface ModuleRoute {
  path: string;
  route: Router;
}

const moduleRoutes: ModuleRoute[] = [
  {
    path: "/auth",
    route: authRouter,
  },
  {
    path: "/file",
    route: fileRouter,
  },
  {
    path: "/lead",
    route: leadRouter,
  },
  {
    path: "/review",
    route: reviewRouter,
  }
];

// Attach all routes to main router
moduleRoutes.forEach(({ path, route }) => router.use(path, route));

export default router;
