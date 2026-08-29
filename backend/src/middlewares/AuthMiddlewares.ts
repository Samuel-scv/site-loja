import type { NextFunction, Request, Response } from "express";
import jwt from 'jsonwebtoken'

export type Tipo = "CLIENTE" | "VENDEDOR" | "ADMIN"

export interface AuthRequest extends Request {
    userId?: number,
    tipo?: Tipo
}

export function AuthMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
    const AuthHeader = req.headers.authorization
    if (!AuthHeader || !AuthHeader.startsWith('Bearer')) {
        res.status(403).json({ error: "Token Inválido ou expirado." })
        return
    }

    const token = AuthHeader.split(" ")[1]!
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET as string) as {
            userId: number,
            tipo: Tipo
        }
        req.userId = payload.userId
        req.tipo = payload.tipo

        next()
    } catch (error) {
        res.status(403).json({ error: "Token Inválido ou expirado" })
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