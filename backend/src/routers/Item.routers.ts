import { Router } from "express";
import { AtualizarItem, BuscarItem, CriarItem, DeletarItem, GerarDadosIA, ListarDestaques, ListarItens, ListarRecentes, ObterDadosIA, PesquisarItem } from "../controllers/Item.controllers.js";
import { AuthMiddleware, VerificarTipo } from "../middlewares/AuthMiddlewares.js";

const router = Router()

// catálogo público (as rotas fixas vêm antes de /:id)
router.get("/listar", ListarItens)
router.get("/pesquisa", PesquisarItem)
router.get("/destaques", ListarDestaques)
router.get("/recentes", ListarRecentes)
router.get("/:id/ia", ObterDadosIA)
router.get("/:id", BuscarItem)

// SOMENTE ADMIN
router.post("/criar", AuthMiddleware, VerificarTipo(["ADMIN"]), CriarItem)
router.put("/atualizar/:id", AuthMiddleware, VerificarTipo(["ADMIN"]), AtualizarItem)
router.post("/gerar-ia/:id", AuthMiddleware, VerificarTipo(["ADMIN"]), GerarDadosIA)
router.delete("/deletar/:id", AuthMiddleware, VerificarTipo(["ADMIN"]), DeletarItem)

export default router
