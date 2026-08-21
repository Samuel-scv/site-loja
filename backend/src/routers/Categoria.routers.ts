import { Router } from "express";
import { AtualizarCategoria, CriarCategoria, DeletarCategoria, ListarCategorias } from "../controllers/Categoria.controllers.js";
import { AuthMiddleware, VerificarCargo } from "../middlewares/AuthMiddlewares.js";

const router = Router()

// catálogo público
router.get("/listar", ListarCategorias)

// SOMENTE ADMIN
router.post("/criar", AuthMiddleware, VerificarCargo(["ADMIN"]), CriarCategoria)
router.put("/atualizar/:id", AuthMiddleware, VerificarCargo(["ADMIN"]), AtualizarCategoria)
router.delete("/deletar/:id", AuthMiddleware, VerificarCargo(["ADMIN"]), DeletarCategoria)

export default router