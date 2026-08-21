import { Router } from "express";
import { CancelarPedido, ConfirmarPedido, CriarPedido, ListarPedidos } from "../controllers/Pedido.controllers.js";
import { AuthMiddleware, VerificarCargo } from "../middlewares/AuthMiddlewares.js";

const router = Router()

// cliente cria o próprio pedido
router.post("/criar", CriarPedido)

// SOMENTE ADMIN
router.get("/listar", AuthMiddleware, VerificarCargo(["ADMIN"]), ListarPedidos)
router.patch("/confirmar/:id", AuthMiddleware, VerificarCargo(["ADMIN"]), ConfirmarPedido)
router.patch("/cancelar/:id", AuthMiddleware, VerificarCargo(["ADMIN"]), CancelarPedido)

export default router