import { Router } from "express";
import { Login } from "../controllers/Auth.controllers.js";
import { CriarUsuario, ListarUsuario } from "../controllers/Usuario.controllers.js";
import { AuthMiddleware, VerificarCargo } from "../middlewares/AuthMiddlewares.js";

const router = Router()

router.post("/login", Login)

router.use(AuthMiddleware)

router.get("/listar", VerificarCargo(["ADMIN"]), ListarUsuario)
router.post("/criar", VerificarCargo(["ADMIN"]), CriarUsuario)

export default router