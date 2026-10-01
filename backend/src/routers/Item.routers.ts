import { Router } from "express";
import { AtualizarItem, CriarItem, DeletarItem, ListarItens, PesquisarItem } from "../controllers/Item.controllers.js";
import { AuthMiddleware, VerificarTipo } from "../middlewares/AuthMiddlewares.js";
import { validar } from "../middlewares/validar.js";
import { atualizarItemSchema, criarItemSchema, idParamSchema, pesquisaSchema } from "../validations/schemas.js";

const router = Router()

// catálogo público
router.get("/listar", ListarItens)
router.get("/pesquisa", validar(pesquisaSchema, "query"), PesquisarItem)

// SOMENTE ADMIN
router.post("/criar", AuthMiddleware, VerificarTipo(["ADMIN"]), validar(criarItemSchema), CriarItem)
router.put("/atualizar/:id", AuthMiddleware, VerificarTipo(["ADMIN"]), validar(idParamSchema, "params"), validar(atualizarItemSchema), AtualizarItem)
router.delete("/deletar/:id", AuthMiddleware, VerificarTipo(["ADMIN"]), validar(idParamSchema, "params"), DeletarItem)

export default router
