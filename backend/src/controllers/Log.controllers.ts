import type { Request, Response } from "express"
import { prisma } from "../../lib/prisma.js"

// Aceita ?pagina=1&limite=50 (limite máximo 100). Sem parâmetros, devolve os 50 mais recentes.
export async function ListarLogs(req: Request, res: Response) {
    try {
        const pagina = Math.max(1, Math.floor(Number(req.query.pagina)) || 1)
        const limite = Math.min(100, Math.max(1, Math.floor(Number(req.query.limite)) || 50))

        const listar = await prisma.log.findMany({
            include: {
                cliente: { select: { nome: true } },
                vendedor: { select: { nome: true } },
                admin: { select: { nome: true } }
            },
            orderBy: { createdAt: 'desc' },
            skip: (pagina - 1) * limite,
            take: limite
        })
        res.status(200).json(listar)
    } catch (error) {
        res.status(400).json({ error: "Falha ao listar logs." })
        return
    }
}
