import { Router } from "express";
import { CriarAdmin, ListarAdmins } from "../controllers/Admin.controllers.js";
import { AuthMiddleware, VerificarTipo } from "../middlewares/AuthMiddlewares.js";
import { validar } from "../middlewares/validar.js";
import { cadastroSchema } from "../validations/schemas.js";

const router = Router()

// SOMENTE ADMIN (o primeiro admin vem do seed; antes essa rota estava aberta a qualquer pessoa)
router.post("/criar", AuthMiddleware, VerificarTipo(["ADMIN"]), validar(cadastroSchema), CriarAdmin)
router.get("/listar", AuthMiddleware, VerificarTipo(["ADMIN"]), ListarAdmins)

export default router
