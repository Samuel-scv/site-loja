import { Router } from "express";
import { ComprarItem, ListarHistorico } from "../controllers/Compra.controllers.js";
import { AuthMiddleware, VerificarTipo } from "../middlewares/AuthMiddlewares.js";

const router = Router()

router.use(AuthMiddleware)

router.post("/criar", VerificarTipo(["CLIENTE"]), ComprarItem)
router.get("/historico", VerificarTipo(["CLIENTE", "VENDEDOR", "ADMIN"]), ListarHistorico)

export default router