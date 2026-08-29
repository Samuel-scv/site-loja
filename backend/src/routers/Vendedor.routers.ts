import { Router } from "express";
import { CriarVendedor, ListarVendedores, PesquisarVendedor } from "../controllers/Vendedor.controllers.js";
import { AuthMiddleware, VerificarTipo } from "../middlewares/AuthMiddlewares.js";

const router = Router()

// cadastro público
router.post("/criar", CriarVendedor)

router.use(AuthMiddleware)

// SOMENTE ADMIN
router.get("/listar", VerificarTipo(["ADMIN"]), ListarVendedores)
router.get("/pesquisa", VerificarTipo(["ADMIN"]), PesquisarVendedor)

export default router