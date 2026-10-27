import { Router } from "express";
import { AdicionarSaldoProprio, CriarCliente, ListarClientes, PesquisarCliente, RecarregarSaldoCliente } from "../controllers/Cliente.controllers.js";
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

// CLIENTE: adiciona saldo na própria conta
router.patch("/adicionar-saldo", VerificarTipo(["CLIENTE"]), AdicionarSaldoProprio)

// ADMIN vê qualquer inventário; CLIENTE só o próprio (checado no controller)
router.get("/:id/inventario", VerificarTipo(["ADMIN", "CLIENTE"]), ListarInventarioCliente)

export default router