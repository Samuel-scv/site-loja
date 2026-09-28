import type { NextFunction, Request, Response } from "express";
import jwt from 'jsonwebtoken'

export type Tipo = "CLIENTE" | "VENDEDOR" | "ADMIN"

export interface AuthRequest extends Request {
    userId?: number,
    tipo?: Tipo
}

export function AuthMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
    const segredo = process.env.JWT_SECRET
    if (!segredo) {
        console.error("JWT_SECRET não definido no .env")
        res.status(500).json({ error: "Erro de configuração do servidor." })
        return
    }

    const AuthHeader = req.headers.authorization
    if (!AuthHeader || !AuthHeader.startsWith('Bearer ')) {
        res.status(403).json({ error: "Token Inválido ou expirado." })
        return
    }

    const token = AuthHeader.split(" ")[1]
    if (!token) {
        res.status(403).json({ error: "Token Inválido ou expirado." })
        return
    }

    try {
        // só aceita o algoritmo que o jwt.sign usa por padrão
        const payload = jwt.verify(token, segredo, { algorithms: ["HS256"] }) as {
            userId: number,
            tipo: Tipo
        }
        req.userId = payload.userId
        req.tipo = payload.tipo

        next()
    } catch (error) {
        res.status(403).json({ error: "Token Inválido ou expirado." })
        return
    }
}

export function VerificarTipo(tiposPermitidos: Tipo[]) {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.tipo) {
            res.status(403).json({ error: "acesso negado: tipo de usuário não identificado." })
            return
        }
        if (!tiposPermitidos.includes(req.tipo)) {
            res.status(403).json({ error: "acesso negado: você não pode concluir essa ação." })
            return
        }
        next()
    }
}