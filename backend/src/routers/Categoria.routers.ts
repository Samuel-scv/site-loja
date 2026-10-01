import { Router } from "express";
import { AtualizarCategoria, CriarCategoria, DeletarCategoria, ListarCategorias } from "../controllers/Categoria.controllers.js";
import { AuthMiddleware, VerificarTipo } from "../middlewares/AuthMiddlewares.js";
import { validar } from "../middlewares/validar.js";
import { categoriaSchema, idParamSchema } from "../validations/schemas.js";

const router = Router()

// catálogo público
router.get("/listar", ListarCategorias)

// SOMENTE ADMIN
router.post("/criar", AuthMiddleware, VerificarTipo(["ADMIN"]), validar(categoriaSchema), CriarCategoria)
router.put("/atualizar/:id", AuthMiddleware, VerificarTipo(["ADMIN"]), validar(idParamSchema, "params"), validar(categoriaSchema), AtualizarCategoria)
router.delete("/deletar/:id", AuthMiddleware, VerificarTipo(["ADMIN"]), validar(idParamSchema, "params"), DeletarCategoria)

export default router
