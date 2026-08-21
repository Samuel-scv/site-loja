import { Router } from "express";
import { CriarTenno, ListarTenno, PesquisarTenno, RecarregarSaldo } from "../controllers/Tenno.controllers.js";
import { ListarInventarioTenno } from "../controllers/Inventario.controllers.js";
import { AuthMiddleware, VerificarCargo } from "../middlewares/AuthMiddlewares.js";

const router = Router()

// cadastro do cliente
router.post("/criar", CriarTenno)

// SOMENTE ADMIN
router.get("/listar", AuthMiddleware, VerificarCargo(["ADMIN"]), ListarTenno)
router.get("/pesquisa", AuthMiddleware, VerificarCargo(["ADMIN"]), PesquisarTenno)
router.get("/:id/inventario", AuthMiddleware, VerificarCargo(["ADMIN"]), ListarInventarioTenno)
router.patch("/recarregar/:id", AuthMiddleware, VerificarCargo(["ADMIN"]), RecarregarSaldo)

export default router