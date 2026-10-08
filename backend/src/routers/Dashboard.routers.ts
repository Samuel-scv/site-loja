import { Router } from "express";
import { ObterDadosDashboard } from "../controllers/Dashboard.controllers.js";
import { AuthMiddleware, VerificarTipo } from "../middlewares/AuthMiddlewares.js";

const router = Router()

// SOMENTE ADMIN
router.get("/", AuthMiddleware, VerificarTipo(["ADMIN"]), ObterDadosDashboard)

export default router
