import { Router } from "express";
import { ComprarItem, ListarHistorico } from "../controllers/Compra.controllers.js";
import { AuthMiddleware, VerificarTipo } from "../middlewares/AuthMiddlewares.js";
import { validar } from "../middlewares/validar.js";
import { compraSchema } from "../validations/schemas.js";

const router = Router()

router.use(AuthMiddleware)

router.post("/criar", VerificarTipo(["CLIENTE"]), validar(compraSchema), ComprarItem)
router.get("/historico", VerificarTipo(["CLIENTE", "VENDEDOR", "ADMIN"]), ListarHistorico)

export default router
