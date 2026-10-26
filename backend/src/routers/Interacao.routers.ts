import { Router } from "express";
import { CriarInteracao, DeletarInteracao, InteracoesDoVendedor, ListarTodasInteracoes, MinhasInteracoes, ResponderInteracao } from "../controllers/Interacao.controllers.js";
import { AuthMiddleware, VerificarTipo } from "../middlewares/AuthMiddlewares.js";

const router = Router()

router.use(AuthMiddleware)

// CLIENTE logado: pergunta sobre um item e acompanha as respostas
router.post("/criar", VerificarTipo(["CLIENTE"]), CriarInteracao)
router.get("/minhas", VerificarTipo(["CLIENTE"]), MinhasInteracoes)

// VENDEDOR logado: vê as perguntas feitas sobre os itens que ele vende
router.get("/do-vendedor", VerificarTipo(["VENDEDOR"]), InteracoesDoVendedor)

// SOMENTE ADMIN
router.get("/listar", VerificarTipo(["ADMIN"]), ListarTodasInteracoes)
router.put("/responder/:id", VerificarTipo(["ADMIN"]), ResponderInteracao)
router.delete("/deletar/:id", VerificarTipo(["ADMIN"]), DeletarInteracao)

export default router