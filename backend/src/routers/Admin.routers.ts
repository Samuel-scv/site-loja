import { Router } from "express";
import { CriarAdmin, ListarAdmins } from "../controllers/Admin.controllers.js";
import { AuthMiddleware, VerificarTipo } from "../middlewares/AuthMiddlewares.js";

const router = Router()

router.use(AuthMiddleware, VerificarTipo(["ADMIN"]))

router.post("/criar", CriarAdmin)
router.get("/listar", ListarAdmins)

export default router