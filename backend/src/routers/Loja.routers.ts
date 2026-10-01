import { Router } from "express";
import { AlternarStatusListagem, AtualizarListagem, CriarListagem, ListarLoja, ListarMinhasListagens, PesquisarLoja } from "../controllers/Loja.controllers.js";
import { AuthMiddleware, VerificarTipo } from "../middlewares/AuthMiddlewares.js";
import { validar } from "../middlewares/validar.js";
import { atualizarListagemSchema, criarListagemSchema, idParamSchema, pesquisaSchema } from "../validations/schemas.js";

const router = Router()

// vitrine pública
router.get("/listar", ListarLoja)
router.get("/pesquisa", validar(pesquisaSchema, "query"), PesquisarLoja)

router.use(AuthMiddleware)

// SOMENTE VENDEDOR (e ADMIN nos ajustes)
router.get("/minhas", VerificarTipo(["VENDEDOR"]), ListarMinhasListagens)
router.post("/criar", VerificarTipo(["VENDEDOR"]), validar(criarListagemSchema), CriarListagem)
router.put("/atualizar/:id", VerificarTipo(["VENDEDOR", "ADMIN"]), validar(idParamSchema, "params"), validar(atualizarListagemSchema), AtualizarListagem)
router.patch("/status/:id", VerificarTipo(["VENDEDOR", "ADMIN"]), validar(idParamSchema, "params"), AlternarStatusListagem)

export default router
