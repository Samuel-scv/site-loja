import { Router } from "express";
import { AtualizarItem, CriarItem, DeletarItem, ListarItens, PesquisarItem } from "../controllers/Item.controllers.js";
import { AuthMiddleware, VerificarTipo } from "../middlewares/AuthMiddlewares.js";

const router = Router()

// catálogo público
router.get("/listar", ListarItens)
router.get("/pesquisa", PesquisarItem)

// SOMENTE ADMIN
router.post("/criar", AuthMiddleware, VerificarTipo(["ADMIN"]), CriarItem)
router.put("/atualizar/:id", AuthMiddleware, VerificarTipo(["ADMIN"]), AtualizarItem)
router.delete("/deletar/:id", AuthMiddleware, VerificarTipo(["ADMIN"]), DeletarItem)

export default router