import { Router } from "express";
import { CriarAdmin, ListarAdmins } from "../controllers/Admin.controllers.js";
import { AuthMiddleware, VerificarTipo } from "../middlewares/AuthMiddlewares.js";

const router = Router()

router.post("/criar", CriarAdmin)
router.get("/listar", AuthMiddleware, VerificarTipo(["ADMIN"]), ListarAdmins)

export default router