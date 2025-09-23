import { Router } from "express";
import { leadController } from "./lead.controller";
import auth from "@app/middlewares/auth";

const router = Router();

router.post("/create", leadController.createLead);
router.get("/all-leads", auth(), leadController.getAllLeads);
router.get("/:id", auth(), leadController.getLeadById);
router.put("/:id", auth(), leadController.updateLead);
router.delete("/:id", auth("SUPERADMIN", "ADMIN"), leadController.deleteLead);

export const leadRouter = router;
