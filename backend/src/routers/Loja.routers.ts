import { Router } from "express";
import { AlternarStatusListagem, AtualizarListagem, CriarListagem, ListarLoja, ListarMinhasListagens, PesquisarLoja } from "../controllers/Loja.controllers.js";
import { AuthMiddleware, VerificarTipo } from "../middlewares/AuthMiddlewares.js";

const router = Router()

// vitrine pública
router.get("/listar", ListarLoja)
router.get("/pesquisa", PesquisarLoja)

router.use(AuthMiddleware)

// SOMENTE VENDEDOR (e ADMIN nos ajustes)
router.get("/minhas", VerificarTipo(["VENDEDOR"]), ListarMinhasListagens)
router.post("/criar", VerificarTipo(["VENDEDOR"]), CriarListagem)
router.put("/atualizar/:id", VerificarTipo(["VENDEDOR", "ADMIN"]), AtualizarListagem)
router.patch("/status/:id", VerificarTipo(["VENDEDOR", "ADMIN"]), AlternarStatusListagem)

export default router