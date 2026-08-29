import { Router } from "express";
import { Login } from "../controllers/Auth.controllers.js";

const router = Router()

router.post("/login", Login)

export default router