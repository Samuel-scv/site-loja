import { Router } from "express";
import { CriarCliente, ListarClientes, PesquisarCliente, RecarregarSaldoCliente } from "../controllers/Cliente.controllers.js";
import { ListarInventarioCliente } from "../controllers/Inventario.controllers.js";
import { AuthMiddleware, VerificarTipo } from "../middlewares/AuthMiddlewares.js";

const router = Router()

// cadastro público
router.post("/criar", CriarCliente)

router.use(AuthMiddleware)

// SOMENTE ADMIN
router.get("/listar", VerificarTipo(["ADMIN"]), ListarClientes)
router.get("/pesquisa", VerificarTipo(["ADMIN"]), PesquisarCliente)
router.patch("/recarregar/:id", VerificarTipo(["ADMIN"]), RecarregarSaldoCliente)

// ADMIN vê qualquer inventário; CLIENTE só o próprio (checado no controller)
router.get("/:id/inventario", VerificarTipo(["ADMIN", "CLIENTE"]), ListarInventarioCliente)

export default router