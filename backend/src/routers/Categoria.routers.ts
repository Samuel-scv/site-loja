import { Router } from "express";
import { AtualizarCategoria, CriarCategoria, DeletarCategoria, ListarCategorias } from "../controllers/Categoria.controllers.js";
import { AuthMiddleware, VerificarTipo } from "../middlewares/AuthMiddlewares.js";

const router = Router()

// catálogo público
router.get("/listar", ListarCategorias)

// SOMENTE ADMIN
router.post("/criar", AuthMiddleware, VerificarTipo(["ADMIN"]), CriarCategoria)
router.put("/atualizar/:id", AuthMiddleware, VerificarTipo(["ADMIN"]), AtualizarCategoria)
router.delete("/deletar/:id", AuthMiddleware, VerificarTipo(["ADMIN"]), DeletarCategoria)

export default router