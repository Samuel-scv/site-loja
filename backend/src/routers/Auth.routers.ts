import { Router } from "express";
import { Login, Me } from "../controllers/Auth.controllers.js";
import { AuthMiddleware } from "../middlewares/AuthMiddlewares.js";

const router = Router()

router.post("/login", Login)

// dados do usuário logado (qualquer tipo)
router.get("/me", AuthMiddleware, Me)

export default router
