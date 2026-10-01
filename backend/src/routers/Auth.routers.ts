import { Router } from "express";
import { Login, Me } from "../controllers/Auth.controllers.js";
import { AuthMiddleware } from "../middlewares/AuthMiddlewares.js";
import { validar } from "../middlewares/validar.js";
import { loginSchema } from "../validations/schemas.js";

const router = Router()

router.post("/login", validar(loginSchema), Login)

// dados do usuário logado (qualquer tipo)
router.get("/me", AuthMiddleware, Me)

export default router
