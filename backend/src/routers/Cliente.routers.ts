import { Router } from "express";
import { CriarCliente, ListarClientes, PesquisarCliente, RecarregarSaldoCliente } from "../controllers/Cliente.controllers.js";
import { ListarInventarioCliente } from "../controllers/Inventario.controllers.js";
import { AuthMiddleware, VerificarTipo } from "../middlewares/AuthMiddlewares.js";
import { validar } from "../middlewares/validar.js";
import { cadastroSchema, idParamSchema, pesquisaSchema, recargaSchema } from "../validations/schemas.js";

const router = Router()

// cadastro público
router.post("/criar", validar(cadastroSchema), CriarCliente)

router.use(AuthMiddleware)

// SOMENTE ADMIN
router.get("/listar", VerificarTipo(["ADMIN"]), ListarClientes)
router.get("/pesquisa", VerificarTipo(["ADMIN"]), validar(pesquisaSchema, "query"), PesquisarCliente)
router.patch("/recarregar/:id", VerificarTipo(["ADMIN"]), validar(idParamSchema, "params"), validar(recargaSchema), RecarregarSaldoCliente)

// ADMIN vê qualquer inventário; CLIENTE só o próprio (checado no controller)
router.get("/:id/inventario", VerificarTipo(["ADMIN", "CLIENTE"]), validar(idParamSchema, "params"), ListarInventarioCliente)

export default router
