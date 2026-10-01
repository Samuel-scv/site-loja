import { Router } from "express";
import { CriarVendedor, ListarVendedores, PesquisarVendedor } from "../controllers/Vendedor.controllers.js";
import { AuthMiddleware, VerificarTipo } from "../middlewares/AuthMiddlewares.js";
import { validar } from "../middlewares/validar.js";
import { cadastroSchema, pesquisaSchema } from "../validations/schemas.js";

const router = Router()

// cadastro público
router.post("/criar", validar(cadastroSchema), CriarVendedor)

router.use(AuthMiddleware)

// SOMENTE ADMIN
router.get("/listar", VerificarTipo(["ADMIN"]), ListarVendedores)
router.get("/pesquisa", VerificarTipo(["ADMIN"]), validar(pesquisaSchema, "query"), PesquisarVendedor)

export default router
