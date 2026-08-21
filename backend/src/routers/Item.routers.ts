import { Router } from "express";
import { AlternarStatusItem, AtualizarItem, CriarItem, ListarItens, PesquisarItem } from "../controllers/Item.controllers.js";
import { AuthMiddleware, VerificarCargo } from "../middlewares/AuthMiddlewares.js";

const router = Router()

// catálogo público
router.get("/listar", ListarItens)
router.get("/pesquisa", PesquisarItem)

// SOMENTE ADMIN
router.post("/criar", AuthMiddleware, VerificarCargo(["ADMIN"]), CriarItem)
router.put("/atualizar/:id", AuthMiddleware, VerificarCargo(["ADMIN"]), AtualizarItem)
router.patch("/status/:id", AuthMiddleware, VerificarCargo(["ADMIN"]), AlternarStatusItem)

export default router