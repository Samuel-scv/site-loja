import { Router } from "express";
import { ListarLogs } from "../controllers/Log.controllers.js";
import { AuthMiddleware, VerificarTipo } from "../middlewares/AuthMiddlewares.js";

const router = Router()

router.get("/listar", AuthMiddleware, VerificarTipo(["ADMIN"]), ListarLogs)

export default router